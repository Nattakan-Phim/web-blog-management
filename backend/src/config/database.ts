import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Blog } from "../entities/Blog";
import { BlogImage } from "../entities/BlogImage";
import { Comment } from "../entities/Comment";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "blog_db",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [User, Blog, BlogImage, Comment],
  migrations: ["src/migrations/*.ts"],
  migrationsRun: false,
});
