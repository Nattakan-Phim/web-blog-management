import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const secret = process.env.JWT_SECRET ?? "secret-key-change-in-production";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwt({ name: "jwt", secret }))
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { email: body.email } });

      if (!user || !(await bcrypt.compare(body.password, user.password))) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      const token = await jwt.sign({
        sub: user.id,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
      });

      return { token, user: { id: user.id, email: user.email, role: user.role } };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
    }
  );
