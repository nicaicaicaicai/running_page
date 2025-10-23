interface ISiteMetadataResult {
  siteTitle: string;
  siteUrl: string;
  description: string;
  logo: string;
  navLinks: {
    name: string;
    url: string;
  }[];
}

/**
 * 获取基础路径，确保不以斜杠结尾以避免双斜杠问题
 */
const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL;
  if (baseUrl === '/') {
    return '';
  }
  // 移除末尾的斜杠以避免双斜杠问题
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const data: ISiteMetadataResult = {
  siteTitle: '老潘的跑步记录',
  siteUrl: 'https://nicaicaicaicai.github.io/running_page',
  logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTtc69JxHNcmN1ETpMUX4dozAgAN6iPjWalQ&usqp=CAU',
  description: '老潘的个人跑步数据可视化',
  navLinks: [
    {
      name: 'Summary',
      url: `${getBasePath()}/summary`,
    },
    {
      name: 'Blog',
      url: `${getBasePath()}/blog`,
    },
    {
      name: 'About',
      url: 'https://github.com/weipanner/about', // 您的个人介绍页面
    },
  ],
};

export default data;
