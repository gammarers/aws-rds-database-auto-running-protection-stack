import { awscdk, javascript, github } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'yicr',
  authorAddress: 'yicr@users.noreply.github.com',
  cdkVersion: '2.232.0',
  defaultReleaseBranch: 'main',
  typescriptVersion: '5.9.x',
  jsiiVersion: '5.9.x',
  name: 'aws-rds-database-auto-start-preventer',
  description: 'This construct is aws rds database or cluster auto running to stop.',
  keywords: ['aws', 'cdk', 'aws-cdk', 'rds', 'run', 'auto', 'stop'],
  projenrcTs: true,
  repositoryUrl: 'https://github.com/gammarers-aws-cdk-constructs/aws-rds-database-auto-start-preventer.git',
  devDeps: [
    '@aws/durable-execution-sdk-js@^1',
    '@aws-sdk/client-lambda@^3',
    '@aws-sdk/client-rds@^3',
    '@aws-sdk/client-resource-groups-tagging-api@^3',
    '@slack/web-api@^6',
    '@types/aws-lambda@^8',
    'aws-lambda-secret-fetcher@^0.3',
    'aws-sdk-client-mock@^2',
    'aws-sdk-client-mock-jest@^2',
  ],
  releaseToNpm: false,
  npmAccess: javascript.NpmAccess.PUBLIC,
  majorVersion: 3,
  minNodeVersion: '20.0.0',
  workflowNodeVersion: '24.x',
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      schedule: javascript.UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  githubOptions: {
    projenCredentials: github.GithubCredentials.fromApp({
      permissions: {
        pullRequests: github.workflows.AppPermission.WRITE,
        contents: github.workflows.AppPermission.WRITE,
      },
    }),
  },
  autoApproveOptions: {
    allowedUsernames: [
      'gammarers-projen-upgrade-bot[bot]',
      'yicr',
    ],
  },
  // publishToPypi: {
  //   distName: 'gammarers.aws-rds-database-auto-running-protection-stack',
  //   module: 'gammarers.aws_rds_database_auto_running_protection_stack',
  // },
  // publishToNuget: {
  //   dotNetNamespace: 'Gammarers.CDK.AWS',
  //   packageId: 'Gammarers.CDK.AWS.RDSDatabaseAutoRunningProtectionStack',
  // },
});
project.synth();