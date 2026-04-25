import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1714000000000 implements MigrationInterface {
  name = "InitialSchema1714000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'admin',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "blogs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "excerpt" text NOT NULL,
        "content" text NOT NULL,
        "coverImage" character varying,
        "isPublished" boolean NOT NULL DEFAULT false,
        "viewCount" integer NOT NULL DEFAULT 0,
        "publishedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_blogs_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_blogs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_blogs_isPublished" ON "blogs" ("isPublished")`);
    await queryRunner.query(`CREATE INDEX "IDX_blogs_publishedAt" ON "blogs" ("publishedAt")`);

    await queryRunner.query(`
      CREATE TABLE "blog_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" character varying NOT NULL,
        "order" integer NOT NULL DEFAULT 0,
        "blogId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog_images_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_blog_images_blog" FOREIGN KEY ("blogId")
          REFERENCES "blogs"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_blog_images_blogId" ON "blog_images" ("blogId")`);

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "senderName" character varying NOT NULL,
        "message" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "blogId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_blog" FOREIGN KEY ("blogId")
          REFERENCES "blogs"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_comments_blogId" ON "comments" ("blogId")`);
    await queryRunner.query(`CREATE INDEX "IDX_comments_status" ON "comments" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "blog_images"`);
    await queryRunner.query(`DROP TABLE "blogs"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
