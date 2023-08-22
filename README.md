[![GitHub](https://img.shields.io/github/license/yicr/aws-rds-database-auto-running-stopper?style=flat-square)](https://github.com/yicr/aws-rds-database-auto-running-stopper/blob/main/LICENSE)
[![npm (scoped)](https://img.shields.io/npm/v/@gammarer/aws-rds-database-auto-running-stopper?style=flat-square)](https://www.npmjs.com/package/@gammarer/aws-rds-database-auto-running-stopper)
<!-- [![PyPI](https://img.shields.io/pypi/v/gammarer.aws-rds-database-auto-running-stopper?style=flat-square)](https://pypi.org/project/gammarer.aws-rds-database-auto-running-stopper/)  -->
<!-- [![Nuget](https://img.shields.io/nuget/v/Gammarer.CDK.AWS.RdsDatabaseAutoRunningStopper?style=flat-square)](https://www.nuget.org/packages/Gammarer.CDK.AWS.RdsDatabaseAutoRunningStopper/)  -->
<!-- [![Sonatype Nexus (Releases)](https://img.shields.io/nexus/r/com.gammarer/aws-rds-database-auto-running-stopper?server=https%3A%2F%2Fs01.oss.sonatype.org%2F&style=flat-square)](https://s01.oss.sonatype.org/content/repositories/releases/com/gammarer/aws-rds-database-auto-running-stopper/) -->
[![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/yicr/aws-rds-database-auto-running-stopper/release.yml?branch=main&label=release&style=flat-square)](https://github.com/yicr/aws-rds-database-auto-running-stopper/actions/workflows/release.yml)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/yicr/aws-rds-database-auto-running-stopper?sort=semver&style=flat-square)](https://github.com/yicr/aws-rds-database-auto-running-stopper/releases)


# AWS RDS Database Auto Running Stopper

## Resources

This construct creating resource list.

- StepFunctions(StateMachine)
- IAM Role (StepFunctions)
- IAM Policy (StepFunctions)
- EventBridge
- IAM Role (EventBridge)

## Install

### TypeScript

```shell
npm install @gammarer/aws-rds-database-auto-running-stopper
# or
yarn add @gammarer/aws-rds-database-auto-running-stopper
```

## Example

```typescript
import { BudgetsNotification } from '@gammarer/aws-rds-database-auto-running-stopper';

new RDSDatabaseAutoRunningStopper(stack, 'RDSDatabaseAutoRunningStopper');

```


## License

This project is licensed under the Apache-2.0 License.
