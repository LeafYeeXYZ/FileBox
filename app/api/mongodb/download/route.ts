import { MongoClient } from 'mongodb'

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
    // 连接 MongoDB
    const client = new MongoClient(process.env.MONGODB_URI!)
    const db = client.db('filebox')
    const metaColl = db.collection('meta')
    const fileColl = db.collection('files')
    // 查询数据
    const meta = await metaColl.findOne({ key }) as any
    if (!meta) {
      return new Response('取件码不存在', { status: 404 })
    }
    const { filename, chunkCount } = meta
    // 获取文件
    const file: string[] = []
    for (let i = 0; i < chunkCount; i++) {
      const data = await fileColl.findOne({ key, index: i }) as any
      if (!data) {
        return new Response('云端文件不完整, 请尝试重新上传', { status: 500 })
      }
      file.push(data.chunk)
    }
    // 删除数据
    if (shouldDelete) {
      await metaColl.deleteOne({ key })
      await fileColl.deleteMany({ key })
    }
    // 返回结果
    return new Response(
      file.join(''),
      {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': file.length.toString(),
        }
      }
    )

  } catch (error) {
    // 返回错误
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    } else {
      return new Response(JSON.stringify(error), { status: 500 })
    }
  }
}