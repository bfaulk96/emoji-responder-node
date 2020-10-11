import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Hello World!');
  return {
    statusCode: 200,
    body: JSON.stringify(event, null, 2),
    headers: { 'Content-Type': 'application/json' },
  };
};
