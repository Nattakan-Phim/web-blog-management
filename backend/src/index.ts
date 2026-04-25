import "reflect-metadata";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { join, normalize } from "path";
import { AppDataSource } from "./config/database";
import { authRoutes } from "./routes/auth";
import { blogPublicRoutes, blogAdminRoutes } from "./routes/blogs";
import { commentPublicRoutes, commentAdminRoutes } from "./routes/comments";

const UPLOADS_ROOT = join(process.cwd(), "public", "uploads");

const app = new Elysia()
  .use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }))
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Invalid request data", details: error.message };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Route not found" };
    }
    console.error(`[${code}]`, error.message);
    set.status = 500;
    return { error: "Internal server error" };
  })
  .get("/uploads/*", async ({ params, set }) => {
    const requested = (params as any)["*"] as string;
    const filePath = normalize(join(UPLOADS_ROOT, requested));
    if (!filePath.startsWith(UPLOADS_ROOT)) {
      set.status = 403;
      return "Forbidden";
    }
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      set.status = 404;
      return "Not found";
    }
    return file;
  })
  .use(swagger({ path: "/docs" }))
  .get("/health", () => ({ status: "ok" }))
  .use(authRoutes)
  .use(blogPublicRoutes)
  .use(blogAdminRoutes)
  .use(commentPublicRoutes)
  .use(commentAdminRoutes);

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected");

    const pending = await AppDataSource.showMigrations();
    if (pending) {
      console.warn("Pending migrations detected. Run: bun run db:migration:run");
    }

    app.listen(process.env.PORT || 4000, () => {
      console.log(`Backend running at http://localhost:${process.env.PORT || 4000}`);
      console.log(`Swagger docs at http://localhost:${process.env.PORT || 4000}/docs`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
