import { Database } from './database/database';
import { logger } from './logging/LoggerService';
import { addMultipleReactions } from './actions/actions';
import { SlackUser } from './models/slack-user';
import { FunctionResults } from './models/types';

export async function getEmojiResponseServerless(
  user: SlackUser,
  body: any // TODO: Add types for the challenge or actual call
): Promise<FunctionResults> {
  try {
    const response: FunctionResults = { status: 200, body: { success: true } };

    // Respond to slack handshake if necessary
    const handshake = respondToHandshake(body, response);
    if (handshake) {
      response.body = handshake.body;
      return response;
    }
    const teamId = body?.team_id;
    const slackEvent = body?.event;
    const text = slackEvent?.text;
    const channel = slackEvent?.channel;
    const timestamp = slackEvent?.event_ts;
    const emojiMap = await Database.getMappings(teamId);

    if (!emojiMap) {
      const body = {
        success: true,
        msg: `Request succeeded, but team "${teamId}" did not match one of the existing teams`,
      };
      logger.warning(body.msg);
      response.status = 207;
      response.body = body;
      return response;
    }

    if (text && channel && timestamp) {
      const emojis = Object.keys(emojiMap)
        .filter((key) => {
          return containsWord(text.toLowerCase(), key);
        })
        .sort((a, b) => {
          const indexA = text.indexOf(a);
          const indexB = text.indexOf(b);
          return indexA > indexB ? 1 : indexA < indexB ? -1 : 0;
        })
        .map((key) => emojiMap[key]);

      if (emojis.length) {
        response.body = {
          ...response.body,
          emojis,
        };
        // await respondWithEmoji(channel, emojis.map((x: string) => `:${x}:`).join(""));
        await addMultipleReactions(user, channel, timestamp, emojis);
      }
    }

    return response;
  } catch (e) {
    logger.error('Error occurred: ', e);
    return {
      status: 500,
      body: 'Internal Server Error',
    };
  }
}

export function respondToHandshake(
  body: any,
  response: FunctionResults
): FunctionResults | undefined {
  const challenge = body?.value?.challenge ?? body?.challenge;
  if (challenge) {
    response.body = { challenge };
    return response;
  }
}

// // TODO: check if body uses interface?
// export function validateBody(
//   request: any,
//   response: any,
//   interfaceType?: any,
// ): FunctionResults | undefined {
//   if (!request.hasBody) {
//     response.status = 400;
//     response.body = {
//       success: false,
//       msg: 'No data',
//     };
//     return response;
//   }
// }

function containsWord(str: string, word: string): boolean {
  return (
    // check that word isn't part of an emoji already
    str.match(new RegExp('.*:[A-z_,-]*' + word + '[A-z_,-]*:.*')) === null &&
    // check that word is found in text
    str.match(new RegExp('\\b' + word + '\\b')) !== null
  );
}
