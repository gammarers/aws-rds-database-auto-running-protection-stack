import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { RDSDatabaseAutoRunningProtectionStack } from '../src';

describe('Stack Disabble Testing', () => {

  const app = new App();

  const stack = new RDSDatabaseAutoRunningProtectionStack(app, 'RDSDatabaseAutoRunningProtectionStack', {
    enableRule: false,
    targetResource: {
      tagKey: 'AutoRunningStop',
      tagValues: ['YES'],
    },
    env: {
      account: '123456789012',
      region: 'us-east-1',
    },
  });

  const template = Template.fromStack(stack);

  it('Should match snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

});
