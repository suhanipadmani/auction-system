import mongoose, { ClientSession } from "mongoose";

/**
 * Utility to run a block of code inside a transaction if supported,
 * otherwise runs it as a normal sequence.
 */
export const runInTransaction = async <T>(
  fn: (session: ClientSession | null) => Promise<T>
): Promise<T> => {
  let session: ClientSession | null = null;

  try {
    // Try to start a session
    session = await mongoose.startSession();
    session.startTransaction();

    const result = await fn(session);

    await session.commitTransaction();
    return result;
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
    }

    // Check if the error is specifically about Standalone vs Replica Set
    if (error.message.includes("Transaction numbers are only allowed on a replica set member")) {
      console.warn("⚠️ Standalone MongoDB detected. Running without atomic transactions.");
      // Fallback: Run without session
      return await fn(null);
    }

    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
