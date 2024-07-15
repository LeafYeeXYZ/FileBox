**基于 `Cloudflare R2` 存储桶的无服务器文件快递柜, 采用 `WebSockets`, `React`, `Ant Design`, `Tailwind CSS`, `Hono` (后端) 等技术栈.**

**A serverless file delivery web app based on `Cloudflare R2`, using `WebSockets`, `React`, `Ant Design`, `Tailwind CSS`, `Hono` (backend), etc.**

# Usage

## Install Dependencies

```bash
bun i
```

## Local Development

```bash
bun dev
```

## Build

```bash
bun run build
```

## Deploy Server Side

See [this project](https://github.com/LeafYeeXYZ/MyAPIs).

# Note

Optioanlly, you can set `VITE_DEFAULT_SERVER` / `VITE_DEFAULT_UPLOAD_PW` / `VITE_DEFAULT_DOWNLOAD_PW` environment variables in `.env` file or `Cloudflare Pages`, `Vercel`, etc.