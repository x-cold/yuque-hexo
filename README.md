# yuque-hexo

[![NPM version][npm-image]][npm-url]
[![build status][gitflow-image]][gitflow-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/yuque-hexo.svg?style=flat-square
[npm-url]: https://npmjs.org/package/yuque-hexo
[gitflow-image]: https://github.com/x-cold/yuque-hexo/actions/workflows/nodejs.yml/badge.svg?branch=master
[gitflow-url]: https://github.com/x-cold/yuque-hexo/actions/workflows/nodejs.yml
[codecov-image]: https://codecov.io/gh/x-cold/yuque-hexo/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/x-cold/yuque-hexo
[david-image]: https://img.shields.io/david/x-cold/yuque-hexo.svg?style=flat-square
[david-url]: https://david-dm.org/x-cold/yuque-hexo
[download-image]: https://badgen.net/npm/dt/yuque-hexo
[download-url]: https://npmjs.org/package/yuque-hexo

A downloader for articles from yuque（语雀知识库同步工具）

# Usage

## Premise

> 建议使用 Node.js >= 12 

事先拥有一个 [hexo](https://github.com/hexojs/hexo) 项目，并在 `package.json` 中配置相关信息，可参考 [例子](#Example)。

## Config

### 配置 YUQUE_TOKEN

出于对知识库安全性的调整，使用第三方 API 访问知识库，需要传入环境变量 YUQUE_TOKEN，在语雀上点击 个人头像 -> 设置 -> Token 即可获取。传入 YUQUE_TOKEN 到 yuque-hexo 的进程有两种方式：

- 设置全局的环境变量 YUQUE_TOKEN
- 命令执行时传入环境变量
  - mac / linux: `YUQUE_TOKEN=xxx yuque-hexo sync`
  - windows: `set YUQUE_TOKEN=xxx && yuque-hexo sync`

### 配置 图床TOKEN(可选)
语雀的url存在防盗链的问题，直接部署可能导致图片无法加载。
如果需要语雀URL上传到图床中并替换原链接，就需要配置上传密钥。

访问图床的密钥管理获取密钥，然后传入密钥到yuque-hexo
- 腾讯云[API密钥管理](https://console.cloud.tencent.com/cam/capi)
- 阿里云[API密钥管理](https://ram.console.aliyun.com/manage/ak)
- 七牛云[API密钥管理](https://portal.qiniu.com/user/key)
- 又拍云[操作员管理](https://console.upyun.com/account/operators/)
- GitHub图床[生成Github Token](https://github.com/settings/tokens)
> 又拍云的SECRET_ID=操作员账号，SECRET_KEY=操作员密码
> 
> Github图床的`SECRET_ID=用户名`，`SECRET_KEY=Github Token`。
> 注意在生成`token`时，记得勾选上读写权限，即 `write:packages`和`read:packages`

- 在设置YUQUE_TOKEN的基础上配置SECRET_ID和SECRET_KEY
- 命令执行时传入环境变量
  - mac / linux: `YUQUE_TOKEN=xxx SECRET_ID=xxx SECRET_KEY=xxx yuque-hexo sync`
  - windows: `set YUQUE_TOKEN=xxx SECRET_ID=xxx SECRET_KEY=xxx && yuque-hexo sync`


### 配置知识库

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
    "onlyPublished": false,
    "onlyPublic": false,
    "lastGeneratePath": "lastGeneratePath.log",
    "imgCdn": {
      "enabled": false,
      "concurrency": 0,
      "imageBed": "qiniu",
      "host": "",
      "bucket": "",
      "region": "",
      "prefixKey": ""
    }
  }
}
```

| 参数名        | 含义                                 | 默认值               |
| ------------- | ------------------------------------ | -------------------- |
| postPath      | 文档同步后生成的路径                 | source/\_posts/yuque |
| cachePath     | 文档下载缓存文件                     | yuque.json           |
| lastGeneratePath | 上一次同步结束的时间戳的文件             |                       |
| mdNameFormat  | 文件名命名方式 (title / slug)        | title                |
| adapter       | 文档生成格式 (hexo/markdown)         | hexo                 |
| concurrency   | 下载文章并发数                       | 5                    |
| baseUrl       | 语雀 API 地址                        | -                    |
| login         | 语雀 login (group), 也称为个人路径   | -                    |
| repo          | 语雀仓库短名称，也称为语雀知识库路径 | -                    |
| onlyPublished | 只展示已经发布的文章                 | false                |
| onlyPublic    | 只展示公开文章                       | false                |
| imgCdn        | 语雀图片转CDN配置                    |                |
> slug 是语雀的永久链接名，一般是几个随机字母。

imgCdn 语雀图片转图床配置说明

注意：开启后会将匹配到的所有的图片都上传到图床

| 参数名       | 含义                                                                                      | 默认值     |
|-----------|-----------------------------------------------------------------------------------------|---------|
| enabled   | 是否开启                                                                                    | false   |
| concurrency | 上传图片并发数, 0代表无限制，使用github图床时，并发问题严重，建议设置为1                                               | 0       |
| imageBed  | 选择将图片上传的图床<br/>目前支持腾讯云(cos)、阿里云(oss)和七牛云(qiniu)，又拍云(upyun)，Github图床(github)<br/>默认使用七牛云 | 'qiniu' |
| host      | 使用七牛云/又拍云图床时，需要指定CDN域名前缀                                                                |         |
| bucket    | 图床的bucket名称                                                                             | -       |
| region    | 图床的的region                                                                              | -       |
| prefixKey | 文件前缀                                                                                    | -       |

> host 说明
>
> 由于七牛云默认使用CND进行图片外链访问（默认提供30天的临时域名或者添加自定义CDN域名），所以需要指定访问的域名前缀
> 例如：'host': `http://image.1874.cool`，域名后面不需要加斜杠

> 又拍云和七牛云有点类似，默认使用临时域名访问，但不同的是又拍云的临时域名暂时是由`服务名.test.upcdn.net`组成，默认为http访问
> 
> 如果使用临时域名，host可不填。使用自定义域名，默认为http访问，如果需要指定协议为https，则需要填写完整的域名
> 
> 例如 'host': `upyun.1874.cool`或 `https://upyun.1874.cool ` 

> Github图床的默认域名是`raw.githubusercontent.com`，如果要使用jsdelivr进行加速，可以配置`host`为`cdn.jsdelivr.net`，
> 
> 例如 'host': `cdn.jsdelivr.net`

> bucket和region说明
> 
> [获取腾讯云的bucket和region](https://console.cloud.tencent.com/cos/bucket)，示例：{ bucket: "blog", region: "ap-guangzhou" }
> 
> [获取阿里云的bucket和region](https://oss.console.aliyun.com/bucket)，示例：{ bucket: "blog", region: "oss-cn-shenzhen" }
> 
> [获取七牛云的bucket(空间)和region(机房)](https://portal.qiniu.com/kodo/overview)，示例：{ bucket: "blog", region: "Zone_z2" }
> 
> 七牛云机房取值: 华东(Zone_z0)华北(Zone_z1)华南(Zone_z2)
> 
> 又拍云没有bucket和region的概念，只有服务名。所以这里的bucket=服务名，region暂时保留不需要填写
> 
> Github图床也没有bucket和region的概念。所以bucket=仓库名，region暂时保留不需要填写

> prefixKey 说明
>
> 如果需要将图片上传到bucket的根目录，那么prefixKey不用配置。
>
> 如果想上传到指定目录blog/image下，则需要配置prefixKey为"prefixKey": "blog/image"。
>
> 目录名前后都不需要加斜杠

> 配置示例: [yuque-hexo配置示例](https://github.com/LetTTGACO/yuque-hexo-example)


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

## Best practice
- [语雀云端写作Hexo+Github Actions+COS持续集成](https://www.yuque.com/1874w/1874.cool/roeayv)
- [Hexo 博客终极玩法：云端写作，自动部署](https://www.yuque.com/u46795/blog/dlloc7)
- [Hexo：语雀云端写作 Github Actions 持续集成](https://www.zhwei.cn/hexo-github-actions-yuque/)

> 另外 x-cold 本人提供了一个触发 Travis CI 构建的 HTTP API 接口，详情请查看[文档](https://github.com/x-cold/aliyun-function/tree/master/travis_ci) (请勿恶意使用)

# Notice

- 语雀同步过来的文章会生成两部分文件；

  - yuque.json: 从语雀 API 拉取的数据
  - source/\_posts/yuque/\*.md: 生成的 md 文件

- 支持配置 front-matter, 语雀编辑器编写示例如下:

  - 语雀编辑器示例，可参考[原文](https://www.yuque.com/u46795/blog/dlloc7)

  ```markdown
  tags: [hexo, node]
  categories: [fe]
  cover: https://cdn.nlark.com/yuque/0/2019/jpeg/155457/1546857679810-d82e3d46-e960-419c-a715-0a82c48a2fd6.jpeg#align=left&display=inline&height=225&name=image.jpeg&originHeight=225&originWidth=225&size=6267&width=225

  ---

  some description

  <!-- more -->

  more detail
  ```

- - 如果遇到上传到语雀的图片无法加载的问题， 可以考虑开启imgCdn配置或者参考这个处理方式[yuque-hexo插件语雀图片防盗链限制的解决方案](https://1874.cool/osar7h/)或者参考这个处理方式 [#41](https://github.com/x-cold/yuque-hexo/issues/41)

# Example

- yuque to hexo: [x-cold/blog](https://github.com/x-cold/blog/blob/master/package.json)
- yuque to github repo: [txd-team/monthly](https://github.com/txd-team/monthly/blob/master/package.json)
- [yuque-hexo配置示例](https://github.com/LetTTGACO/yuque-hexo-example)

# Changelog

### v1.9.5
- 修复腾讯云图床/Github图床上传问题
- 图片上传失败时，取消停止进程
- 新增图片上传时的并发数concurrency，使用Github图床时，并发问题严重，建议设置为1

### v1.9.4
- 🔥 新增GitHub图床和又拍云图床

### v1.9.2
- 修复上传图片到图床时可能由于用户代理缺失导致403问题

### v1.9.1
- 修复不使用图床配置时报错的问题

### v1.9.0
- 🔥 支持腾讯云/阿里云/七牛云图床链接替换语雀链接

### v1.8.0
- 🔥 支持自定义的适配器 adapter，具体查看 [配置示例](https://github.com/x-cold/yuque-hexo/tree/master/test/custom-adapter-project)

### v1.7.0

- 🔥 支持配置 lastGeneratePath，同步文章后会记录一个时间戳，下一次同步文档时不再清空全部文档，只同步修改时间大于这个时间戳的文档
- 🔥 支持语雀提示区块语法
- 🐸 修复 front-matter 中 “:” 等特殊字符会导致文章无法正常生成
- 🐸 由于 [prettier 不再支持 Node 8](https://github.com/prettier/eslint-config-prettier/issues/140)，markdown 格式化仅在 node 版本 >= 10 生效
- 🐸 现在必须配置 YUQUE_TOKEN 工具才能正常工作

### v1.6.5

- 🔥 支持过滤 public 文章
- 🔥 生成的 markdown 自动格式化
- 🔥 移除去除语雀的锚点

### v1.6.4

- 🐸 修复多行 <br /> 的[问题](https://github.com/x-cold/yuque-hexo/pull/59)

### v1.6.3

- 🔥 支持嵌套的 categories 解析 #56
- 🐸 使用 [filenamify](https://github.com/sindresorhus/filenamify) 修复因为特殊字符的标题，生成非法的文件名导致的程序错误

### v1.6.2

- 🔥 使用 slug 自定义 [urlname](https://github.com/x-cold/yuque-hexo/pull/37)

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
