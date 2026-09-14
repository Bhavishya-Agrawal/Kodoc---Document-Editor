import mongoose from "mongoose";

/**
 * Cached MongoDB connection for serverless environments.
 * 
 * In serverless platforms like Vercel, each function invocation may
 * spin up a new container. Without caching, every request would open
 * a new database connection, quickly exhausting the connection pool.
 * 
 * We check `mongoose.connection.readyState`:
 *   0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 * 
 * If already connected (1), we skip reconnecting.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/kodoc";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully!");
    return mongoose.connection;
  } catch (err) {
    console.error("Could not connect to MongoDB:", err);
    throw err;
  }
};

export default connectDB;
