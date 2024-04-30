# AWS RDS Database Auto Running Stop Stack

[![GitHub](https://img.shields.io/github/license/gammarers/aws-rds-database-auto-running-stop-stack?style=flat-square)](https://github.com/gammarers/aws-rds-database-auto-running-stop-stack/blob/main/LICENSE)
[![npm (scoped)](https://img.shields.io/npm/v/@gammarer/aws-rds-database-auto-running-stop-stack?style=flat-square)](https://www.npmjs.com/package/@gammarer/aws-rds-database-auto-running-stop-stack)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/gammarers/aws-rds-database-auto-running-stop-stack/release.yml?branch=main&label=release&style=flat-square)](https://github.com/gammarers/aws-rds-database-auto-running-stop-stack/actions/workflows/release.yml)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/gammarers/aws-rds-database-auto-running-stop-stack?sort=semver&style=flat-square)](https://github.com/gammarers/aws-rds-database-auto-running-stop-stack/releases)

[![View on Construct Hub](https://constructs.dev/badge?package=@gammarers/aws-rds-database-auto-running-stop-stack)](https://constructs.dev/packages/@gammarers/aws-rds-database-auto-running-stop-stack)

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

```shell
npm install @gammarers/aws-rds-database-auto-running-stop-stack
# or
yarn add @gammarers/aws-rds-database-auto-running-stop-stack
```

## Example

```typescript
import { BudgetsNotification } from '@gammarers/aws-rds-database-auto-running-stop-stack';

new RDSDatabaseAutoRunningStopStack(app, 'RDSDatabaseAutoRunningStopStack');

```

## License

This project is licensed under the Apache-2.0 License.
