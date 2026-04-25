import { Elysia, t } from "elysia";
import { AppDataSource } from "../config/database";
import { Comment } from "../entities/Comment";
import type { CommentStatus } from "../entities/Comment";
import { Blog } from "../entities/Blog";
import { authMiddleware } from "../middleware/auth.middleware";

const VALID_STATUSES = new Set<CommentStatus>(["pending", "approved", "rejected"]);

// Thai script (U+0E00–U+0E7F) + Thai punctuation/digits (U+0E4F–U+0E5B) + ASCII digits + whitespace
const THAI_MESSAGE_REGEX = /^[฀-๿๏-๛0-9\s]+$/;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const commentPublicRoutes = new Elysia({ prefix: "/blogs/:blogId/comments" }).post(
  "/",
  async ({ params, body, set }) => {
    if (!UUID_REGEX.test(params.blogId)) {
      set.status = 400;
      return { error: "Invalid blog ID" };
    }

    const blogRepo = AppDataSource.getRepository(Blog);
    const blog = await blogRepo.findOne({ where: { id: params.blogId, isPublished: true } });
    if (!blog) {
      set.status = 404;
      return { error: "Blog not found" };
    }

    if (!THAI_MESSAGE_REGEX.test(body.message)) {
      set.status = 422;
      return { error: "ข้อความต้องเป็นภาษาไทยและตัวเลขเท่านั้น" };
    }

    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = commentRepo.create({
      senderName: body.senderName,
      message: body.message,
      blogId: params.blogId,
      status: "pending",
    });

    const saved = await commentRepo.save(comment);
    return { id: saved.id, senderName: saved.senderName, message: saved.message, status: saved.status, createdAt: saved.createdAt };
  },
  {
    body: t.Object({
      senderName: t.String({ minLength: 1, maxLength: 100 }),
      message: t.String({ minLength: 1, maxLength: 1000 }),
    }),
  }
);

export const commentAdminRoutes = new Elysia({ prefix: "/admin/comments" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ query }) => {
      const page = Number(query.page) || 1;
      const limit = 20;
      const commentRepo = AppDataSource.getRepository(Comment);

      const where: Partial<{ status: CommentStatus }> = {};
      if (query.status && VALID_STATUSES.has(query.status as CommentStatus)) {
        where.status = query.status as CommentStatus;
      }

      const [comments, total] = await commentRepo.findAndCount({
        where,
        relations: ["blog"],
        order: { createdAt: "DESC" },
        skip: (page - 1) * limit,
        take: limit,
      });

      return { data: comments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    }
  )
  .patch("/:id/approve", async ({ params, set }) => {
    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = await commentRepo.findOne({ where: { id: params.id } });
    if (!comment) {
      set.status = 404;
      return { error: "Comment not found" };
    }
    comment.status = "approved";
    const saved = await commentRepo.save(comment);
    return { id: saved.id, senderName: saved.senderName, message: saved.message, status: saved.status, createdAt: saved.createdAt };
  })
  .patch("/:id/reject", async ({ params, set }) => {
    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = await commentRepo.findOne({ where: { id: params.id } });
    if (!comment) {
      set.status = 404;
      return { error: "Comment not found" };
    }
    comment.status = "rejected";
    const saved = await commentRepo.save(comment);
    return { id: saved.id, senderName: saved.senderName, message: saved.message, status: saved.status, createdAt: saved.createdAt };
  })
  .delete("/:id", async ({ params, set }) => {
    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = await commentRepo.findOne({ where: { id: params.id } });
    if (!comment) {
      set.status = 404;
      return { error: "Comment not found" };
    }
    await commentRepo.remove(comment);
    return { message: "Comment deleted" };
  });
