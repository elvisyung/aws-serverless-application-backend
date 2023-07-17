import { SNSEvent } from 'aws-lambda';

const webHookUrl =
  'https://hooks.slack.com/services/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';

async function handler(event: SNSEvent, context) {
  for (const record of event.Records) {
    await fetch(webHookUrl, {
      method: 'POST',
      body: JSON.stringify({
        text: `Huston, we have a problem: ${record.Sns.Message}`,
      }),
    });
  }
}

export { handler };
