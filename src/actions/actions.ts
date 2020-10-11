import { logger } from '../logging/LoggerService';
import fetch from 'node-fetch';

export async function addMultipleReactions(
  user: any,
  channel: string,
  timestamp: string,
  emojis: string[]
) {
  await Promise.all(
    emojis.map(async (emoji) => await addReaction(user, channel, timestamp, emoji))
  );
}

// send a message in Slack
export async function sendMessage(user: any, channel: string, text: string) {
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
  logger.debug(JSON.stringify(jsonResponse));
  return jsonResponse;
}

// React to a message in Slack
export async function addReaction(user: any, channel: string, timestamp: string, name: string) {
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
  logger.debug(JSON.stringify(jsonResponse));
  return jsonResponse;
}
