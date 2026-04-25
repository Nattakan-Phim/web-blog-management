import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authMiddleware = (app: Elysia) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");

  return app
    .use(jwt({ name: "jwt", secret }))
    .derive(async ({ jwt, headers, set }) => {
      const authorization = headers["authorization"];
      if (!authorization?.startsWith("Bearer ")) {
        set.status = 401;
        throw new Error("Unauthorized");
      }

      const token = authorization.slice(7);
      const payload = await jwt.verify(token);
      if (!payload) {
        set.status = 401;
        throw new Error("Invalid token");
      }

      return { userId: payload.sub as string, role: payload.role as string };
    });
};
