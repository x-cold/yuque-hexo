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
[download-image]: https://img.shields.io/npm/dm/yuque-hexo.svg?style=flat-square
[download-url]: https://npmjs.org/package/yuque-hexo

A downloader for articles from yuque

# Usage

## Premise

事先拥有一个 [hexo](https://github.com/hexojs/hexo) 项目，在`package.json`配置相关信息，详见 [例子](#Example)。

## Config

> package.json

```json
{
  "name": "your hexo project",
  "yuqueConfig": {
    "postPath": "source/_posts/yuque",
    "cachePath": "yuque.json",
    "adapter": "hexo",
    "baseUrl": "https://www.yuque.com/api/v2",
    "login": "yinzhi",
    "repo": "blog",
    "mdNameFormat": "title",
  }
}
```

| 参数名 | 含义 | 默认值 |
| --- | --- | --- |
| postPath | 文档同步后生成的路径 | source/_posts/yuque |
| cachePath | 文档下载缓存文件 | yuque.json |
| mdNameFormat | 文件名命名方式 (title / slug) | title |
| adapter | 文档生成格式 (目前仅支持 hexo) | hexo |
| baseUrl | 语雀 API 地址 | - |
| login | 语雀 login (group) | - |
| repo | 语雀仓库短名称 | - |
|  |  |  |

> slug 是语雀的永久链接名，一般是几个随机字母。

## Install

```
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
  "dev": "npm run sync && hexo s",
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

1. 语雀同步过来的文章会生成两部分文件；

* yuque.json: 从语雀 API 拉取的数据
* source/_posts/yuque/*.md: 生成的 md 文件

1. 支持配置front-matter, 语雀编辑器编写示例如下:

* 语雀编辑器示例，可参考[原文](https://www.yuque.com/u46795/blog/dlloc7)

![image.png](https://cdn.nlark.com/yuque/0/2019/png/103147/1549081824097-9a70a577-c0a7-480d-adf1-81fb2f259938.png#align=left&display=inline&height=382&linkTarget=_blank&name=image.png&originHeight=764&originWidth=1650&size=134251&width=825)<br />

* 语雀编辑器转换成的markdown 如下（已做兼容）：

```markdown
tags: [hexo, node]&lt;br /&gt;date: 2018-06-09&lt;br /&gt;categories: 前端
---
```

* 标准 markdown 示例：

```markdown
date: 2015-04-18 00:00:00
tags: [css]
categories: CSS 
---
```

> 注意：分割线不能少，兼容一个或多个属性的自定义

# Example

https://github.com/x-cold/blog/blob/master/package.json

# Changelog

### v1.1.1

- 支持 hexo-front-matter，可以在文章中编辑 tags / date 等属性

### v1.2.1

- 修复 windows 环境下命令行报错的问题
- 支持自定义文件夹和博客文件命名

### v1.3.1

- 修复 front-matter 处理格式问题

### v1.4.0

- 升级项目架构，增强扩展性，支持自定义 adpter
