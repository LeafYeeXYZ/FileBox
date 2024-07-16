**基于 `Cloudflare R2` 存储桶的无服务器文件快递柜, 采用 `WebSockets`, `React`, `Ant Design`, `Tailwind CSS`, `Hono` 等技术栈.**

**A serverless file delivery web app based on `Cloudflare R2`, using `WebSockets`, `React`, `Ant Design`, `Tailwind CSS`, `Hono`, etc.**

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

See [this project](https://github.com/LeafYeeXYZ/MyAPIs).

见[此项目](https://github.com/LeafYeeXYZ/MyAPIs).

## Config Client
- `服务器地址`: Server Hostname.
- `上传密码`: Upload Password, should be the same as the `FILEBOX_UPLOAD_PW` environment variable in the server side.
- `下载密码`: Download Password, should be the same as the `FILEBOX_DOWNLOAD_PW` environment variable in the server side.

#### Note
Optioanlly, you can set `VITE_DEFAULT_SERVER` / `VITE_DEFAULT_UPLOAD_PW` / `VITE_DEFAULT_DOWNLOAD_PW` environment variables in client side `.env` file or `Cloudflare Pages`, `Vercel`, etc.