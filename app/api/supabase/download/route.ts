import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    // 获取请求体
    const body = await req.json()
    // 获取数据
    const { key, password, shouldDelete } = body
    // 判断密码
    if (password !== (process.env.FILEBOX_DOWNLOAD_PW ?? '')) {
      return new Response('下载密码错误', { status: 403 })
    }
    // 创建客户端
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)
    // 查询数据
    let re: { error: any, data: any } = { error: null, data: null }
    let filename = ''
    let file = ''
    // 元数据
    re = await supabase
      .from('filebox')
      .select()
      .eq('key', key)
    if (re.error) {
      throw new Error(JSON.stringify(re.error))
    }
    if (re.data.length === 0) {
      return new Response('取件码不存在', { status: 404 })
    }
    filename = re.data[0].filename
    // 文件数据
    re = await supabase
      .storage
      .from('filebox')
      .download(key)
    if (re.error) {
      throw new Error(JSON.stringify(re.error))
    }
    if (re.data === null) {
      await supabase
        .from('filebox')
        .delete()
        .eq('key', key)
      return new Response('文件不存在', { status: 404 })
    }
    file = await re.data.text()
    // 删除数据
    if (shouldDelete) {
      re = await supabase
        .from('filebox')
        .delete()
        .eq('key', key)
      if (re.error) {
        throw new Error(JSON.stringify(re.error))
      }
      re = await supabase
        .storage
        .from('filebox')
        .remove([key])
      if (re.error) {
        throw new Error(JSON.stringify(re.error))
      }
    }
    // 返回结果
    return new Response(JSON.stringify({ filename, file }))

  } catch (error) {
    // 返回错误
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    } else {
      return new Response(JSON.stringify(error), { status: 500 })
    }
  }
}