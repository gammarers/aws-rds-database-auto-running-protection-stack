import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'yicr',
  authorAddress: 'yicr@users.noreply.github.com',
  cdkVersion: '2.62.0',
  defaultReleaseBranch: 'main',
  typescriptVersion: '5.1.x',
  jsiiVersion: '5.1.0',
  name: 'aws-rds-database-auto-running-stopper',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/higa/aws-rds-database-auto-running-stopper.git',
  releaseToNpm: false,
  npmAccess: javascript.NpmAccess.PUBLIC,
  depsUpgrade: false,
});
project.synth();