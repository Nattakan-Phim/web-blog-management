import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import type { Blog } from "./Blog";

@Entity("blog_images")
export class BlogImage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne("Blog", (blog: Blog) => blog.images, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blogId" })
  blog: Blog;

  @Column()
  blogId: string;

  @CreateDateColumn()
  createdAt: Date;
}
