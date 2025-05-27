import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { filebox_upload } from './routes/filebox_upload'
import { filebox_download } from './routes/filebox_download'

const app = new Hono()

app.use('*', cors())
app.post('/filebox/upload', filebox_upload)
app.post('/filebox/download', filebox_download)
app.all('*', () => new Response('请求路径错误 / Not Found', { status: 404 }))

export default app
