## Usage

### Configure Environment Variables

Please manually create the `wrangler.toml` file, and add the following content:

```toml
name = "api"
main = "dist/index.js"
compatibility_date = "2024-04-05"

[vars]
FILEBOX_UPLOAD_PW = "YOUR_FILEBOX_UPLOAD_PASSWORD"
FILEBOX_DOWNLOAD_PW = "YOUR_FILEBOX_DOWNLOAD_PASSWORD"

[[r2_buckets]]
binding = "filebox"
bucket_name = "YOUR_BUCKET_NAME"

[observability] # Optional
enabled = true # Optional
```

### Deployment

```bash
# Install dependencies
npm i -g bun # if you haven't installed bun yet
bun i
# Login to Cloudflare
bunx wrangler login
# Deploy
bun dep
```

## API Reference
| Function | Path | Method | Query Parameters | Request Body | Response |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Upload file | `/filebox/upload` | `POST` | - | `key`: pickup code<br>`filename`: file name<br>`password`: upload password<br>`file`: base64 encoded file | `application/json` |
| Download file | `/filebox/download` | `POST` | - | `key`: pickup code<br>`password`: download password<br>`shouldDelete`: whether to delete the file<br>`filetype`: `file` or `text` | `application/json` |
