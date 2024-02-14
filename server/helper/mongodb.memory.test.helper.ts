import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoDb: MongoMemoryServer;

export const connectDatabase = async () => {
    mongoDb = await MongoMemoryServer.create();
    const uri = mongoDb.getUri();
    await mongoose.connect(uri);
};
export const clearDatabase = async () => {
    await mongoose.connection.db.dropDatabase();
};
export const disconnectDatabase = async () => {
    await mongoose.disconnect();
    await mongoDb.stop();
};
