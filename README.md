# yuque-hexo
A downloader for articles from yuque


# Usage

## Config

> package.json

```json
{
  "name": "your hexo project",
  "yuqueConfig": {
    "baseUrl": "https://www.yuque.com/api/v2",
    "login": "yinzhi",
    "repo": "blog"
  }
}
```

## Install

```
npm i -g yuque-hexo
```

## Sync

```
yuque-hexo sync
```

## Clean

```
yuque-hexo clean
```

# Notice

语雀同步过来的文章会生成两块文件；

- yuque.json 从语雀 API 拉取的数据
- source/_posts/yuque/*.md 生成的 md 文件

# Example

https://github.com/x-cold/blog/blob/master/package.json
