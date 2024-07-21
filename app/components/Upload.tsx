'use client'
import { Upload as Up, Input, Button, Progress } from 'antd'
import { useRef, useState } from 'react'
import { GiftOutlined, LoadingOutlined } from '@ant-design/icons'
import { flushSync } from 'react-dom'
import { hc } from 'hono/client'
import { RcFile } from 'antd/es/upload'
import { f0 } from 'file0'

type UploadProps = {
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>
  setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>
  setModelContent: React.Dispatch<React.SetStateAction<React.ReactElement>>
  setModelTitle: React.Dispatch<React.SetStateAction<string>>
}

export default function Upload({ setDisabled, setIsModelOpen, setModelContent, setModelTitle }: UploadProps) {

  // 上传按钮的状态
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const upload = <span>上传</span>
  const uploading = <span>上传中 <LoadingOutlined /></span>
  const [buttonContent, setButtonContent] = useState<React.ReactElement>(upload)
  // 上传的文件
  const [file, setFile] = useState<RcFile | null>(null)
  // 取件码
  const keyRef = useRef<string>('')
  // 上传进度
  const [progress, setProgress] = useState<number>(0)

  // 上传事件处理函数
  const handleUploadR2 = async (key: string, file: RcFile | null) => {

    const server = localStorage.getItem('SERVER') ?? process.env.NEXT_PUBLIC_DEFAULT_SERVER ?? ''
    const uploadPw = localStorage.getItem('UPLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_UPLOAD_PW ?? ''
    const filename = file?.name ?? ''
    
    try {
      // 设置上传状态
      flushSync(() => {
        setButtonContent(uploading)
        setDisabled(true)
        setIsUploading(true)
        setProgress(0)
      })
      // 判断信息
      if (!key) throw new Error('请输入取件码')
      if (!file) throw new Error('请选择文件')
      if (!server) throw new Error('请设置服务器地址')
      if (!uploadPw) throw new Error('请设置上传密码')
      // 判断文件大小
      if (file.size > 1024 * 1024 * 10) throw new Error('文件过大')
      // 文件转为 number[]
      const buffer = await file.arrayBuffer()
      const array = Array.from(new Uint8Array(buffer))
      // 确定文件分块数量
      const chunkSize = 1024 * 256
      const chunks = Math.ceil(array.length / chunkSize)
      // 启动 WebSocket
      flushSync(() => setProgress(5))
      const client = hc(`https://${server}/filebox/upload`)
      const ws = client.ws.$ws(0)
      await new Promise((resolve, reject) => {
        ws.addEventListener('open', () => {
          resolve(null)
        })
        ws.addEventListener('error', error => {
          reject(error)
        })
      })
      // 发送文件信息
      flushSync(() => setProgress(10))
      for (let i = 0; i < chunks; i++) {
        const chunk = array.slice(i * chunkSize, ((i + 1) * chunkSize) > array.length ? array.length : (i + 1) * chunkSize)
        ws.send(JSON.stringify({
          key,
          max: chunks - 1,
          index: i,
          password: uploadPw,
          data: chunk,
          filename
        }))
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            ws.close()
            reject(new Error('上传超时, 可能是由于网络不稳定、WebSocket 连接被防火墙屏蔽、Workers 达到最大 CPU 时间等'))
          }, 1000 * 30)
          ws.addEventListener('message', message => {
            clearTimeout(timer)
            if (message.data === 'continue' || message.data === 'success') {
              resolve(null)
            } else {
              reject(message.data)
            }
          })
        })
        flushSync(() => setProgress(+(10 + 90 * (i + 1) / chunks)))
      }
      // 关闭 WebSocket
      ws.close()
      // 弹窗提示
      flushSync(() => {
        setModelTitle('上传成功')
        setModelContent(<span>取件码：{key}</span>)
        setIsModelOpen(true)
      })

    } catch (error) {
      // 弹窗提示
      flushSync(() => {
        setModelTitle('上传失败')
        if (error instanceof Error) {
          setModelContent(<span>{error.message}</span>)
        } else {
          setModelContent(<span>{JSON.stringify(error)}</span>)
        }
        setIsModelOpen(true)
      })

    } finally {
      // 恢复上传状态
      flushSync(() => {
        setDisabled(false)
        setIsUploading(false)
        setButtonContent(upload)
      })
    }
  }
  const handleUploadMongodb = async (key: string, file: RcFile | null) => {
    let timer: NodeJS.Timeout | null = null
    const password = localStorage.getItem('UPLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_UPLOAD_PW ?? ''
    const filename = file?.name ?? ''

    try {
      // 设置上传状态
      flushSync(() => {
        setButtonContent(uploading)
        setDisabled(true)
        setIsUploading(true)
        setProgress(0)
      })
      // 判断信息
      if (!key) throw new Error('请输入取件码')
      if (!file) throw new Error('请选择文件')
      if (!password) throw new Error('请设置上传密码')
      // 判断文件大小
      if (file.size > 1024 * 1024 * 10) throw new Error('文件过大')
      // base64 编码
      const reader = new FileReader()
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve(null)
        reader.onerror = error => reject(error)
        reader.readAsDataURL(file)
      })
      const base64 = reader.result as string
      // 发送上传请求
      flushSync(() => setProgress(5))
      timer = setInterval(() => {
        flushSync(() => setProgress(prev => prev >= 97 ? prev : prev + Math.random() * 2))
      }, 500)
      const res = await fetch('/api/mongodb/upload', {
        method: 'POST',
        body: JSON.stringify({ key, filename, file: base64, password }),
      })
      if (res.status !== 200) {
        const error = await res.text()
        throw new Error(error)
      }
      // 弹窗提示
      flushSync(() => {
        setModelTitle('上传成功')
        setModelContent(<span>取件码：{key}</span>)
        setIsModelOpen(true)
      })

    } catch (error) {
      // 弹窗提示
      flushSync(() => {
        setModelTitle('上传失败')
        if (error instanceof Error) {
          setModelContent(<span>{error.message}</span>)
        } else {
          setModelContent(<span>{JSON.stringify(error)}</span>)
        }
        setIsModelOpen(true)
      })

    } finally {
      // 清除定时器
      if (timer) clearInterval(timer)
      // 恢复上传状态
      flushSync(() => {
        setDisabled(false)
        setIsUploading(false)
        setButtonContent(upload)
      })
    }
  }
  const handleUploadFile0 = async (key: string, file: RcFile | null) => {
    let timer: NodeJS.Timeout | null = null
    const password = localStorage.getItem('UPLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_UPLOAD_PW ?? ''
    const filename = file?.name ?? ''

    try {
      // 设置上传状态
      flushSync(() => {
        setButtonContent(uploading)
        setDisabled(true)
        setIsUploading(true)
        setProgress(0)
      })
      // 判断信息
      if (!key) throw new Error('请输入取件码')
      if (!file) throw new Error('请选择文件')
      if (!password) throw new Error('请设置上传密码')
      // 判断文件大小
      if (file.size > 1024 * 1024 * 50) throw new Error('文件过大')
      // 获取 Token
      flushSync(() => setProgress(5))
      const res = await fetch('/api/file0/upload', {
        method: 'POST',
        body: JSON.stringify({ key, filename, password }),
      })
      if (res.status !== 200) {
        const error = await res.text()
        throw new Error(error)
      }
      const tokens = await res.json()
      // 发送上传请求
      flushSync(() => setProgress(10))
      timer = setInterval(() => {
        flushSync(() => setProgress(prev => prev >= 97 ? prev : prev + Math.random() * 2))
      }, 500)
      await f0.useToken(tokens.keyToken).set(filename)
      await f0.useToken(tokens.fileToken).set(file)
      // 弹窗提示
      flushSync(() => {
        setModelTitle('上传成功')
        setModelContent(<span>取件码：{key}</span>)
        setIsModelOpen(true)
      })

    } catch (error) {
      // 弹窗提示
      flushSync(() => {
        setModelTitle('上传失败')
        if (error instanceof Error) {
          setModelContent(<span>{error.message}</span>)
        } else {
          setModelContent(<span>{JSON.stringify(error)}</span>)
        }
        setIsModelOpen(true)
      })

    } finally {
      // 清除定时器
      if (timer) clearInterval(timer)
      // 恢复上传状态
      flushSync(() => {
        setDisabled(false)
        setIsUploading(false)
        setButtonContent(upload)
      })
    }
  }

  const STORAGES: {
    [key: string]: {
      displayName: string
      maxUploadSize: string
    }
  } = {
    r2: { displayName: 'Cloudflare R2', maxUploadSize: '10MB' },
    mongodb: { displayName: 'MongoDB', maxUploadSize: '10MB' },
    file0: { displayName: 'File0', maxUploadSize: '50MB' },
  }

  return (
    <div className='relative w-full h-full'>

      <div>
        <Up.Dragger
          name='file'
          multiple={false}
          beforeUpload={file => {
            setFile(file)
            return false
          }}
          onRemove={() => setFile(null)}
          // 只允许上传一个文件
          fileList={file ? [file] : []}
          disabled={isUploading}
        >
          <p className='ant-upload-text'>点击或拖拽文件到此处</p>
          <p className='ant-upload-hint'>文件需小于 {STORAGES[(localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'r2')].maxUploadSize}</p>
          <p className='ant-upload-hint'>当前存储服务: {STORAGES[(localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'r2')].displayName}</p>
        </Up.Dragger>
      </div>

      <hr className='my-4' />

      <p className='mb-2 mt-2 ml-1 text-rose-950 text-sm'>
        <GiftOutlined /> 取件码
      </p>
      <Input
        className='mb-2'
        placeholder='请输入取件码'
        onChange={e => {
          keyRef.current = e.target.value
        }}
        disabled={isUploading}
      />

      <Progress
        className='mb-2 absolute bottom-8 left-0'
        style={{ display: isUploading ? 'block' : 'none' }}
        percent={Math.floor(progress)}
        status='active'
        strokeColor={'#ff8080'}
      />

      <Button
        className='w-full absolute bottom-0 left-0'
        onClick={async () => {
          const storage = localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'r2'
          if (storage === 'r2') {
            await handleUploadR2(keyRef.current, file)
          } else if (storage === 'mongodb') {
            await handleUploadMongodb(keyRef.current, file)
          } else if (storage === 'file0') {
            await handleUploadFile0(keyRef.current, file)
          } else {
            alert('系统错误: 未知的存储服务器')
          }
        }}
        disabled={isUploading}
      >
        {buttonContent}
      </Button>

    </div>
  )
}