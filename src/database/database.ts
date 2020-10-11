import {
  Collection,
  MongoClient,
  UpdateOneOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongodb';
import { logger } from '../logging/LoggerService';
import { EmojiMappings, EmojiMappingsDbo } from '../models/types';

const mongoUrl = process.env.MONGO_URL ?? '';
const dbName = process.env.DB_NAME ?? '';
const collectionName = process.env.COLLECTION_NAME ?? '';

export class Database {
  static client: MongoClient;
  static collection: Collection;

  static async connect(): Promise<unknown | undefined> {
    try {
      if (this.client) this.client.close?.();
      this.client = new MongoClient(mongoUrl);

      await this.client.connect();
      const database = this.client.db(dbName);
      this.collection = database.collection(collectionName);
      return this.collection;
    } catch (e) {
      logger.error(`Error occurred connecting to DB: ${e}`);
    }
  }

  static async getMappings(teamId: string): Promise<EmojiMappings> {
    if (!this.collection) await this.connect();
    return (await this.collection?.findOne<EmojiMappingsDbo>({ teamId }))?.mappings;
  }

  static async upsertMappings(
    teamId: string,
    newMappings: EmojiMappings
  ): Promise<UpdateWriteOpResult> {
    if (!this.collection) await this.connect();

    const existingMappings = await this.getMappings(teamId);
    const mappings = { ...existingMappings, ...newMappings };
    Object.keys(mappings).forEach((key) => !mappings[key] && delete mappings[key]);

    const dateKey: keyof EmojiMappingsDbo = mappings ? 'lastUpdated' : 'created';
    const update = { $set: { mappings, teamId, [dateKey]: new Date() } };
    const options: UpdateOneOptions = { upsert: true };
    return await this.collection.updateOne({ teamId }, update, options);
  }
  //
  // static deleteMapping(serverId: string): Promise<number> {
  //   if (!this.collection) this.connect();
  //
  //   return users.deleteOne({ serverId });
  // }
}
