import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    // 获取请求体
    const body = await req.json()
    // 获取数据
    let { key, filename, password } = body
    // 判断密码
    if (password !== (process.env.FILEBOX_UPLOAD_PW ?? '')) {
      return new Response('上传密码错误', { status: 403 })
    }
    // 创建客户端
    const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_KEY ?? '')
    // 上传文件
    let re: { error: any, data: any } = { error: null, data: null }
    re = await supabase
      .from('filebox')
      .upsert({ key, filename })
    if (re.error) {
      throw new Error(JSON.stringify(re.error))
    }
    // 上传文件
    re = await supabase
      .storage
      .from('filebox')
      .createSignedUploadUrl(key, { upsert: true })
    if (re.error) {
      throw new Error(JSON.stringify(re.error))
    }
    // 返回成功
    return new Response(JSON.stringify({ signedUrl: re.data.signedUrl }), { status: 200 })
    
  } catch (error) {
    // 返回错误
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    } else {
      return new Response(JSON.stringify(error), { status: 500 })
    }
  }
}