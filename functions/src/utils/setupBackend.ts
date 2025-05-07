import mongoose from "mongoose";

export const setupBackend = async () => {
  try {
    // Setup the mongoose connection
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_CONNECTION_URI || "");

    mongoose.connection.on("error", (err) => {
      console.error("Mongodb error", err);
    });
  } catch (e) {
    console.error("Error setting up backend", e?.message);
  }
};

export default setupBackend;
