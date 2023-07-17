import { handler } from '../src/services/spaces/handler';

process.env.AWS_REGION = 'eu-west-1';
process.env.TABLE_NAME = 'SpaceTable-0a4bfce8f781';

handler(
  {
    httpMethod: 'POST',
    body: JSON.stringify({
      location: 'London updated',
    }),
  } as any,
  {} as any
).then((result) => {
  console.log(result);
});
