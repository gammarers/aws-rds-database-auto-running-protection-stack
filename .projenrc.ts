import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'yicr',
  authorAddress: 'yicr@users.noreply.github.com',
  cdkVersion: '2.120.0',
  defaultReleaseBranch: 'main',
  typescriptVersion: '5.5.x',
  jsiiVersion: '5.5.x',
  name: '@gammarers/aws-rds-database-auto-running-protection-stack',
  description: 'This construct is aws rds database or cluster auto running to stop.',
  keywords: ['aws', 'cdk', 'aws-cdk', 'rds', 'run', 'auto', 'stop'],
  projenrcTs: true,
  repositoryUrl: 'https://github.com/gammarers/aws-rds-database-auto-running-protection-stack.git',
  authorOrganization: true,
  releaseToNpm: true,
  npmAccess: javascript.NpmAccess.PUBLIC,
  majorVersion: 2,
  minNodeVersion: '18.0.0',
  workflowNodeVersion: '22.4.x',
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
});
project.synth();