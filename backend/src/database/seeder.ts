import { UserModel } from "../app/models/user";
import { env } from "../config/env";

export const seedAdmin = async () => {
  try {
    const adminExists = await UserModel.findOne({ role: "admin" });
    
    if (!adminExists) {
      await UserModel.create({
        name: "Admin",
        email: env.adminEmail!,
        password: env.adminPassword!,
        role: "admin",
        status: "active",
      });
      console.log(`[SEEDER] Admin user created: ${env.adminEmail}`);
    } else {
      adminExists.password = env.adminPassword!;
      await adminExists.save();
      console.log(`[SEEDER] Admin user verified and updated: ${env.adminEmail}`);
    }
  } catch (error) {
    console.error("[SEEDER] Error seeding admin:", error);
  }
};
