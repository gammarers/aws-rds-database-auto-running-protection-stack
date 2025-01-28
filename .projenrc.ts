import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'yicr',
  authorAddress: 'yicr@users.noreply.github.com',
  cdkVersion: '2.120.0',
  defaultReleaseBranch: 'main',
  typescriptVersion: '5.7.x',
  jsiiVersion: '5.7.x',
  name: '@gammarers/aws-rds-database-auto-running-protection-stack',
  description: 'This construct is aws rds database or cluster auto running to stop.',
  keywords: ['aws', 'cdk', 'aws-cdk', 'rds', 'run', 'auto', 'stop'],
  projenrcTs: true,
  repositoryUrl: 'https://github.com/gammarers/aws-rds-database-auto-running-protection-stack.git',
  authorOrganization: true,
  deps: [
    '@gammarers/aws-resource-naming@^0.10.1',
    '@gammarers/aws-sns-slack-message-lambda-subscription@^0.2.4',
  ],
  peerDeps: [
    '@gammarers/aws-resource-naming@^0.10.1',
    '@gammarers/aws-sns-slack-message-lambda-subscription@^0.2.4',
  ],
  releaseToNpm: true,
  npmAccess: javascript.NpmAccess.PUBLIC,
  majorVersion: 2,
  minNodeVersion: '18.0.0',
  workflowNodeVersion: '22.x',
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      schedule: javascript.UpgradeDependenciesSchedule.expressions(['0 19 * * 3']),
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['yicr'],
  },
  publishToPypi: {
    distName: 'gammarers.aws-rds-database-auto-running-protection-stack',
    module: 'gammarers.aws_rds_database_auto_running_protection_stack',
  },
  publishToNuget: {
    dotNetNamespace: 'Gammarers.CDK.AWS',
    packageId: 'Gammarers.CDK.AWS.RDSDatabaseAutoRunningProtectionStack',
  },
});
project.synth();