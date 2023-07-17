import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import {
  CloudFrontWebDistribution,
  Distribution,
  OriginAccessIdentity,
} from 'aws-cdk-lib/aws-cloudfront';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  IBucket,
} from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { existsSync } from 'fs';
import { join } from 'path';
import { getSuffixFromStack } from '../Utils';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ObjectOwnership } from '@aws-sdk/client-s3';

export class UiDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    const deploymentBucket = new Bucket(this, 'uiDeploymentBucket', {
      bucketName: `reverse-my-space-frontend-${suffix}`,
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
      //   objectOwnership: ObjectOwnership.OBJECT_WRITER,
    });

    const uiDir = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'reserve-my-space-frontend',
      'dist'
    );
    if (existsSync(uiDir)) {
      new BucketDeployment(this, 'reserve-my-space-ui-deployment', {
        destinationBucket: deploymentBucket,
        sources: [Source.asset(uiDir)],
      });

      new BucketDeployment(this, 'ReserveMySpaceDeployment', {
        destinationBucket: deploymentBucket,
        sources: [Source.asset(uiDir)],
      });

      const originIdentity = new OriginAccessIdentity(
        this,
        'OriginAccessIdentity'
      );
      deploymentBucket.grantRead(originIdentity);
      deploymentBucket.grantPutAcl(originIdentity);

      const distribution = new Distribution(
        this,
        'ReserveMySpaceDistribution',
        {
          defaultRootObject: 'index.html',
          defaultBehavior: {
            origin: new S3Origin(deploymentBucket, {
              originAccessIdentity: originIdentity,
            }),
          },
        }
      );

      new CfnOutput(this, 'ReserveMySpaceUrl', {
        value: distribution.distributionDomainName,
      });
    }
  }
}
