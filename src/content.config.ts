/**
 * Content Collections 配置（Astro 5+ Content Layer API）
 *
 * 定义 blog collection，文章源文件在 src/content/blog/*.md
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  // 用 glob loader 从本地 Markdown 文件加载
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("FinCalc Hub"),
    tags: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    /** 正文末尾 CTA 指向的计算器路径（用于内链建设） */
    relatedCalculator: z.string().optional(),
    /** 阅读时间（分钟），留空则按字数自动估算 */
    readingTime: z.number().optional(),
  }),
});

export const collections = { blog };
