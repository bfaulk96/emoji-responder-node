import { Collection, MongoClient } from 'mongodb';
import { logger } from '../logging/LoggerService';
import { EmojiMappings } from '../models/types';

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
      // await client.connectWithUri(`mongodb+srv://${user}:${pass}@clusterfaulkner.tjoim.mongodb.net/?retryWrites=true&w=majority`);
      //
      // const db = client.database(dbName);
      // this.collection = db.collection<EmojiMappingsDbo>(collectionName);
      return this.collection;
    } catch (e) {
      logger.error(`Error occurred connecting to DB: ${e}`);
    }
  }

  static async getMappings(teamId: string): Promise<EmojiMappings> {
    if (!this.collection) await this.connect();

    return (await this.collection?.findOne({ teamId }))?.mappings;
  }

  // static putMapping(serverId: string): Promise<EmojiMappings> {
  //   if (!this.collection) this.connect();
  //
  //   return users.updateOne(
  //     { serverId } },
  //     { $set: mappings }
  //   );
  // }
  //
  // static deleteMapping(serverId: string): Promise<number> {
  //   if (!this.collection) this.connect();
  //
  //   return users.deleteOne({ serverId });
  // }
}
