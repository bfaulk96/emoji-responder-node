export type EmojiMappings = Record<string, string>;

export interface EmojiMappingsDbo {
  _id: { $oid: string };
  teamId: string;
  mappings: EmojiMappings;
}

export interface FunctionResults {
  status: number;
  body: string | any;
}
