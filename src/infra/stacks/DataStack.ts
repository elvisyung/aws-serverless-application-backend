import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../Utils';
import { Bucket, HttpMethods, IBucket } from 'aws-cdk-lib/aws-s3';
import { ObjectOwnership } from '@aws-sdk/client-s3';

export class DataStack extends Stack {
  public readonly spacesTable: ITable;
  public readonly deploymentBucket: IBucket;
  public readonly photosBucket: IBucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    const suffix = getSuffixFromStack(this);

    this.deploymentBucket = new Bucket(this, 'ReserveMySpaceFrontend', {
      bucketName: `reserve-my-space-frontend-${suffix}`,
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    });
    this.photosBucket = new Bucket(this, 'SpaceFinderPhotos', {
      bucketName: `reserve-my-space-photos-${suffix}`,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    });

    new CfnOutput(this, 'ReserveMySpacePhotosBucketName', {
      value: this.photosBucket.bucketName,
    });

    this.spacesTable = new Table(this, 'SpacesTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: `SpaceTable-${suffix}`,
    });
  }
}
