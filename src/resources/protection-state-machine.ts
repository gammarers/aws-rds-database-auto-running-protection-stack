import { Duration, Stack } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

export interface ProtectionStateMachineProps extends sfn.StateMachineProps {
  notificationTopic: sns.ITopic;
}

export class ProtectionStateMachine extends sfn.StateMachine {
  constructor(scope: Construct, id: string, props: ProtectionStateMachineProps) {
    super(scope, id, {
      ...props,
      definitionBody: (() => {

        // 👇 Get AWS account
        const account = Stack.of(scope).account;
        //const region = Stack.of(this).region;

        const stringMappingDefinition = new sfn.Pass(scope, 'StringMappingDefinition', {
          result: sfn.Result.fromObject({
            SourceType: [
              { key: 'CLUSTER', value: 'Cluster' },
              { key: 'DB_INSTANCE', value: 'Instance' },
            ],
          }),
          resultPath: '$.definition.mapping',
        });

        const prepareTopicValue = new sfn.Pass(scope, 'PrepareTopicValue', {
          resultPath: '$.prepare.topic.values',
          parameters: {
            account: sfn.JsonPath.arrayGetItem(sfn.JsonPath.stringSplit(sfn.JsonPath.stringAt('$.event.detail.SourceArn'), ':'), 4), // account
            region: sfn.JsonPath.arrayGetItem(sfn.JsonPath.stringSplit(sfn.JsonPath.stringAt('$.event.detail.SourceArn'), ':'), 3), // region
          },
        });

        // 👇 Generate aws web console link
        const generateConsoleLink = new sfn.Pass(scope, 'GenerateConsoleLink', {
          resultPath: '$.Generate.Link',
          parameters: {
            Value: sfn.JsonPath.format('https://{}.console.aws.amazon.com/rds/home#database',
              sfn.JsonPath.stringAt('$.prepare.topic.values.region'),
            ),
          },
        });
        prepareTopicValue.next(generateConsoleLink);

        // 👇 Generate topic message
        const generateTopicMessage = new sfn.Pass(scope, 'GenerateTopicMessage', {
          resultPath: '$.Generate.Topic',
          parameters: {
            Subject: sfn.JsonPath.format('😴 [STOPPED] AWS RDS DB {} Auto Running Protected Notification [{}][{}]',
              sfn.JsonPath.arrayGetItem(sfn.JsonPath.stringAt('$.definition.mapping.SourceType[?(@.key == $.event.detail.SourceType)].value'), 0),
              sfn.JsonPath.stringAt('$.prepare.topic.values.account'),
              sfn.JsonPath.stringAt('$.prepare.topic.values.region'),
            ),
            TextMessage: sfn.JsonPath.format('Account : {}\nRegion : {}\nType : {}\nIdentifier : {}',
              sfn.JsonPath.stringAt('$.prepare.topic.values.account'),
              sfn.JsonPath.stringAt('$.prepare.topic.values.region'),
              sfn.JsonPath.stringAt('$.event.detail.SourceType'),
              sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
            ),
            SlackJsonMessage: {
              attachments: [
                {
                  color: '#36a64f',
                  pretext: sfn.JsonPath.format('AWS RDS DB {} Auto Running Protected Notification',
                    sfn.JsonPath.stringAt('$.event.detail.SourceType'),
                  ),
                  title: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
                  title_link: sfn.JsonPath.stringAt('$.Generate.Link.Value'),
                  text: sfn.JsonPath.format('AWS RDS DB {} {} Auto Running Protected',
                    sfn.JsonPath.stringAt('$.event.detail.SourceType'),
                    sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
                  ),
                  fields: [
                    {
                      title: 'Account',
                      value: sfn.JsonPath.stringAt('$.prepare.topic.values.account'),
                      short: true,
                    },
                    {
                      title: 'Region',
                      value: sfn.JsonPath.stringAt('$.prepare.topic.values.region'),
                      short: true,
                    },
                    {
                      title: 'Type',
                      value: sfn.JsonPath.stringAt('$.event.detail.SourceType'),
                      short: true,
                    },
                    {
                      title: 'Identifier',
                      value: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
                      short: true,
                    },
                  ],
                },
              ],
            },
          },
        });
        generateConsoleLink.next(generateTopicMessage);

        // 👇 SNS Topic Publish
        const publishMessage = new tasks.SnsPublish(scope, 'PublishMessage', {
          topic: props.notificationTopic,
          subject: sfn.JsonPath.stringAt('$.Generate.Topic.Subject'),
          message: sfn.TaskInput.fromObject({
            default: sfn.JsonPath.stringAt('$.Generate.Topic.TextMessage'),
            email: sfn.JsonPath.stringAt('$.Generate.Topic.TextMessage'),
            lambda: sfn.JsonPath.stringAt('$.Generate.Topic.SlackJsonMessage'),
          }),
          messagePerSubscriptionType: true,
          resultPath: '$.snsResult',
        });
        generateTopicMessage.next(publishMessage);

        const succeed = new sfn.Succeed(scope, 'Succeed');

        publishMessage.next(succeed);

        const startingWait = new sfn.Wait(scope, 'StartingWait', {
          time: sfn.WaitTime.duration(Duration.minutes(1)),
        });

        startingWait.next(stringMappingDefinition);

        const describeDBInstancesTask = new tasks.CallAwsService(scope, 'DescribeDBInstances', {
          iamResources: [`arn:aws:rds:*:${account}:db:*`],
          service: 'rds',
          action: 'describeDBInstances',
          parameters: {
            DbInstanceIdentifier: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
          },
          resultPath: '$.result.describe',
          resultSelector: {
            status: sfn.JsonPath.stringAt('$.DbInstances[0].DbInstanceStatus'),
            identifier: sfn.JsonPath.stringAt('$.DbInstances[0].DbInstanceIdentifier'),
            tags: sfn.JsonPath.stringAt('$.DbInstances[0].TagList'),
          },
        });

        const stopDBInstanceTask = new tasks.CallAwsService(scope, 'StopDBInstance', {
          iamResources: [`arn:aws:rds:*:${account}:db:*`],
          service: 'rds',
          action: 'stopDBInstance',
          parameters: {
            DbInstanceIdentifier: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
          },
          resultPath: '$.result.stop',
        });

        const describeDBClustersTask = new tasks.CallAwsService(scope, 'DescribeDBClusters', {
          iamResources: [`arn:aws:rds:*:${account}:cluster:*`],
          service: 'rds',
          action: 'describeDBClusters',
          parameters: {
            DbClusterIdentifier: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
          },
          resultPath: '$.result.describe',
          resultSelector: {
            status: sfn.JsonPath.stringAt('$.DbClusters[0].Status'),
            identifier: sfn.JsonPath.stringAt('$.DbClusters[0].DbClusterIdentifier'),
            tags: sfn.JsonPath.stringAt('$.DbClusters[0].TagList'),
          },
        });

        const stopDBClusterTask = new tasks.CallAwsService(scope, 'StopDBCluster', {
          iamResources: [`arn:aws:rds:*:${account}:cluster:*`],
          service: 'rds',
          action: 'stopDBCluster',
          parameters: {
            DbClusterIdentifier: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
          },
          resultPath: '$.result.stop',
        });

        const describeTypeChoice = new sfn.Choice(scope, 'DescribeTypeChoice')
          .when(
            sfn.Condition.and(
              sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Instance Event'),
              sfn.Condition.stringEquals('$.event.detail.SourceType', 'DB_INSTANCE'),
              sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0154'),
            ),
            describeDBInstancesTask,
          )
          .when(
            sfn.Condition.and(
              sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Cluster Event'),
              sfn.Condition.stringEquals('$.event.detail.SourceType', 'CLUSTER'),
              sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0153'),
            ),
            describeDBClustersTask,
          )
          .otherwise(new sfn.Fail(scope, 'UnknownType'));

        stringMappingDefinition.next(describeTypeChoice);

        const statusChangeWait = new sfn.Wait(scope, 'StatusChangeWait', {
          time: sfn.WaitTime.duration(Duration.minutes(5)),
        });

        statusChangeWait.next(describeTypeChoice);

        stopDBInstanceTask.next(statusChangeWait);

        stopDBClusterTask.next(statusChangeWait);

        // 👇 Status Choice
        const statusChoice = new sfn.Choice(scope, 'StatusChoice')
          // db instance stop on status.available
          .when(
            sfn.Condition.and(
              sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Instance Event'),
              sfn.Condition.stringEquals('$.event.detail.SourceType', 'DB_INSTANCE'),
              sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0154'),
              sfn.Condition.stringEquals('$.result.describe.status', 'available'),
            ),
            stopDBInstanceTask,
          )
          // db cluster stop on status.available
          .when(
            sfn.Condition.and(
              sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Cluster Event'),
              sfn.Condition.stringEquals('$.event.detail.SourceType', 'CLUSTER'),
              sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0153'),
              sfn.Condition.stringEquals('$.result.describe.status', 'available'),
            ),
            stopDBClusterTask,
          )
          .when(
            sfn.Condition.and(
              sfn.Condition.or(
                sfn.Condition.and(
                  sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Instance Event'),
                  sfn.Condition.stringEquals('$.event.detail.SourceType', 'DB_INSTANCE'),
                  sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0154'),
                ),
                sfn.Condition.and(
                  sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Cluster Event'),
                  sfn.Condition.stringEquals('$.event.detail.SourceType', 'CLUSTER'),
                  sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0153'),
                ),
              ),
              sfn.Condition.stringEquals('$.result.describe.status', 'stopped'),
            ),
            prepareTopicValue, // generated & publish message
          )
          .when(
            sfn.Condition.or(
              sfn.Condition.stringEquals('$.result.describe.status', 'starting'),
              sfn.Condition.stringEquals('$.result.describe.status', 'configuring-enhanced-monitoring'),
              sfn.Condition.stringEquals('$.result.describe.status', 'backing-up'),
              sfn.Condition.stringEquals('$.result.describe.status', 'modifying'),
              sfn.Condition.stringEquals('$.result.describe.status', 'stopping'),
            ),
            statusChangeWait,
          )
          .otherwise(new sfn.Fail(scope, 'StatusFail', {
            cause: 'db instance or cluster status fail.',
          }));

        // 👇 Tag Match
        const tagMatchChoice = new sfn.Choice(scope, 'ExistTagChoide')
          .when(
            sfn.Condition.isPresent('$.result.describe.tags'),
            new sfn.Pass(scope, 'ContainTagVlue', {
              resultPath: '$.check.tag',
              parameters: {
                isContain: sfn.JsonPath.arrayContains(
                  sfn.JsonPath.stringAt('$.params.tagValues'),
                  sfn.JsonPath.arrayGetItem(sfn.JsonPath.stringAt('$.result.describe.tags[?(@.Key == $.params.tagKey)].Value'), 0),
                ),
              },
            }).next(
              new sfn.Choice(scope, 'FilterTagChoise')
                .when(
                  sfn.Condition.booleanEquals('$.check.tag.isContain', true),
                  statusChoice,
                )
                .otherwise(
                  new sfn.Pass(scope, 'NoTagMatch', {
                    comment: 'no tag match',
                  }),
                ),
            ),
          )
          .otherwise(
            new sfn.Pass(scope, 'NoTagsFound', {
              comment: 'no tags found',
            }),
          );

        // 👇 describe next tag found & match
        describeDBInstancesTask.next(tagMatchChoice);
        describeDBClustersTask.next(tagMatchChoice);

        return sfn.DefinitionBody.fromChainable(startingWait);
      })(),
    });
  }
}