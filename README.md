# yuque-hexo

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/yuque-hexo.svg?style=flat-square
[npm-url]: https://npmjs.org/package/yuque-hexo
[travis-image]: https://img.shields.io/travis/x-cold/yuque-hexo.svg?style=flat-square
[travis-url]: https://travis-ci.org/x-cold/yuque-hexo
[codecov-image]: https://codecov.io/gh/x-cold/yuque-hexo/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/x-cold/yuque-hexo
[david-image]: https://img.shields.io/david/x-cold/yuque-hexo.svg?style=flat-square
[david-url]: https://david-dm.org/x-cold/yuque-hexo
[snyk-image]: https://snyk.io/test/npm/yuque-hexo/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/yuque-hexo
[download-image]: https://badgen.net/npm/dt/yuque-hexo
[download-url]: https://npmjs.org/package/yuque-hexo

A downloader for articles from yuque（语雀知识库同步工具）

# Usage

## Premise

事先拥有一个 [hexo](https://github.com/hexojs/hexo) 项目，并在 `package.json` 中配置相关信息，可参考 [例子](#Example)。

## Config

如果你的知识库是私有的，需要注入环境变量 `YUQUE_TOKEN=xxx`，在语雀上点击 个人头像 -> 设置 -> Token 即可获取。

> package.json

```json
{
  "name": "your hexo project",
  "yuqueConfig": {
    "postPath": "source/_posts/yuque",
    "cachePath": "yuque.json",
    "mdNameFormat": "title",
    "adapter": "hexo",
    "concurrency": 5,
    "baseUrl": "https://www.yuque.com/api/v2",
    "login": "yinzhi",
    "repo": "blog",
    "onlyPublished": false
  }
}
```

| 参数名 | 含义 | 默认值 |
| --- | --- | --- |
| postPath | 文档同步后生成的路径 | source/_posts/yuque |
| cachePath | 文档下载缓存文件 | yuque.json |
| mdNameFormat | 文件名命名方式 (title / slug) | title |
| adapter | 文档生成格式 (hexo/markdown) | hexo |
| concurrency | 下载文章并发数 | 5 |
| baseUrl | 语雀 API 地址 | - |
| login | 语雀 login (group), 也称为个人路径 | - |
| repo | 语雀仓库短名称，也称为语雀知识库路径 | - |
| onlyPublished | 只展示已经发布的文章 | false |

> slug 是语雀的永久链接名，一般是几个随机字母。

## Install

```bash
npm i -g yuque-hexo
# or
npm i --save-dev yuque-hexo
```

## Sync

```
yuque-hexo sync
```

## Clean

```
yuque-hexo clean
```

## Npm Scripts

```json
{
  "sync": "yuque-hexo sync",
  "clean:yuque": "yuque-hexo clean"
}
```

## Debug

```
DEBUG=yuque-hexo.* yuque-hexo sync
```

## Travis CI

提供了一个触发 Travis CI 构建的 HTTP API 接口，详情请查看[文档](https://github.com/x-cold/aliyun-function/tree/master/travis_ci) (请勿恶意使用)

# Notice

* 语雀同步过来的文章会生成两部分文件；

  * yuque.json: 从语雀 API 拉取的数据
  * source/_posts/yuque/*.md: 生成的 md 文件

* 支持配置 front-matter, 语雀编辑器编写示例如下:

  * 语雀编辑器示例，可参考[原文](https://www.yuque.com/u46795/blog/dlloc7)

  ```markdown

  tags: [hexo, node]
  categories: fe
  cover: https://cdn.nlark.com/yuque/0/2019/jpeg/155457/1546857679810-d82e3d46-e960-419c-a715-0a82c48a2fd6.jpeg#align=left&display=inline&height=225&name=image.jpeg&originHeight=225&originWidth=225&size=6267&width=225

  ---

  some description

  <!-- more -->

  more detail
  ```

* 如果遇到上传到语雀的图片无法加载的问题，可以参考这个处理方式 [#41](https://github.com/x-cold/yuque-hexo/issues/41)

# Example

- yuque to hexo: [x-cold/blog](https://github.com/x-cold/blog/blob/master/package.json)
- yuque to github repo: [txd-team/monthly](https://github.com/txd-team/monthly/blob/master/package.json)

# Changelog

### v1.6.2

- 🔥使用 slug 自定义 urlname (https://github.com/x-cold/yuque-hexo/pull/37)

### v1.6.1

- 🐸 修复 tags 格式化[问题](https://github.com/x-cold/yuque-hexo/issues/31)

### v1.6.0

- 🐸 修复 descrption 导致的 front-matter 解析错误[问题](https://github.com/x-cold/yuque-hexo/issues/27#issuecomment-490138318)
- 🔥 支持私有仓库同步
- 🔥 使用语雀官方的 SDK，支持 YUQUE_TOKEN，可以解除 API 调用次数限制

### v1.5.0

- 支持自定义 front-matter

### v1.4.3

- 支持过滤未发布文章 `onlyPublished`

### v1.4.2

- 支持纯 markdown 导出
- 支持请求并发数量参数 `concurrency`

### v1.4.0

- 升级项目架构，增强扩展性，支持自定义 adpter

### v1.3.1

- 修复 front-matter 处理格式问题

### v1.2.1

- 修复 windows 环境下命令行报错的问题
- 支持自定义文件夹和博客文件命名

### v1.1.1

- 支持 hexo-front-matter，可以在文章中编辑 tags / date 等属性
