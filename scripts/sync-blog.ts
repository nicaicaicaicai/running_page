#!/usr/bin/env tsx

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

/**
 * 博客文章接口定义
 */
interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
}

/**
 * Markdown 文件的 Front Matter 接口
 */
interface PostFrontMatter {
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  featured?: boolean;
}

/**
 * 计算文章阅读时间（基于字数，假设每分钟阅读 200 个中文字符或 250 个英文单词）
 * @param content 文章内容
 * @returns 阅读时间（分钟）
 */
function calculateReadingTime(content: string): number {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .replace(/`[^`]*`/g, '') // 行内代码
    .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
    .replace(/\[.*?\]\(.*?\)/g, '') // 链接
    .replace(/#{1,6}\s/g, '') // 标题
    .replace(/[*_]{1,2}(.*?)[*_]{1,2}/g, '$1') // 粗体斜体
    .replace(/\n/g, ' '); // 换行

  // 计算中文字符数
  const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 计算英文单词数
  const englishWords = plainText.replace(/[\u4e00-\u9fa5]/g, '').split(/\s+/).filter(word => word.length > 0).length;
  
  // 中文按 200 字符/分钟，英文按 250 单词/分钟计算
  const readingTime = Math.ceil(chineseChars / 200 + englishWords / 250);
  
  return Math.max(1, readingTime); // 至少 1 分钟
}

/**
 * 生成文章 ID（基于文件名）
 * @param filename 文件名
 * @returns 文章 ID
 */
function generatePostId(filename: string): string {
  return path.basename(filename, '.md')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 解析单个 Markdown 文件
 * @param filePath 文件路径
 * @returns 博客文章对象
 */
async function parseMarkdownFile(filePath: string): Promise<BlogPost | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    const frontMatter = data as PostFrontMatter;
    
    // 验证必需字段
    if (!frontMatter.title || !frontMatter.date) {
      console.warn(`⚠️  文件 ${filePath} 缺少必需的 title 或 date 字段，跳过处理`);
      return null;
    }

    // 生成文章 ID
    const id = generatePostId(path.basename(filePath));
    
    // 计算阅读时间
    const readingTime = calculateReadingTime(content);
    
    // 生成摘要（如果没有提供）
    let excerpt = frontMatter.excerpt || '';
    if (!excerpt) {
      // 从内容中提取前 150 个字符作为摘要
      const plainText = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/[*_]{1,2}(.*?)[*_]{1,2}/g, '$1')
        .replace(/\n/g, ' ')
        .trim();
      
      excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }

    const blogPost: BlogPost = {
      id,
      title: frontMatter.title,
      date: frontMatter.date,
      excerpt,
      content,
      tags: frontMatter.tags || [],
      readingTime,
      featured: frontMatter.featured || false,
    };

    return blogPost;
  } catch (error) {
    console.error(`❌ 解析文件 ${filePath} 时出错:`, error);
    return null;
  }
}

/**
 * 生成 blog-data.ts 文件内容
 * @param posts 博客文章数组
 * @returns 文件内容字符串
 */
function generateBlogDataContent(posts: BlogPost[]): string {
  return `// 此文件由 scripts/sync-blog.ts 自动生成，请勿手动编辑
// Generated at: ${new Date().toISOString()}

/**
 * 博客文章接口定义
 */
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
}

/**
 * 博客文章数据
 */
export const blogPosts: BlogPost[] = ${JSON.stringify(posts, null, 2)};

/**
 * 根据 ID 获取博客文章
 * @param id 文章 ID
 * @returns 博客文章或 undefined
 */
export function getPostById(id: string): BlogPost | undefined {
  return blogPosts.find(post => post.id === id);
}

/**
 * 获取精选文章
 * @returns 精选文章数组
 */
export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured);
}

/**
 * 根据标签获取文章
 * @param tag 标签名
 * @returns 包含该标签的文章数组
 */
export function getPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post => post.tags.includes(tag));
}

/**
 * 获取所有标签
 * @returns 所有标签数组（去重）
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * 按日期排序文章（最新的在前）
 * @param posts 文章数组
 * @returns 排序后的文章数组
 */
export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
`;
}

/**
 * 主函数：同步博客文章
 */
async function syncBlog(): Promise<void> {
  try {
    console.log('🚀 开始同步博客文章...');
    
    // 查找所有 Markdown 文件
    const blogPostsDir = path.join(process.cwd(), 'blog-posts');
    const markdownFiles = await glob('**/*.md', { cwd: blogPostsDir });
    
    if (markdownFiles.length === 0) {
      console.log('📝 未找到 Markdown 文件，将生成空的博客数据');
    } else {
      console.log(`📚 找到 ${markdownFiles.length} 个 Markdown 文件`);
    }
    
    // 解析所有 Markdown 文件
    const posts: BlogPost[] = [];
    for (const file of markdownFiles) {
      const filePath = path.join(blogPostsDir, file);
      console.log(`📖 正在处理: ${file}`);
      
      const post = await parseMarkdownFile(filePath);
      if (post) {
        posts.push(post);
        console.log(`✅ 成功解析: ${post.title}`);
      }
    }
    
    // 按日期排序
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // 生成 blog-data.ts 文件
    const outputPath = path.join(process.cwd(), 'src', 'static', 'blog-data.ts');
    const content = generateBlogDataContent(posts);
    
    await fs.writeFile(outputPath, content, 'utf-8');
    
    console.log(`✨ 博客数据已更新！`);
    console.log(`📊 统计信息:`);
    console.log(`   - 总文章数: ${posts.length}`);
    console.log(`   - 精选文章: ${posts.filter(p => p.featured).length}`);
    console.log(`   - 标签数量: ${new Set(posts.flatMap(p => p.tags)).size}`);
    console.log(`📁 输出文件: ${outputPath}`);
    
    if (posts.length > 0) {
      console.log('\n🎉 同步完成！现在你可以运行以下命令提交更改:');
      console.log('   git add .');
      console.log('   git commit -m "更新博客文章"');
      console.log('   git push');
    }
    
  } catch (error) {
    console.error('❌ 同步博客时出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  syncBlog();
}

export { syncBlog };