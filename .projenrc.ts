import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'yicr',
  authorAddress: 'yicr@users.noreply.github.com',
  cdkVersion: '2.80.0',
  constructsVersion: '10.0.5',
  defaultReleaseBranch: 'main',
  typescriptVersion: '5.1.x',
  jsiiVersion: '5.1.x',
  name: '@gammarer/aws-rds-database-auto-running-stopper',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/gammarer/aws-rds-database-auto-running-stopper.git',
  authorOrganization: true,
  releaseToNpm: true,
  npmAccess: javascript.NpmAccess.PUBLIC,
  majorVersion: 1,
  minNodeVersion: '18.0.0',
  workflowNodeVersion: '20.11.x',
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