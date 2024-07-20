**基于免费的 `Cloudflare R2` 和/或免费的 `MongoDB Atlas` 的无服务器文件快递柜, 采用 `Next.js`、`WebSockets`, `React`, `Ant Design`, `Tailwind CSS`, `Hono` 等技术栈.**

**A serverless file delivery web app based on free `Cloudflare R2` bucket and/or free `MongoDB Atlas` database, using `Next.js`, `WebSockets`, `React`, `Ant Design`, `Tailwind CSS`, `Hono`, etc.**

|![](README_1.png)|![](README_2.png)|![](README_3.png)|
|:---:|:---:|:---:|

# Usage
使用方法

## Install Dependencies
安装依赖

```bash
bun i
```

## Local Development
本地开发

```bash
bun dev
```

## Build
构建

```bash
bun run build
```

## Deploy Server Side
部署服务端

### For R2
如果使用 `R2`

See [this project](https://github.com/LeafYeeXYZ/MyAPIs).

见[此项目](https://github.com/LeafYeeXYZ/MyAPIs).

### For MongoDB
如果使用 `MongoDB`

Set `FILEBOX_UPLOAD_PW`, `FILEBOX_DOWNLOAD_PW`, `MONGODB_URI` environment variables in `.env` file or `Cloudflare Workers`, `Vercel`, etc.

在 `.env` 文件或 `Cloudflare Workers`, `Vercel` 等中设置 `FILEBOX_UPLOAD_PW`, `FILEBOX_DOWNLOAD_PW`, `MONGODB_URI` 环境变量.

## Config Client
- `服务器地址`: Server Hostname.
- `上传密码`: Upload Password, should be the same as the `FILEBOX_UPLOAD_PW` environment variable in the server side.
- `下载密码`: Download Password, should be the same as the `FILEBOX_DOWNLOAD_PW` environment variable in the server side.
- `存储服务器`: Storage Server, `R2` or `MongoDB`.

#### Note
Optioanlly, you can set `NEXT_PUBLIC_DEFAULT_SERVER` / `NEXT_PUBLIC_DEFAULT_UPLOAD_PW` / `NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW` / `NEXT_PUBLIC_DEFAULT_STORAGE: 'r2' | 'mongodb'` environment variables in client side `.env` file or `Cloudflare Pages`, `Vercel`, etc.

可选地, 在客户端 `.env` 文件或 `Cloudflare Pages`, `Vercel` 等中设置 `NEXT_PUBLIC_DEFAULT_SERVER` / `NEXT_PUBLIC_DEFAULT_UPLOAD_PW` / `NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW` / `NEXT_PUBLIC_DEFAULT_STORAGE: 'r2' | 'mongodb'` 环境变量.

# Known Issues
已知问题

Due to the limitation of max CPU time of the free plan of `Cloudflare Workers`, the maximum size of the file that can be uploaded is proximately 10MB when using `R2`.

由于 `Cloudflare Workers` 免费计划的最大 CPU 时间限制, 在使用 `R2` 时, 可上传的文件最大大小约为 10MB.
