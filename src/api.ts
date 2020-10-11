import { Database } from './database/database';
import { logger } from './logging/LoggerService';
import { addMultipleReactions } from './actions/actions';
import { SlackUser } from './models/slack-user';
import { CommandTypes, FunctionResults } from './models/types';
import {
  containsInvalidCharacters,
  containsWord,
  respondToHandshake,
  splitOnSpacesOrQuotes,
} from './helpers/helpers';
import { UpdateWriteOpResult } from 'mongodb';
import { SlackEventBody, MessageEvent, SlackSlashCommandBody } from './models/slack-event';

export async function getEmojiResponseServerless(
  user: SlackUser,
  body: SlackEventBody<MessageEvent>
): Promise<FunctionResults> {
  try {
    const response: FunctionResults = { status: 200, body: { success: true } };

    // Respond to slack handshake if necessary
    const handshake = respondToHandshake(body, response);
    if (handshake) return handshake;

    const teamId = body.team_id;
    const slackEvent = body.event;
    const text = slackEvent?.text;
    const channel = slackEvent?.channel;
    const timestamp = slackEvent?.event_ts;
    const emojiMap = await Database.getMappings(teamId);

    if (!emojiMap) {
      const body = {
        success: true,
        msg: `Request succeeded, but team "${teamId}" did not match one of the existing teams`,
      };
      logger.warn(body.msg);
      response.status = 207;
      response.body = body;
      return response;
    }

    if (text && channel && timestamp) {
      const emojis = Object.keys(emojiMap)
        .filter((key) => containsWord(text.toLowerCase(), key))
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
        await addMultipleReactions(user, channel, timestamp, emojis as string[]);
      }
    }

    return response;
  } catch (e) {
    logger.error('Error occurred: ${e}');
    return {
      status: 500,
      body: 'Internal Server Error',
    };
  }
}

export async function updateEmojiMappingsServerless(
  user: SlackUser,
  body: SlackSlashCommandBody
): Promise<FunctionResults> {
  try {
    let response: FunctionResults = { status: 200, body: { success: true } };

    // Respond to slack handshake if necessary
    const handshake = respondToHandshake(body, response);
    if (handshake) return handshake;

    const teamId = body.team_id ?? body.enterprise_id ?? body.channel_id ?? '';
    const text = body.text?.toLowerCase() ?? '';

    logger.info(`Parsing text: ${text}`);

    if (containsInvalidCharacters(text)) return { status: 400, body: 'Invalid character(s) used.' };
    const [commandType, ...params] = splitOnSpacesOrQuotes(text);

    let dbResult: UpdateWriteOpResult;
    let operation: string;
    const bulk = false;

    if (CommandTypes.ADD.includes(commandType) && params?.length === 2) {
      logger.info(`Adding emoji mapping: { "${params[0]}": "${params[1]}" }`);
      operation = 'add';
      dbResult = await Database.putMapping(teamId, { [params[0]]: params[1] });
    } else if (CommandTypes.REMOVE.includes(commandType) && params?.length === 1) {
      logger.info(`Removing emoji mapping for key:" ${params[0]}"`);
      operation = 'remove';
      dbResult = await Database.putMapping(teamId, { [params[0]]: undefined });
    } else {
      logger.warn(`Invalid slash command used. commandType: "${commandType}", params: ${params}`);
      return { status: 400, body: 'Slash command invalid.' };
    }

    if (dbResult?.result?.ok) {
      const message = `Successfully ${(operation + 'ed').replace('ee', 'e')} emoji mapping${
        bulk ? 's' : ''
      }.`;
      logger.info(message);
      response.body = message;
    } else {
      const message = `Error ${(operation + 'ing').replace('ei', 'i')} emoji mapping.`;
      logger.error(message);
      response = {
        status: 500,
        body: message,
      };
    }

    return response;
  } catch (e) {
    logger.error(`Error occurred: ${e}`);
    return {
      status: 500,
      body: 'Internal Server Error',
    };
  }
}
