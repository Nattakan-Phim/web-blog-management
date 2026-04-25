import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

async function seedAdmin() {
  await AppDataSource.initialize();

  const email = process.env.SEED_ADMIN_EMAIL || "admin@blog.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin1234";

  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email } });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    await AppDataSource.destroy();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = userRepo.create({ email, password: hashed, role: "admin" });
  await userRepo.save(admin);

  console.log(`Admin created successfully:`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`\nChange the password after first login.`);

  await AppDataSource.destroy();
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
