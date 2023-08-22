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

# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### RDSDatabaseAutoRunningStopper <a name="RDSDatabaseAutoRunningStopper" id="@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper"></a>

#### Initializers <a name="Initializers" id="@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.Initializer"></a>

```typescript
import { RDSDatabaseAutoRunningStopper } from '@gammarer/aws-rds-database-auto-running-stopper'

new RDSDatabaseAutoRunningStopper(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.Initializer.parameter.id"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.isConstruct"></a>

```typescript
import { RDSDatabaseAutoRunningStopper } from '@gammarer/aws-rds-database-auto-running-stopper'

RDSDatabaseAutoRunningStopper.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="@gammarer/aws-rds-database-auto-running-stopper.RDSDatabaseAutoRunningStopper.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---





