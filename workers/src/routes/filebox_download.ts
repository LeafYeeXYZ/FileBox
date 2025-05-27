import type { Context } from 'hono'
import type { R2Bucket } from '@cloudflare/workers-types'

export async function filebox_download(c: Context): Promise<Response> {
  const r2 = c.env.filebox as R2Bucket
  try {
    const { key, password, shouldDelete, type, filetype } = await c.req.json()
    if (password !== c.env.FILEBOX_DOWNLOAD_PW) {
      return c.text('下载密码错误', 403)
    }
    if (type === 'meta') {
      const meta = await r2.get(key)
      if (!meta) {
        return c.text('文件不存在', 404)
      }
      return c.text(await meta.text())
    }
    if (type === 'file') {
      const data = await r2.get(`${key}.file`)
      if (!data) {
        return c.text('文件不存在', 404)
      }
      if (shouldDelete) {
        await r2.delete(key)
        await r2.delete(`${key}.file`)
      }
      return new Response(filetype === 'text' ? await data.text() : await data.arrayBuffer())
    }
    return c.text('请求参数错误', 400)

  } catch (e) {
    return c.text(`下载失败: ${e instanceof Error ? e.message : String(e)}`, 500)
  }
}