import { createClient } from '@supabase/supabase-js'

// 创建客户端
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

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
    // 查询数据
    let re: { error: any, data: any } = { error: null, data: null }
    let filetype = ''
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
    filetype = re.data[0].filetype
    // 文件数据
    re = await supabase
      .storage
      .from('filebox')
      .remove(['_temp_file'])
    if (re.error) {
      throw new Error(JSON.stringify(re.error))
    }
    re = await supabase
      .storage
      .from('filebox')
      .copy(key, '_temp_file')
    if (re.error) {
      throw new Error(JSON.stringify(re.error))
    }
    if (filetype === 'text') {
      re = await supabase
        .storage
        .from('filebox')
        .download('_temp_file')
      if (re.error) {
        throw new Error(JSON.stringify(re.error))
      }
      file = await (re.data as Blob).text()
    } else {
      re = await supabase
        .storage
        .from('filebox')
        .createSignedUrl('_temp_file', 60 * 5, { download: filename })
      if (re.error) {
        throw new Error(JSON.stringify(re.error))
      }
      file = re.data.signedUrl
    }
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
    return new Response(JSON.stringify({ file, filetype }), { status: 200 })

  } catch (error) {
    // 返回错误
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    } else {
      return new Response(JSON.stringify(error), { status: 500 })
    }
  }
}