import { connectMongo } from "../database/db";
import { seedAdmin } from "../database/seeder";

export const dbLoader = async () => {
  await connectMongo();
  await seedAdmin();
};
