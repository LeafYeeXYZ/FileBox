# FileBox
A serverless file delivery web app based on free `Cloudflare R2` / `MongoDB Atlas` / `File0` / `Supabase` databases, using `Next.js`, `WebSockets`, `React`, `Ant Design`, `Tailwind CSS`, `Hono`, etc.

基于 `Cloudflare R2` / `MongoDB Atlas` / `File0` / `Supabase` 的零成本无服务器文件快递柜, 采用 `Next.js`、`WebSockets`, `React`, `Ant Design`, `Tailwind CSS`, `Hono` 等技术栈.

|![](README_1.png)|![](README_2.png)|![](README_3.png)|
|:---:|:---:|:---:|

# Usage
使用方法

## 1 Install Dependencies
安装依赖

```bash
bun i
```

## 2 Local Development
本地开发

```bash
bun dev
```

## 3 Deploy
部署

### 3.1 Config Storage
You can use all the storage solutions while only one of them is required. And when using `R2`, you should deploy a separate server side project (not this `Next.js` project).

你可以同时使用所有存储解决方案, 但只需要其中一个. 当使用 `R2` 时, 你需要部署一个单独的服务端项目 (不是这个 `Next.js` 项目).

Above all, you should set `FILEBOX_UPLOAD_PW`, `FILEBOX_DOWNLOAD_PW` environment variables in `.env` file or `Vercel` no matter which storage solution you use.

不管使用哪种存储方案, 你都需要在 `.env` 文件或 `Vercel` 中设置 `FILEBOX_UPLOAD_PW`, `FILEBOX_DOWNLOAD_PW` 环境变量.

#### 3.1.1 For Cloudflare R2
如果使用 `R2`

See [this project](https://github.com/LeafYeeXYZ/MyAPIs).

见[此项目](https://github.com/LeafYeeXYZ/MyAPIs).

> Due to the limitation of max CPU time of the free plan of `Cloudflare Workers`, the maximum size of the file that can be uploaded is proximately 10MB when using `R2`.

> 由于 `Cloudflare Workers` 免费计划的最大 CPU 时间限制, 在使用 `R2` 时, 可上传的文件最大大小约为 10MB.

#### 3.1.2 For MongoDB
如果使用 `MongoDB`

Set `MONGODB_URI` environment variables in `.env` file or `Vercel`.

在 `.env` 文件或 `Vercel` 中设置 `MONGODB_URI` 环境变量.

#### 3.1.3 For [File0](https://file0.dev/) (Recommended)
如果使用 [`File0`](https://file0.dev/) (推荐)

Set `F0_SECRET_KEY` environment variable in `.env` file or `Vercel`.

在 `.env` 文件或 `Vercel` 中设置 `F0_SECRET_KEY` 环境变量.

#### 3.1.4 For [Supabase](https://supabase.io/)
如果使用 [`Supabase`](https://supabase.io/)

Set `SUPABASE_URL` and `SUPABASE_KEY` environment variables in `.env` file or `Vercel`.

在 `.env` 文件或 `Vercel` 中设置 `SUPABASE_URL` 和 `SUPABASE_KEY` 环境变量.

Create a storage bucket named `filebox` and create a table named `filebox` in `Supabase` dashboard. The table should have the following columns: key (text), filename (text), created_at (timestamp).

在 `Supabase` 控制台中创建一个名为 `filebox` 的存储桶, 并创建一个名为 `filebox` 的表. 表应该有以下列: key (text), filename (text), created_at (timestamp).

### 3.2 Deploy to [Vercel](https://vercel.com/)
部署到 [Vercel](https://vercel.com/)

## 4 All Environment Variables
| Name | Description | Default | Required |
| :---: | :---: | :---: | :---: |
| `FILEBOX_UPLOAD_PW` | Upload Password | - | Yes |
| `FILEBOX_DOWNLOAD_PW` | Download Password | - | Yes |
| `MONGODB_URI` | MongoDB Connection URI | - | No |
| `F0_SECRET_KEY` | File0 Secret Key | - | No |
| `SUPABASE_URL` | Supabase URL | - | No |
| `SUPABASE_KEY` | Supabase SECRET api key<br>Or `anon` api key with additional permission | - | No |
| `NEXT_PUBLIC_DEFAULT_SERVER` | Client Default R2 Server | - | No |
| `NEXT_PUBLIC_DEFAULT_UPLOAD_PW` | Client Default Upload Password | - | No |
| `NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW` | Client Default Download Password | - | No |
| `NEXT_PUBLIC_DEFAULT_STORAGE` | Client Default Storage Server<br>`r2` / `mongodb` / `file0` / `supabase` | `file0` | No |

## 5 Frontend Config
| Name | Description |
| :---: | :---: |
| `上传密码` | For authentication, should be the same as the `FILEBOX_UPLOAD_PW` environment variable in the server side |
| `下载密码` | For authentication, should be the same as the `FILEBOX_DOWNLOAD_PW` environment variable in the server side |
| `存储服务器` | Choose storage server |
| `R2 服务器地址` | See [3.1.1](#311-for-cloudflare-r2), only appears when `R2` is selected |

## 6 Upload/Dowload Realtime Progress Support
上传/下载实时进度支持情况

| Storage | Upload | Download |
| :---: | :---: | :---: |
| `R2` | ✅ (By WebSocket) | ✅ (By WebSocket) |
| `MongoDB` | ✅ (By Multi Part) | ✅ (By Multi Part) |
| `File0` | ❌ | ✅ (By Native Client Stream Download) |
| `Supabase` | ❌ | ❌ |

> I tried to implement the download progress by `Fetch API` and `ReadableStream`, but it seems that the data from server still not being handled until its fully downloaded. So I have to use `WebSocket` (for `R2`) or split one request into multiple requests (for `MongoDB`) to get the progress.

> 我尝试过使用 `Fetch API` 和 `ReadableStream` 实现下载进度, 但似乎数据仍是完全下载后才会被处理 (可读流只会在下载结束后快速触发数次读取). 所以对于 `R2`, 我使用了 `WebSocket` 来获取进度, 对于 `MongoDB`, 我将一个请求拆分为多个请求来获取进度.