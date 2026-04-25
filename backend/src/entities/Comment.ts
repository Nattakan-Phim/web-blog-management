import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import type { Blog } from "./Blog";

export type CommentStatus = "pending" | "approved" | "rejected";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  senderName: string;

  @Column("text")
  message: string;

  @Column({ type: "varchar", default: "pending" })
  status: CommentStatus;

  @ManyToOne("Blog", (blog: Blog) => blog.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blogId" })
  blog: Blog;

  @Column()
  blogId: string;

  @CreateDateColumn()
  createdAt: Date;
}
