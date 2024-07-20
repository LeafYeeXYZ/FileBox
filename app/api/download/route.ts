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
    const coll = db.collection('files')
    // 查询数据
    const res = await coll.findOne({ key })
    // 判断数据
    if (!res) {
      return new Response('取件码不存在', { status: 404 })
    }
    // 删除数据
    if (shouldDelete) {
      await coll.deleteOne({ key })
    }
    // 返回结果
    return new Response(JSON.stringify({ filename: res.filename, file: res.file }))
  
  } catch (error) {
    // 返回错误
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    } else {
      return new Response(JSON.stringify(error), { status: 500 })
    }
  }
}