import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import type { BlogImage } from "./BlogImage";
import type { Comment } from "./Comment";

@Entity("blogs")
export class Blog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column("text")
  excerpt: string;

  @Column("text")
  content: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @CreateDateColumn()
  publishedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany("BlogImage", (image: BlogImage) => image.blog, { cascade: true })
  images: BlogImage[];

  @OneToMany("Comment", (comment: Comment) => comment.blog, { cascade: true })
  comments: Comment[];
}
