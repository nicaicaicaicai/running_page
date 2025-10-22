# 博客文章管理指南

这个目录用于存放博客文章的 Markdown 文件。通过自动化脚本，这些文件会被转换为网站上的博客内容。

## 文件格式要求

### Front Matter 格式

每个 Markdown 文件必须以 YAML Front Matter 开头，格式如下：

```yaml
---
title: 文章标题（必需）
date: YYYY-MM-DD（必需）
excerpt: 文章摘要（可选，如果不提供会自动生成）
tags: [标签1, 标签2, 标签3]（可选）
featured: true/false（可选，默认为 false）
---
```

### 字段说明

- **title**: 文章标题，必需字段
- **date**: 发布日期，格式为 YYYY-MM-DD，必需字段
- **excerpt**: 文章摘要，可选。如果不提供，系统会自动从文章内容中提取前150个字符
- **tags**: 文章标签，可选。用于分类和筛选文章
- **featured**: 是否为精选文章，可选。精选文章会在博客首页特别展示

## 文件命名规范

建议使用以下命名格式：
```
YYYY-MM-DD-article-title.md
```

例如：
- `2024-01-15-my-first-marathon.md`
- `2024-02-20-winter-running-tips.md`

## 使用流程

### 1. 创建文章
在 `blog-posts/` 目录下创建新的 Markdown 文件，按照上述格式编写内容。

### 2. 同步到网站
运行以下命令将 Markdown 文件转换为博客数据：

```bash
pnpm run blog:sync
```

### 3. 提交到 GitHub
同步完成后，提交更改到 GitHub：

```bash
git add .
git commit -m "更新博客文章"
git push
```

## 示例文章

目录中包含了两个示例文章：
- `2024-01-15-my-first-marathon.md` - 精选文章示例
- `2024-02-20-winter-running-tips.md` - 普通文章示例

你可以参考这些示例来创建自己的文章。

## 注意事项

1. **文件编码**：请使用 UTF-8 编码保存文件
2. **图片引用**：如果文章中包含图片，建议将图片放在 `public/images/blog/` 目录下
3. **链接格式**：使用相对路径引用站内链接
4. **标签一致性**：尽量使用一致的标签名称，便于分类管理

## 自动化功能

同步脚本会自动处理以下内容：
- 解析 Front Matter 元数据
- 生成文章 ID（基于文件名）
- 计算阅读时间（基于文章长度）
- 生成文章摘要（如果未提供）
- 按日期排序文章
- 更新博客数据文件

## 故障排除

如果同步过程中出现错误，请检查：
1. Markdown 文件的 Front Matter 格式是否正确
2. 必需字段（title、date）是否都已填写
3. 日期格式是否为 YYYY-MM-DD
4. 文件编码是否为 UTF-8

如有问题，可以查看控制台输出的详细错误信息。