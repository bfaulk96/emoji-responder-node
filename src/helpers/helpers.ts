import { FunctionResults, Methods } from '../models/types';
import { Database } from '../database/database';
import { NowRequest, NowResponse } from '@vercel/node';
import { logger } from '../logging/LoggerService';
import { createHmac, timingSafeEqual } from 'crypto';

export async function validateFromSlack(
  req: NowRequest,
  res: NowResponse
): Promise<NowResponse | null> {
  try {
    const signingSecret = process.env.SIGNING_SECRET ?? '';
    const bodyStr = await streamToString(req);
    logger.debug(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
    const ts = parseInt((req.headers['x-slack-request-timestamp'] as string) ?? '0');
    const slackSignature: string = req.headers['x-slack-signature'] as string;

    if (!ts || !slackSignature) {
      const message = 'Missing required headers';
      logger.error(message);
      return res.status(403).send(message);
    }

    const FIVE_MINUTES = 300000; // 60 * 5 * 1000
    if (Math.abs(Date.now() - ts * 1000) > FIVE_MINUTES) {
      const message = 'Blocking potential replay attack';
      logger.error(message);
      return res.status(403).send(message);
    }

    const signatureBaseStr = `v0:${ts}:${bodyStr}`;
    const signature =
      'v0=' + createHmac('sha256', signingSecret).update(signatureBaseStr).digest('hex');
    if (!timingSafeEqual(Buffer.from(slackSignature, 'utf8'), Buffer.from(signature, 'utf8'))) {
      const message = 'Invalid signature';
      logger.error(message);
      return res.status(403).send(message);
    }

    return null;
  } catch (e) {
    logger.error(`An error occurred validating caller: ${e}`);
    return res.status(500).send('Error validating caller');
  }
}

async function streamToString(stream: NowRequest) {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

export async function connectOrError(response: NowResponse): Promise<null | NowResponse> {
  try {
    await Database.connect();
  } catch (err) {
    return response.status(500).send(`An error occurred connecting to DB: ${err}`);
  }
  return null;
}

export function getBotTokenOrError(response: NowResponse): string | NowResponse {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    logger.crit('Cannot run app without bot user token');
    return response.status(500).send('Internal Server Error');
  }
  return BOT_TOKEN;
}

export function checkAllowedMethodsOrError(
  method: Methods,
  allowedMethods: Methods[],
  response: NowResponse
): null | NowResponse {
  if (!allowedMethods.includes(method)) return response.status(405).send('Method Not Allowed');
  return null;
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

export function containsWord(str: string, word: string): boolean {
  return (
    // check that word isn't part of an emoji already
    str.match(new RegExp('.*:[A-z_,-]*' + word + '[A-z_,-]*:.*')) === null &&
    // check that word is found in text
    str.match(new RegExp('\\b' + word + '\\b')) !== null
  );
}

export function containsInvalidCharacters(str: string) {
  return !/^[a-zA-Z0-9_"' -]*$/g.test(str);
}

export function splitOnSpacesOrQuotes(str: string): string[] {
  //The parenthesis in the regex creates a captured group within the quotes
  const splitBySpacesOrQuotes = /[^\s"]+|"([^"]*)"|'([^']*)'/gi;
  const results = [];

  let match = splitBySpacesOrQuotes.exec(str);
  while (match) {
    // Each call to exec returns the next regex match as an array

    // Index 1 in the array is the captured group if it exists
    // Index 0 is the matched text, which we use if no captured group exists
    results.push(match[1] ?? match[0]);
    match = splitBySpacesOrQuotes.exec(str);
  }

  return results;
}
