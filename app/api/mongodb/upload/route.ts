import { MongoClient } from 'mongodb'

export async function POST(req: Request) {
  try {
    // 获取请求体
    const body = await req.json()
    // 获取数据
    const { key, filename, file, password } = body
    // 判断密码
    if (password !== (process.env.FILEBOX_UPLOAD_PW ?? '')) {
      return new Response('上传密码错误', { status: 403 })
    }
    // 连接 MongoDB
    const client = new MongoClient(process.env.MONGODB_URI!)
    const db = client.db('filebox')
    const metaColl = db.collection('meta')
    const fileColl = db.collection('files')
    // 插入数据
    const baes64Length = file.length
    const chunkSize = 1024 * 1024 * 2
    const chunkCount = Math.ceil(baes64Length / chunkSize)
    const chunks = []
    for (let i = 0; i < chunkCount; i++) {
      chunks.push(file.slice(i * chunkSize, (i + 1) * chunkSize))
    }
    await metaColl.updateOne({ key }, { $set: { key, filename, chunkCount } }, { upsert: true })
    await fileColl.deleteMany({ key })
    for (let i = 0; i < chunkCount; i++) {
      await fileColl.insertOne({ key, index: i, chunk: chunks[i] })
    }
    // 返回结果
    return new Response('上传成功')
    
  } catch (error) {
    // 返回错误
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    } else {
      return new Response(JSON.stringify(error), { status: 500 })
    }
  }
}