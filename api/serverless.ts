import { NowRequest, NowResponse } from '@vercel/node';
import { SlackUser } from '../src/models/slack-user';
import { logger } from '../src/logging/LoggerService';

export default (request: NowRequest, response: NowResponse) => {
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
    let body;
    const reqBody = request?.body;

    try {
      logger.info('Received request body', { body: reqBody });
      body = JSON.parse(atob(reqBody));
    } catch (e) {
      logger.error(`Error parsing malformed body: ${e}`, { body: reqBody });
      return response.status(400).send('Malformed body');
    }

    return response.send('test');
    // return req.respond(await getEmojiResponseServerless(user, body));
  }
};
