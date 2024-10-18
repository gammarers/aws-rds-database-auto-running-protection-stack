# AWS RDS Database Auto Running Protection Stack

[![GitHub](https://img.shields.io/github/license/gammarers/aws-rds-database-auto-running-protection-stack?style=flat-square)](https://github.com/gammarers/aws-rds-database-auto-running-protection-stack/blob/main/LICENSE)
[![npm (scoped)](https://img.shields.io/npm/v/@gammarers/aws-rds-database-auto-running-protection-stack?style=flat-square)](https://www.npmjs.com/package/@gammarers/aws-rds-database-auto-running-protection-stack)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/gammarers/aws-rds-database-auto-running-protection-stack/release.yml?branch=main&label=release&style=flat-square)](https://github.com/gammarers/aws-rds-database-auto-running-protection-stack/actions/workflows/release.yml)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/gammarers/aws-rds-database-auto-running-protection-stack?sort=semver&style=flat-square)](https://github.com/gammarers/aws-rds-database-auto-running-protection-stack/releases)

[![View on Construct Hub](https://constructs.dev/badge?package=@gammarers/aws-rds-database-auto-running-protection-stack)](https://constructs.dev/packages/@gammarers/aws-rds-database-auto-running-protection-stack)

This constructor stack includes a function to automatically stop a database or cluster that will automatically start in 7 days.

## Resources

This construct creating resource list.

- StepFunctions(StateMachine)
- IAM Role (StepFunctions)
- IAM Policy (StepFunctions)
- EventBridge
- IAM Role (EventBridge)

## Install

### TypeScript

#### install by npm

```shell
npm install @gammarers/aws-rds-database-auto-running-protection-stack
```

#### install by yarn

```shell
yarn add @gammarers/aws-rds-database-auto-running-protection-stack
```

#### install by pnpm

```shell
pnpm add @gammarers/aws-rds-database-auto-running-protection-stack
```

#### install by bun

```shell
bun add @gammarers/aws-rds-database-auto-running-protection-stack
```

## Example

```typescript
import { RDSDatabaseAutoRunningProtectionStack } from '@gammarers/aws-rds-database-auto-running-protection-stack';

new RDSDatabaseAutoRunningProtectionStack(app, 'RDSDatabaseAutoRunningProtectionStack', {
  stackName: 'rds-database-auto-running-protection-stack',
  targetResource: {
    tagKey: 'AutoRunningProtection',
    tagValues: ['YES'],
  },
});

```

## License

This project is licensed under the Apache-2.0 License.
