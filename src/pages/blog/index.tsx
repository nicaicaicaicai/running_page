import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { blogPosts, getAllTags, getPostsByTag, sortPostsByDate, type BlogPost } from '@/static/blog-data';

/**
 * 博客列表页面组件
 * 展示所有博客文章，支持标签筛选和搜索功能
 */
const BlogIndex = () => {
  const { siteTitle } = useSiteMetadata();
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 获取所有标签
  const allTags = useMemo(() => getAllTags(), []);

  // 筛选和搜索文章
  const filteredPosts = useMemo(() => {
    let posts = blogPosts;

    // 按标签筛选
    if (selectedTag) {
      posts = getPostsByTag(selectedTag);
    }

    // 按搜索词筛选
    if (searchTerm) {
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return sortPostsByDate(posts);
  }, [selectedTag, searchTerm]);

  // 精选文章
  const featuredPosts = useMemo(() => {
    return blogPosts.filter(post => post.featured);
  }, []);

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * 清除所有筛选条件
   */
  const clearFilters = () => {
    setSelectedTag('');
    setSearchTerm('');
  };

  return (
    <Layout>
      <Helmet>
        <title>博客 - {siteTitle}</title>
        <meta name="description" content="老潘的跑步博客，分享跑步心得、经验和故事" />
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            🏃‍♂️ 跑步博客
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            分享跑步日常、心得体会和经验故事
          </p>
        </div>

        {/* 精选文章 */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              ⭐ 精选文章
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        精选
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {post.title}
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {post.readTime} 分钟阅读
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* 搜索框 */}
            <div className="relative flex-1 sm:max-w-md">
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 清除筛选按钮 */}
            {(selectedTag || searchTerm) && (
              <button
                onClick={clearFilters}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                清除筛选
              </button>
            )}
          </div>

          {/* 标签筛选 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag('')}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                !selectedTag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 文章列表 */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group block overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {post.title}
                      </h2>
                      {post.featured && (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          精选
                        </span>
                      )}
                    </div>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.date)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {post.readTime} 分钟阅读
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700"></div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                没有找到相关文章
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                尝试调整搜索条件或浏览其他标签
              </p>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="mt-12 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {blogPosts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                总文章数
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {featuredPosts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                精选文章
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {allTags.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                文章标签
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round(blogPosts.reduce((sum, post) => sum + post.readTime, 0) / blogPosts.length)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                平均阅读时长(分钟)
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogIndex;