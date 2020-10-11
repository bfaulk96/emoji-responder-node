import { NowRequest, NowRequestBody, NowResponse } from '@vercel/node';
import { SlackUser } from '../src/models/slack-user';
import { logger } from '../src/logging/LoggerService';
import { getEmojiResponseServerless } from '../src/api';
import {
  checkAllowedMethodsOrError,
  connectOrError,
  getBotTokenOrError,
  validateFromSlack,
} from '../src/helpers/helpers';
import { Methods } from '../src/models/types';

export default async (request: NowRequest, response: NowResponse) => {
  const validationErr = await validateFromSlack(request, response);
  if (validationErr) return validationErr;

  const connErr = await connectOrError(response);
  if (connErr) return connErr;

  const token = getBotTokenOrError(response);
  if (typeof token !== 'string') return token;
  const user = new SlackUser(token);

  logger.info(`${request?.method ?? 'UNKNOWN METHOD'} ${request?.url}`);

  const methodErr = checkAllowedMethodsOrError(
    request?.method as Methods,
    [Methods.POST],
    response
  );
  if (methodErr) return methodErr;

  const body: NowRequestBody = request?.body;

  const { status, body: responseBody } = await getEmojiResponseServerless(user, body);
  return response.status(status).send(responseBody);
};
