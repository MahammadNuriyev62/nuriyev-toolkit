import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string; // Replace with your MongoDB URI in .env
const options = {};

let db: Db;

export async function connectToDatabase() {
  if (db) return db; // Return cached connection
  const client = await MongoClient.connect(uri, options);
  db = client.db("nuriyev-toolkit"); // Your database name
  console.log("Connected to MongoDB");
  return db;
}
