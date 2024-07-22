import { MongoClient } from 'mongodb'

export async function POST(req: Request) {
  try {
    // 获取请求体
    const body = await req.json()
    // 获取数据
    const { key, password, shouldDelete, chunkIndex } = body
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
    let data: any
    if (+chunkIndex === -1) {
      data = await metaColl.findOne({ key })
      if (!data) {
        return new Response('取件码不存在', { status: 404 })
      } 
      if (shouldDelete) {
        await metaColl.deleteOne({ key })
      }
      return new Response(JSON.stringify({ filename: data.filename, file: '', chunkCount: data.chunkCount }))
    } else {
      data = await fileColl.findOne({ key, index: +chunkIndex })
      if (!data) {
        return new Response('文件不存在', { status: 404 })
      }
      if (shouldDelete) {
        await fileColl.deleteOne({ key, index: +chunkIndex })
      }
      return new Response(JSON.stringify({ filename: '', file: data.chunk, chunkCount: 0 }))
    }
  
  } catch (error) {
    // 返回错误
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    } else {
      return new Response(JSON.stringify(error), { status: 500 })
    }
  }
}