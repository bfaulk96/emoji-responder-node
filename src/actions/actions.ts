import { logger } from '../logging/LoggerService';
import fetch from 'node-fetch';

export async function addMultipleReactions(
  user: any,
  channel: string,
  timestamp: string,
  emojis: string[]
) {
  for (const emoji of emojis) {
    await addReaction(user, channel, timestamp, emoji);
  }
}

// send a message in Slack
export async function sendMessage(user: any, channel: string, text: string) {
  try {
    const url = 'https://slack.com/api/chat.postMessage';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${user.token}`,
      },
      redirect: 'follow', // manual, *follow, error
      body: JSON.stringify({
        channel,
        text,
      }),
    });

    const jsonResponse = await response.json();
    if (!jsonResponse.ok)
      logger.error(`Slack responded with an error: ${JSON.stringify(jsonResponse)}`);
    else logger.debug(JSON.stringify(jsonResponse));
    return jsonResponse;
  } catch (e) {
    logger.error(`Error occurred calling Slack API: ${e}`);
    return { success: false };
  }
}

// React to a message in Slack
export async function addReaction(user: any, channel: string, timestamp: string, name: string) {
  try {
    const url = 'https://slack.com/api/reactions.add';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${user.token}`,
      },
      redirect: 'follow', // manual, *follow, error
      body: JSON.stringify({
        channel,
        name,
        timestamp,
      }),
    });

    const jsonResponse = await response.json();
    if (!jsonResponse.ok)
      logger.error(`Slack responded with an error: ${JSON.stringify(jsonResponse)}`);
    else logger.debug(JSON.stringify(jsonResponse));
    return jsonResponse;
  } catch (e) {
    logger.error(`Error occurred calling Slack API: ${e}`);
    return { success: false };
  }
}
