import type { Context } from 'hono'
import type { R2Bucket } from '@cloudflare/workers-types'

export async function filebox_upload(c: Context): Promise<Response> {
  const r2 = c.env.filebox as R2Bucket
  try {
    const key = decodeURI(c.req.header('X-FILEBOX-KEY') ?? '')
    const password = decodeURI(c.req.header('X-FILEBOX-PASSWORD') ?? '')
    const filename = decodeURI(c.req.header('X-FILEBOX-FILENAME') ?? '')
    const filetype = decodeURI(c.req.header('X-FILEBOX-FILETYPE') ?? 'file')
    const file = filetype === 'text' ? await c.req.text() : await c.req.arrayBuffer()
    if (!key || !password || !file || !filetype || (filetype === 'file' && !filename)) {
      return c.text('请求参数错误', 400)
    }
    if (password !== c.env.FILEBOX_UPLOAD_PW) {
      return c.text('上传密码错误', 403)
    }
    await r2.put(key, JSON.stringify({ 
      filename,
      filesize: typeof file === 'string' ? file.length : file.byteLength,
      filetype
    }))
    await r2.put(`${key}.file`, file)
  } catch (e) {
    return c.text(`上传失败: ${e instanceof Error ? e.message : String(e)}`, 500)
  }
  return c.text('上传成功')
}