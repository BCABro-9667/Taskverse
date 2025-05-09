
import { MongoClient, Db, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(); // The database name is part of the MONGO_URI
}

// Helper to convert string ID to ObjectId
export function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    // This helps catch errors early if a non-ObjectID string is passed.
    // Depending on your use case, you might want to handle this differently,
    // e.g., by returning null or letting MongoDB driver attempt conversion.
    // For now, we assume valid ObjectId strings are passed or it's an error.
    throw new Error(`Invalid ID format for ObjectId: ${id}`);
  }
  return new ObjectId(id);
}

// Helper to map MongoDB document _id to string id and remove _id
export function mapMongoId<T extends { _id: ObjectId }>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toHexString() };
}

// Helper to map an array of MongoDB documents
export function mapMongoIds<T extends { _id: ObjectId }>(docs: T[]): (Omit<T, '_id'> & { id: string })[] {
  return docs.map(mapMongoId);
}
