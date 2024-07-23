import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    // 获取请求体
    const body = await req.json()
    // 获取数据
    let { key, filename, file, password } = body
    // 把 base64 转为 blob
    const base64 = file.split(',')[1]
    const binary = atob(base64)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i)
    }
    file = new Blob([array])
    // 判断密码
    if (password !== (process.env.FILEBOX_UPLOAD_PW ?? '')) {
      return new Response('上传密码错误', { status: 403 })
    }
    // 创建客户端
    const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_KEY ?? '')
    // 上传文件
    let re: { error: any } = { error: null }
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
      .upload(key, file, { upsert: true })
    if (re.error) {
      throw new Error(JSON.stringify(re.error))
    }
    // 返回成功
    return new Response('上传成功', { status: 200 })
    
  } catch (error) {
    // 返回错误
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    } else {
      return new Response(JSON.stringify(error), { status: 500 })
    }
  }
}