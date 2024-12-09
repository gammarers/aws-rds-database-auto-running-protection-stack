import { Duration, Stack } from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

export interface ProtectionStateMachineProps extends sfn.StateMachineProps {}

export class ProtectionStateMachine extends sfn.StateMachine {
  constructor(scope: Construct, id: string, props?: ProtectionStateMachineProps) {
    super(scope, id, {
      ...props,
      definitionBody: (() => {

        // 👇 Get AWS account
        const account = Stack.of(scope).account;
        //const region = Stack.of(this).region;

        const succeed = new sfn.Succeed(scope, 'Succeed');

        const startingWait = new sfn.Wait(scope, 'StartingWait', {
          time: sfn.WaitTime.duration(Duration.minutes(1)),
        });

        // Status definition
        const statusesDefinition: sfn.Pass = new sfn.Pass(scope, 'StatusesDefinition', {
          result: sfn.Result.fromObject([
            { name: 'AVAILABLE', emoji: '🤩', state: 'available' },
            { name: 'AUTOSTOPPED', emoji: '😴', state: 'stopped' },
          ]),
          resultPath: '$.definition.statuses',
        });

        startingWait.next(statusesDefinition);

        const describeDBInstancesTask = new tasks.CallAwsService(scope, 'DescribeDBInstances', {
          iamResources: [`arn:aws:rds:*:${account}:db:*`],
          service: 'rds',
          action: 'describeDBInstances',
          parameters: {
            DbInstanceIdentifier: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
          },
          resultPath: '$.result.describe',
          resultSelector: {
            status: sfn.JsonPath.stringAt('$.DbInstances[0].DbInstanceStatus'),
            identifier: sfn.JsonPath.stringAt('$.DbInstances[0].DbInstanceIdentifier'),
            tags: sfn.JsonPath.stringAt('$.DbInstances[0].TagList'),
          },
        });

        const stopDBInstanceTask = new tasks.CallAwsService(scope, 'StopDBInstance', {
          iamResources: [`arn:aws:rds:*:${account}:db:*`],
          service: 'rds',
          action: 'stopDBInstance',
          parameters: {
            DbInstanceIdentifier: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
          },
          resultPath: '$.result.stop',
        });

        const describeDBClustersTask = new tasks.CallAwsService(scope, 'DescribeDBClusters', {
          iamResources: [`arn:aws:rds:*:${account}:cluster:*`],
          service: 'rds',
          action: 'describeDBClusters',
          parameters: {
            DbClusterIdentifier: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
          },
          resultPath: '$.result.describe',
          resultSelector: {
            status: sfn.JsonPath.stringAt('$.DbClusters[0].Status'),
            identifier: sfn.JsonPath.stringAt('$.DbClusters[0].DbClusterIdentifier'),
            tags: sfn.JsonPath.stringAt('$.DbClusters[0].TagList'),
          },
        });

        const stopDBClusterTask = new tasks.CallAwsService(scope, 'StopDBCluster', {
          iamResources: [`arn:aws:rds:*:${account}:cluster:*`],
          service: 'rds',
          action: 'stopDBCluster',
          parameters: {
            DbClusterIdentifier: sfn.JsonPath.stringAt('$.event.detail.SourceIdentifier'),
          },
          resultPath: '$.result.stop',
        });

        const describeTypeChoice = new sfn.Choice(scope, 'DescribeTypeChoice')
          .when(
            sfn.Condition.and(
              sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Instance Event'),
              sfn.Condition.stringEquals('$.event.detail.SourceType', 'DB_INSTANCE'),
              sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0154'),
            ),
            describeDBInstancesTask,
          )
          .when(
            sfn.Condition.and(
              sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Cluster Event'),
              sfn.Condition.stringEquals('$.event.detail.SourceType', 'CLUSTER'),
              sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0153'),
            ),
            describeDBClustersTask,
          )
          .otherwise(new sfn.Fail(scope, 'UnknownType'));

        statusesDefinition.next(describeTypeChoice);

        const statusChangeWait = new sfn.Wait(scope, 'StatusChangeWait', {
          time: sfn.WaitTime.duration(Duration.minutes(5)),
        });

        statusChangeWait.next(describeTypeChoice);

        stopDBInstanceTask.next(statusChangeWait);

        stopDBClusterTask.next(statusChangeWait);

        // 👇 Status Choice
        const statusChoice = new sfn.Choice(scope, 'StatusChoice')
          // db instance stop on status.available
          .when(
            sfn.Condition.and(
              sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Instance Event'),
              sfn.Condition.stringEquals('$.event.detail.SourceType', 'DB_INSTANCE'),
              sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0154'),
              sfn.Condition.stringEquals('$.result.describe.status', 'available'),
            ),
            stopDBInstanceTask,
          )
          // db cluster stop on status.available
          .when(
            sfn.Condition.and(
              sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Cluster Event'),
              sfn.Condition.stringEquals('$.event.detail.SourceType', 'CLUSTER'),
              sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0153'),
              sfn.Condition.stringEquals('$.result.describe.status', 'available'),
            ),
            stopDBClusterTask,
          )
          // status change succeed, // todo: generate topic
          .when(
            sfn.Condition.and(
              sfn.Condition.or(
                sfn.Condition.and(
                  sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Instance Event'),
                  sfn.Condition.stringEquals('$.event.detail.SourceType', 'DB_INSTANCE'),
                  sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0154'),
                ),
                sfn.Condition.and(
                  sfn.Condition.stringEquals('$.event.detail-type', 'RDS DB Cluster Event'),
                  sfn.Condition.stringEquals('$.event.detail.SourceType', 'CLUSTER'),
                  sfn.Condition.stringEquals('$.event.detail.EventID', 'RDS-EVENT-0153'),
                ),
              ),
              sfn.Condition.stringEquals('$.result.describe.status', 'stopped'),
            ),
            succeed,
          )
          .when(
            sfn.Condition.or(
              sfn.Condition.stringEquals('$.result.describe.status', 'starting'),
              sfn.Condition.stringEquals('$.result.describe.status', 'configuring-enhanced-monitoring'),
              sfn.Condition.stringEquals('$.result.describe.status', 'backing-up'),
              sfn.Condition.stringEquals('$.result.describe.status', 'modifying'),
              sfn.Condition.stringEquals('$.result.describe.status', 'stopping'),
            ),
            statusChangeWait,
          )
          .otherwise(new sfn.Fail(scope, 'StatusFail', {
            cause: 'db instance or cluster status fail.',
          }));

        // 👇 Tag Match
        const tagMatchChoice = new sfn.Choice(scope, 'ExistTagChoide')
          .when(
            sfn.Condition.isPresent('$.result.describe.tags'),
            new sfn.Pass(scope, 'ContainTagVlue', {
              resultPath: '$.check.tag',
              parameters: {
                isContain: sfn.JsonPath.arrayContains(
                  sfn.JsonPath.stringAt('$.params.tagValues'),
                  sfn.JsonPath.arrayGetItem(sfn.JsonPath.stringAt('$.result.describe.tags[?(@.Key == $.params.tagKey)].Value'), 0),
                ),
              },
            }).next(
              new sfn.Choice(scope, 'FilterTagChoise')
                .when(
                  sfn.Condition.booleanEquals('$.check.tag.isContain', true),
                  statusChoice,
                )
                .otherwise(
                  new sfn.Pass(scope, 'NoTagMatch', {
                    comment: 'no tag match',
                  }),
                ),
            ),
          )
          .otherwise(
            new sfn.Pass(scope, 'NoTagsFound', {
              comment: 'no tags found',
            }),
          );

        // 👇 describe next tag found & match
        describeDBInstancesTask.next(tagMatchChoice);
        describeDBClustersTask.next(tagMatchChoice);

        return sfn.DefinitionBody.fromChainable(startingWait);
      })(),
    });
  }
}