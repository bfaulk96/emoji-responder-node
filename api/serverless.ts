import { NowRequest, NowResponse } from '@vercel/node';
import { SlackUser } from '../src/models/slack-user';

export default (request: NowRequest, response: NowResponse) => {
  // const { name = 'World' } = request.query;
  // response.status(200).send(`Hello ${name}!`);

  // try {
  //   await Database.connect();
  // } catch (err) {
  //   return req.respond({
  //     status: 500,
  //     body: `An error occurred connecting to DB: ${err}`,
  //   });
  // }

  const BOT_TOKEN = process.env.BOT_TOKEN;

  if (!BOT_TOKEN) {
    // logger.critical('Cannot run app without bot user token');
    return response.status(500).send('Internal Server Error');
  }

  const user = new SlackUser(BOT_TOKEN);

  // logger.info(`${req?.method ?? 'UNKNOWN METHOD'} ${req?.url}`);
  if (request?.method !== 'POST') {
    return response.send(405).send('Method Not Allowed');
  } else {
    let body;
    const reqBody = request?.body;

    try {
      // logger.info('Received request body:', reqBody);
      body = JSON.parse(atob(reqBody));
    } catch (e) {
      // logger.error('Error parsing malformed body:', reqBody);
      return response.status(400).send('Malformed body');
    }

    return response.send('test');
    // return req.respond(await getEmojiResponseServerless(user, body));
  }
};
