export type EmojiMappings = Record<string, string>;

export interface EmojiMappingsDbo {
  _id: string;
  teamId: string;
  mappings: EmojiMappings;
  created: Date;
  lastUpdated: Date;
}

export interface FunctionResults {
  status: number;
  body: string | any;
}

export enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
