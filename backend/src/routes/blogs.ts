import { Elysia, t } from "elysia";
import { AppDataSource } from "../config/database";
import { Blog } from "../entities/Blog";
import { BlogImage } from "../entities/BlogImage";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadImage, deleteImage } from "../services/upload.service";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-ก-๙]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes
}

// Public routes
export const blogPublicRoutes = new Elysia({ prefix: "/blogs" })
  .get(
    "/",
    async ({ query }) => {
      const page = Number(query.page) || 1;
      const limit = 10;
      const search = query.search?.trim() || "";

      const blogRepo = AppDataSource.getRepository(Blog);
      const qb = blogRepo
        .createQueryBuilder("blog")
        .leftJoinAndSelect("blog.images", "images")
        .where("blog.isPublished = :published", { published: true });

      if (search) {
        qb.andWhere("blog.title ILIKE :search", { search: `%${search}%` });
      }

      const [blogs, total] = await qb
        .orderBy("blog.publishedAt", "DESC")
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data: blogs,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    },
    { query: t.Object({ page: t.Optional(t.String()), search: t.Optional(t.String()) }) }
  )
  .get("/:slug", async ({ params, set }) => {
    const blogRepo = AppDataSource.getRepository(Blog);
    const blog = await blogRepo.findOne({
      where: { slug: params.slug, isPublished: true },
      relations: ["images", "comments"],
    });

    if (!blog) {
      set.status = 404;
      return { error: "Blog not found" };
    }

    await blogRepo.increment({ id: blog.id }, "viewCount", 1);

    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage,
      isPublished: blog.isPublished,
      viewCount: blog.viewCount + 1,
      publishedAt: blog.publishedAt,
      updatedAt: blog.updatedAt,
      images: blog.images.map((i) => ({ id: i.id, url: i.url, order: i.order })),
      comments: blog.comments
        .filter((c) => c.status === "approved")
        .map((c) => ({
          id: c.id,
          senderName: c.senderName,
          message: c.message,
          status: c.status,
          createdAt: c.createdAt,
        })),
    };
  });

// Admin routes (protected)
export const blogAdminRoutes = new Elysia({ prefix: "/admin/blogs" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ query }) => {
      const page = Number(query.page) || 1;
      const limit = 10;
      const blogRepo = AppDataSource.getRepository(Blog);

      const [[blogs, total], publishedCount, draftCount] = await Promise.all([
        blogRepo.findAndCount({
          relations: ["images"],
          order: { publishedAt: "DESC" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        blogRepo.countBy({ isPublished: true }),
        blogRepo.countBy({ isPublished: false }),
      ]);

      return {
        data: blogs,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit), publishedCount, draftCount },
      };
    },
    { query: t.Object({ page: t.Optional(t.String()) }) }
  )
  .get("/:id", async ({ params, set }) => {
    const blogRepo = AppDataSource.getRepository(Blog);
    const blog = await blogRepo.findOne({
      where: { id: params.id },
      relations: ["images"],
    });
    if (!blog) {
      set.status = 404;
      return { error: "Blog not found" };
    }
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage,
      isPublished: blog.isPublished,
      viewCount: blog.viewCount,
      publishedAt: blog.publishedAt,
      updatedAt: blog.updatedAt,
      images: blog.images.map((i) => ({ id: i.id, url: i.url, order: i.order })),
    };
  })
  .post(
    "/",
    async ({ body, set }) => {
      const blogRepo = AppDataSource.getRepository(Blog);
      const slug = body.slug ? generateSlug(body.slug) : generateSlug(body.title);

      if (!slug) {
        set.status = 400;
        return { error: "Could not generate a valid slug from the given title" };
      }

      const existing = await blogRepo.findOne({ where: { slug } });
      if (existing) {
        set.status = 409;
        return { error: "Slug already exists" };
      }

      const blog = blogRepo.create({ ...body, slug });
      const saved = await blogRepo.save(blog);
      return {
        id: saved.id,
        title: saved.title,
        slug: saved.slug,
        excerpt: saved.excerpt,
        content: saved.content,
        coverImage: saved.coverImage ?? null,
        isPublished: saved.isPublished,
        viewCount: saved.viewCount,
        publishedAt: saved.publishedAt,
        updatedAt: saved.updatedAt,
        images: [],
      };
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        slug: t.Optional(t.String({ maxLength: 200 })),
        excerpt: t.String({ minLength: 1, maxLength: 500 }),
        content: t.String({ minLength: 1 }),
        isPublished: t.Optional(t.Boolean()),
      }),
    }
  )
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const blogRepo = AppDataSource.getRepository(Blog);
      const blog = await blogRepo.findOne({ where: { id: params.id } });
      if (!blog) {
        set.status = 404;
        return { error: "Blog not found" };
      }

      if (body.slug !== undefined) {
        const newSlug = generateSlug(body.slug);
        if (!newSlug) {
          set.status = 400;
          return { error: "Invalid slug" };
        }
        if (newSlug !== blog.slug) {
          const existing = await blogRepo.findOne({ where: { slug: newSlug } });
          if (existing) {
            set.status = 409;
            return { error: "Slug already exists" };
          }
        }
        body.slug = newSlug;
      }

      if (body.title !== undefined) blog.title = body.title;
      if (body.slug !== undefined) blog.slug = body.slug;
      if (body.excerpt !== undefined) blog.excerpt = body.excerpt;
      if (body.content !== undefined) blog.content = body.content;
      if (body.isPublished !== undefined) blog.isPublished = body.isPublished;

      const saved = await blogRepo.save(blog);
      return {
        id: saved.id,
        title: saved.title,
        slug: saved.slug,
        excerpt: saved.excerpt,
        content: saved.content,
        coverImage: saved.coverImage ?? null,
        isPublished: saved.isPublished,
        viewCount: saved.viewCount,
        publishedAt: saved.publishedAt,
        updatedAt: saved.updatedAt,
      };
    },
    {
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        slug: t.Optional(t.String({ maxLength: 200 })),
        excerpt: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
        content: t.Optional(t.String({ minLength: 1 })),
        isPublished: t.Optional(t.Boolean()),
      }),
    }
  )
  .delete("/:id", async ({ params, set }) => {
    const blogRepo = AppDataSource.getRepository(Blog);
    const blog = await blogRepo.findOne({ where: { id: params.id }, relations: ["images"] });
    if (!blog) {
      set.status = 404;
      return { error: "Blog not found" };
    }
    for (const image of blog.images) {
      await deleteImage(image.url).catch(() => {});
    }
    if (blog.coverImage) {
      await deleteImage(blog.coverImage).catch(() => {});
    }
    await blogRepo.remove(blog);
    return { message: "Blog deleted" };
  })
  .post(
    "/:id/cover",
    async ({ params, body, set }) => {
      const blogRepo = AppDataSource.getRepository(Blog);
      const blog = await blogRepo.findOne({ where: { id: params.id } });
      if (!blog) {
        set.status = 404;
        return { error: "Blog not found" };
      }

      try {
        const oldCover = blog.coverImage;
        const url = await uploadImage(body.file);
        blog.coverImage = url;
        const saved = await blogRepo.save(blog);
        if (oldCover) await deleteImage(oldCover).catch(() => {});
        return {
          id: saved.id,
          title: saved.title,
          slug: saved.slug,
          excerpt: saved.excerpt,
          content: saved.content,
          coverImage: saved.coverImage,
          isPublished: saved.isPublished,
          viewCount: saved.viewCount,
          publishedAt: saved.publishedAt,
          updatedAt: saved.updatedAt,
        };
      } catch (err) {
        set.status = 400;
        return { error: (err as Error).message };
      }
    },
    { body: t.Object({ file: t.File({ type: ["image/jpeg", "image/png"] }) }) }
  )
  .post(
    "/:id/images",
    async ({ params, body, set }) => {
      const blogRepo = AppDataSource.getRepository(Blog);
      const imageRepo = AppDataSource.getRepository(BlogImage);

      const blog = await blogRepo.findOne({ where: { id: params.id }, relations: ["images"] });
      if (!blog) {
        set.status = 404;
        return { error: "Blog not found" };
      }

      if (blog.images.length >= 6) {
        set.status = 400;
        return { error: "Maximum 6 additional images allowed" };
      }

      try {
        const url = await uploadImage(body.file);
        const image = imageRepo.create({ url, blogId: params.id, order: blog.images.length });
        const saved = await imageRepo.save(image);
        return { id: saved.id, url: saved.url, order: saved.order };
      } catch (err) {
        set.status = 400;
        return { error: (err as Error).message };
      }
    },
    { body: t.Object({ file: t.File({ type: ["image/jpeg", "image/png"] }) }) }
  )
  .delete("/:id/images/:imageId", async ({ params, set }) => {
    const imageRepo = AppDataSource.getRepository(BlogImage);
    const image = await imageRepo.findOne({ where: { id: params.imageId, blogId: params.id } });
    if (!image) {
      set.status = 404;
      return { error: "Image not found" };
    }
    await deleteImage(image.url).catch(() => {});
    await imageRepo.remove(image);
    return { message: "Image deleted" };
  });
