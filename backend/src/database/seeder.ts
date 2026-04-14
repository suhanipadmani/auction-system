import bcrypt from "bcrypt";
import { UserModel } from "../app/models/user";
import { env } from "../config/env";

export const seedAdmin = async () => {
  try {
    const adminExists = await UserModel.findOne({ role: "admin" });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(env.adminPassword, 10);
      await UserModel.create({
        name: "Super Admin",
        email: env.adminEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
      });
      console.log(`[SEEDER] Admin user created: ${env.adminEmail}`);
    }
  } catch (error) {
    console.error("[SEEDER] Error seeding admin:", error);
  }
};
