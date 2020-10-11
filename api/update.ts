import { NowRequest, NowRequestBody, NowResponse } from '@vercel/node';
import {
  checkAllowedMethodsOrError,
  connectOrError,
  getBotTokenOrError,
} from '../src/helpers/helpers';
import { SlackUser } from '../src/models/slack-user';
import { logger } from '../src/logging/LoggerService';
import { Methods } from '../src/models/types';
import { updateEmojiMappingsServerless } from '../src/api';

export default async (request: NowRequest, response: NowResponse) => {
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

  const { status, body: responseBody } = await updateEmojiMappingsServerless(user, body);
  return response.status(status).send(responseBody);
};
