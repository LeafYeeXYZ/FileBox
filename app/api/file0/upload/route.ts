import { f0 } from 'file0'

export async function POST(req: Request) {
  try {
    // 获取请求体
    const body = await req.json()
    // 获取数据
    const { key, filename, password } = body
    // 判断密码
    if (password !== (process.env.FILEBOX_UPLOAD_PW ?? '')) {
      return new Response('上传密码错误', { status: 403 })
    }
    // 生成 Token
    const keyToken = await f0.createToken(key, {
      expiresIn: '30min',
      maxUploadSize: '10kb'
    })
    const fileToken = await f0.createToken(filename, {
      expiresIn: '30min',
      maxUploadSize: '80mb'
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