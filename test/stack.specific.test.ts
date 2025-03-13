import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { RDSDatabaseAutoRunningProtectionStack, RDSDatabaseAutoRunningProtectionStackResourceNamingType, RDSDatabaseAutoRunningProtectionStackMachineLogLevel } from '../src';

describe('Stack Specific Testing', () => {

  const app = new App();

  const stack = new RDSDatabaseAutoRunningProtectionStack(app, 'RDSDatabaseAutoRunningProtectionStack', {
    env: {
      account: '123456789012',
      region: 'us-east-1',
    },
    targetResource: {
      tagKey: 'AutoRunningStop',
      tagValues: ['YES'],
    },
    notifications: {
      emails: [
        'foo@example.com',
        'bar@example.com',
      ],
      slack: {
        webhookSecretName: 'example/slack/webhook',
      },
    },
    resourceNamingOption: {
      type: RDSDatabaseAutoRunningProtectionStackResourceNamingType.AUTO,
    },
    logOption: {
      machineLogLevel: RDSDatabaseAutoRunningProtectionStackMachineLogLevel.ALL,
    },
  });

  const template = Template.fromStack(stack);

  it('Should match state machine', () => {
    template.hasResourceProperties('AWS::StepFunctions::StateMachine', Match.objectEquals({
      StateMachineName: Match.anyValue(),
      DefinitionString: Match.anyValue(),
      RoleArn: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('StateMachineRole'),
          'Arn',
        ],
      },
      LoggingConfiguration: {
        Destinations: [
          {
            CloudWatchLogsLogGroup: {
              LogGroupArn: {
                'Fn::GetAtt': [
                  Match.stringLikeRegexp('StateMachineLogGroup'),
                  'Arn',
                ],
              },
            },
          },
        ],
        Level: 'ALL',
      },
    }));
  });

  it('Should match snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

});
