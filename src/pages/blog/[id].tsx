import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { getPostById, blogPosts, sortPostsByDate, type BlogPost } from '@/static/blog-data';

/**
 * 博客详情页面组件
 * 展示单篇博客文章的完整内容
 */
const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { siteTitle } = useSiteMetadata();

  // 获取当前文章
  const post = id ? getPostById(id) : null;

  // 如果文章不存在，重定向到博客列表页
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // 获取相关文章（同标签的其他文章）
  const relatedPosts = blogPosts
    .filter(p => 
      p.id !== post.id && 
      p.tags.some(tag => post.tags.includes(tag))
    )
    .slice(0, 3);

  // 获取上一篇和下一篇文章
  const sortedPosts = sortPostsByDate(blogPosts);
  const currentIndex = sortedPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  /**
   * 渲染文章内容
   * 将换行符转换为段落
   */
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
        {paragraph}
      </p>
    ));
  };

  return (
    <Layout>
      <Helmet>
        <title>{post.title} - {siteTitle}</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta name="article:published_time" content={post.date} />
        <meta name="article:author" content="老潘" />
        {post.tags.map((tag: string) => (
          <meta key={tag} name="article:tag" content={tag} />
        ))}
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回博客列表
          </Link>
        </div>

        {/* 文章头部 */}
        <header className="mb-12">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {post.featured && (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                ⭐ 精选文章
              </span>
            )}
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white">
            {post.title}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.date)}
            </div>
            <div className="flex items-center">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readTime} 分钟阅读
            </div>
            <div className="flex items-center">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              老潘
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-lg italic text-gray-700 dark:text-gray-300">
              {post.excerpt}
            </p>
          </div>
        </header>

        {/* 文章内容 */}
        <article className="prose prose-lg max-w-none dark:prose-invert">
          <div className="text-lg leading-relaxed">
            {renderContent(post.content)}
          </div>
        </article>

        {/* 文章底部信息 */}
        <footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <div className="mb-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
              💡 关于这篇文章
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">发布日期：</span>
                <span className="text-blue-700 dark:text-blue-300">{formatDate(post.date)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">阅读时长：</span>
                <span className="text-blue-700 dark:text-blue-300">{post.readTime} 分钟</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-medium text-blue-800 dark:text-blue-200">标签：</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 上一篇/下一篇导航 */}
          {(prevPost || nextPost) && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {prevPost && (
                <Link
                  to={`/blog/${prevPost.id}`}
                  className="group rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-600"
                >
                  <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    ← 上一篇
                  </div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {prevPost.title}
                  </div>
                </Link>
              )}
              {nextPost && (
                <Link
                  to={`/blog/${nextPost.id}`}
                  className="group rounded-lg border border-gray-200 p-4 text-right transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-600 sm:ml-auto"
                >
                  <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    下一篇 →
                  </div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {nextPost.title}
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* 相关文章 */}
          {relatedPosts.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                🔗 相关文章
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.id}`}
                    className="group block rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-600"
                  >
                    <h4 className="mb-2 font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {relatedPost.title}
                    </h4>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                      {relatedPost.excerpt.slice(0, 80)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(relatedPost.date).toLocaleDateString('zh-CN')}</span>
                      <span>{relatedPost.readTime} 分钟</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 作者信息 */}
          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                潘
              </div>
              <div className="flex-1">
                <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  老潘
                </h4>
                <p className="mb-3 text-gray-600 dark:text-gray-300">
                  热爱跑步的程序员，用代码记录生活，用脚步丈量世界。分享跑步心得、技术感悟和生活感悟。
                </p>
                <div className="flex space-x-4">
                  <Link
                    to="/blog"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    查看更多文章 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default BlogPost;