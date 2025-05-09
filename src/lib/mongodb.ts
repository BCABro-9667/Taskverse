
import { MongoClient, Db, ObjectId } from 'mongodb';

// Load environment variables if not already handled by Next.js (e.g. for scripts)
// For Next.js app routes, .env.local is automatically loaded.
// import dotenv from 'dotenv'; // Avoid direct import in files used by client components
// dotenv.config(); // This should not be here if file can be client-side bundled

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
  // Ensure the MONGO_URI includes the database name or specify it here.
  // Example: mongodb+srv://user:pass@host/YOUR_DB_NAME?retryWrites=true&w=majority
  // If the URI doesn't specify the db name, it might connect to a default db like 'test'.
  // The current URI is: mongodb+srv://Avdhesh1:ya4XYnQUEtYhv5kr@cluster0.0uojesi.mongodb.net/task_management?retryWrites=true&w=majority
  // So, client.db() without arguments should use 'task_management'.
  return client.db(); 
}

// Helper to convert string ID to ObjectId
export function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
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
