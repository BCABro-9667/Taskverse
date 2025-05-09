import { MongoClient, Db, ObjectId } from 'mongodb';

// process.env.MONGO_URI will be automatically populated by Next.js from .env.local on the server-side
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
  // The MONGO_URI should include the database name.
  // e.g., mongodb+srv://user:pass@host/YOUR_DB_NAME?retryWrites=true&w=majority
  // If uri is "mongodb+srv://Avdhesh1:ya4XYnQUEtYhv5kr@cluster0.0uojesi.mongodb.net/task_management?retryWrites=true&w=majority"
  // client.db() will use 'task_management'.
  return client.db(); 
}

// Helper to convert string ID to ObjectId
export function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    // It's often better to return null or let the caller handle invalid IDs
    // rather than throwing, depending on application flow.
    // For now, keeping the throw as it makes invalid ID issues explicit.
    throw new Error(`Invalid ID format for ObjectId: ${id}`);
  }
  return new ObjectId(id);
}

// Helper to map MongoDB document _id to string id and remove _id
export function mapMongoId<T extends { _id: ObjectId | string }>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  // Ensure _id is converted to string, even if it's already a string (though typically it's ObjectId from DB)
  return { ...rest, id: typeof _id === 'string' ? _id : _id.toHexString() };
}

// Helper to map an array of MongoDB documents
export function mapMongoIds<T extends { _id: ObjectId | string }>(docs: T[]): (Omit<T, '_id'> & { id: string })[] {
  return docs.map(mapMongoId);
}
