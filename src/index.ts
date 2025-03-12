import { ResourceAutoNaming, ResourceDefaultNaming, ResourceNaming, ResourceNamingType as RDSDatabaseAutoRunningProtectionStackResourceNamingType } from '@gammarers/aws-resource-naming';
import { SNSSlackMessageLambdaSubscription } from '@gammarers/aws-sns-slack-message-lambda-subscription';
import { Names, Stack, StackProps } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';
import { ProtectionStateMachine } from './resources/protection-state-machine';

export { RDSDatabaseAutoRunningProtectionStackResourceNamingType };

export interface TargetResource {
  readonly tagKey: string;
  readonly tagValues: string[];
}

export interface Slack {
  readonly webhookSecretName: string;
}

export interface Notifications {
  readonly emails?: string[];
  readonly slack?: Slack;
}

export type MachineLogLevel = sfn.LogLevel;

export interface LogOption {
  readonly machineLogLevel?: MachineLogLevel;
}

export interface RDSDatabaseAutoRunningProtectionStackProps extends StackProps {
  readonly targetResource: TargetResource;
  readonly enableRule?: boolean;
  readonly notifications?: Notifications;
  readonly resourceNamingOption?: ResourceNamingOption;
  readonly logOption?: LogOption;
}

export interface ResourceCustomNaming {
  readonly type: RDSDatabaseAutoRunningProtectionStackResourceNamingType.CUSTOM;
  readonly stateMachineName: string;
  readonly stateMachineRoleName: string;
  readonly startEventCatchRuleRoleName: string;
  readonly startInstanceEventCatchRuleName: string;
  readonly startClusterEventCatchRuleName: string;
}

export type ResourceNamingOption = ResourceDefaultNaming | ResourceAutoNaming | ResourceCustomNaming;

export class RDSDatabaseAutoRunningProtectionStack extends Stack {
  constructor(scope: Construct, id: string, props: RDSDatabaseAutoRunningProtectionStackProps) {
    super(scope, id, props);

    // 👇 Create random 8 length string
    const random = ResourceNaming.createRandomString(`${Names.uniqueId(scope)}.${Names.uniqueId(this)}`);
    // 👇 Auto naeming
    const autoNaming = {
      stateMachineName: `rds-db-auto-running-stop-${random}-state-machine`,
      stateMachineRoleName: `rds-db-auto-running-stop-state-machine-${random}-role`,
      startEventCatchRuleRoleName: `rds-db-auto-running-catch-event-${random}-role`,
      startInstanceEventCatchRuleName: `rds-db-instance-running-event-catch-${random}-rule`,
      startClusterEventCatchRuleName: `rds-db-cluster-running-event-catch-${random}-rule`,
    };
    const names = ResourceNaming.naming(autoNaming, props.resourceNamingOption as ResourceNaming.ResourceNamingOption);

    // 👇 SNS Topic for notifications
    const topic: sns.Topic = new sns.Topic(this, 'NotificationTopic', {
      topicName: names.notificationTopicName,
      displayName: names.notificationTopicDisplayName,
    });

    // 👇 Subscribe an email endpoint to the topic
    const emails = props.notifications?.emails ?? [];
    for (const email of emails) {
      topic.addSubscription(new subscriptions.EmailSubscription(email));
    }

    // 👇 Subscription slack webhook
    if (props.notifications?.slack) {
      new SNSSlackMessageLambdaSubscription(this, 'SNSSlackMessageLambdaSubscription', {
        topic,
        slackWebhookSecretName: props.notifications.slack.webhookSecretName,
      });
    }

    // 👇 StepFunctions
    const stateMachine = new ProtectionStateMachine(this, 'StateMachine', {
      stateMachineName: names.stateMachineName,
      notificationTopic: topic,
      logs: (() => {
        if (props.logOption?.machineLogLevel) {
          return {
            destination: new logs.LogGroup(this, 'StateMachineLogGroup', {
              logGroupName: (() => {
                if (names.stateMachineName) {
                  return `/aws/states/${names.stateMachineName}`;
                }
                return undefined;
              })(),
            }),
            level: props.logOption.machineLogLevel,
          };
        }
        return undefined;
      })(),
    });
    if (names.stateMachineRoleName) {
      const role = stateMachine.node.findChild('Role') as iam.Role;
      const cfnRole = role.node.defaultChild as iam.CfnRole;
      cfnRole.addPropertyOverride('RoleName', names.stateMachineRoleName);
      cfnRole.addPropertyOverride('Description', 'rds database auto running stop state machine role.');
      const policy = role.node.findChild('DefaultPolicy') as iam.Policy;
      const cfnPolicy = policy.node.defaultChild as iam.CfnPolicy;
      cfnPolicy.addPropertyOverride('PolicyName', `rds-db-auto-running-stop-state-machine-${random}-policy`);
    }

    const execRole = new iam.Role(this, 'EventExecRole', {
      roleName: names.startEventCatchRuleRoleName,
      description: 'db auto start catch with start state machine event role',
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
      inlinePolicies: {
        'state-machine-exec': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'states:StartExecution',
              ],
              resources: [
                stateMachine.stateMachineArn,
              ],
            }),
          ],
        }),
      },
    });

    const enableRule: boolean = (() => {
      return props.enableRule === undefined || props.enableRule;
    })();

    // 👇 EventBridge by RDS DB Instance Auto Start Event
    new events.Rule(this, 'DBInstanceEvent', {
      ruleName: names.startInstanceEventCatchRuleName,
      description: 'rds db instance running event catch rule.',
      enabled: enableRule,
      eventPattern: {
        source: ['aws.rds'],
        detailType: ['RDS DB Instance Event'],
        detail: {
          EventID: ['RDS-EVENT-0154'],
        },
      },
      targets: [
        new targets.SfnStateMachine(stateMachine, {
          role: execRole,
          input: events.RuleTargetInput.fromObject({
            event: events.EventField.fromPath('$'),
            params: {
              tagKey: props.targetResource.tagKey,
              tagValues: props.targetResource.tagValues,
            },
          }),
        }),
      ],
    });

    // 👇 EventBridge by RDS DB Instance Auto Start Event
    new events.Rule(this, 'DBClusterEvent', {
      ruleName: names.startClusterEventCatchRuleName,
      description: 'db cluster running event catch rule',
      enabled: enableRule,
      eventPattern: {
        source: ['aws.rds'],
        detailType: ['RDS DB Cluster Event'],
        detail: {
          EventID: ['RDS-EVENT-0153'],
        },
      },
      targets: [
        new targets.SfnStateMachine(stateMachine, {
          role: execRole,
          input: events.RuleTargetInput.fromObject({
            event: events.EventField.fromPath('$'),
            params: {
              tagKey: props.targetResource.tagKey,
              tagValues: props.targetResource.tagValues,
            },
          }),
        }),
      ],
    });
  }
}