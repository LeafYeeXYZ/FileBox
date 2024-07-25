import { f0 } from 'file0'

export async function POST(req: Request) {
  try {
    // 获取请求体
    const body = await req.json()
    // 获取数据
    const { key, password } = body
    // 判断密码
    if (password !== (process.env.FILEBOX_DOWNLOAD_PW ?? '')) {
      return new Response('下载密码错误', { status: 403 })
    }
    // 查询数据
    const filename = await f0.get(key, { as: 'text' })
    // 判断数据
    if (!filename) {
      return new Response('取件码不存在', { status: 404 })
    } else if (!(await f0.get(`${key}.file`, { as: 'metadata' }))) {
      f0.delete(key)
      return new Response('文件不存在', { status: 404 })
    }
    // 生成 Token
    const fileToken = await f0.createToken(`${key}.file`, {
      expiresIn: '30min',
      maxUploadSize: '5kb'
    })
    const keyToken = await f0.createToken(key, {
      expiresIn: '30min',
      maxUploadSize: '5kb'
    })
    // 返回结果
    return new Response(JSON.stringify({ keyToken, fileToken }))
  
  } catch (error) {
    // 返回错误
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    } else {
      return new Response(JSON.stringify(error), { status: 500 })
    }
  }
}