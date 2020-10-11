import { NowRequest, NowRequestBody, NowResponse } from '@vercel/node';
import { SlackUser } from '../src/models/slack-user';
import { logger } from '../src/logging/LoggerService';
import { getEmojiResponseServerless } from '../src/api';

export default async (request: NowRequest, response: NowResponse) => {
  // try {
  //   await Database.connect();
  // } catch (err) {
  //   return response.status(500).send(`An error occurred connecting to DB: ${err}`);
  // }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    logger.crit('Cannot run app without bot user token');
    return response.status(500).send('Internal Server Error');
  }

  const user = new SlackUser(BOT_TOKEN);

  logger.info(`${request?.method ?? 'UNKNOWN METHOD'} ${request?.url}`);
  if (request?.method !== 'POST') {
    return response.send(405).send('Method Not Allowed');
  } else {
    let body: unknown;
    const encodedBody: NowRequestBody = request?.body;

    try {
      body = JSON.parse(Buffer.from(encodedBody, 'base64').toString());
      logger.debug('Request body successfully decoded', body);
    } catch (e) {
      logger.error(`Error parsing malformed body: ${e}`, { body: encodedBody });
      return response.status(400).send('Malformed body');
    }

    const { status, body: responseBody } = await getEmojiResponseServerless(user, body);
    return response.status(status).send(responseBody);
  }
};
