'use client'
import { Upload as Up, Input, Button, Progress } from 'antd'
import { useRef, useState } from 'react'
import { GiftOutlined, LoadingOutlined } from '@ant-design/icons'
import { flushSync } from 'react-dom'
import { RcFile } from 'antd/es/upload'
import { f0 } from 'file0'
import { STORAGES } from '../lib/storage'

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
      if (file.size > 1024 * 1024 * STORAGES.r2.maxUploadSize) throw new Error('文件过大')
      // 文件转为 arrayBuffer
      const data = await file.arrayBuffer()
      // 发送上传请求
      flushSync(() => setProgress(10))
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `https://${server}/filebox/upload`)
      xhr.upload.onprogress = event => {
        flushSync(() => setProgress(+(10 + 89 * event.loaded / event.total)))
      }
      xhr.setRequestHeader('X-FILEBOX-PASSWORD', encodeURI(uploadPw))
      xhr.setRequestHeader('X-FILEBOX-KEY', encodeURI(key))
      xhr.setRequestHeader('X-FILEBOX-FILENAME', encodeURI(filename))
      xhr.send(data)
      await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(null)
        xhr.onerror = error => reject(error)
      })
      flushSync(() => setProgress(100))
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
      if (file.size > 1024 * 1024 * STORAGES.mongodb.maxUploadSize) throw new Error('文件过大')
      // base64 编码
      const reader = new FileReader()
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve(null)
        reader.onerror = error => reject(error)
        reader.readAsDataURL(file)
      })
      const base64 = reader.result as string
      const base64Length = base64.length
      const chunkSize = 1024 * 1024 * 4
      const chunkCount = Math.ceil(base64Length / chunkSize)
      const chunks = []
      for (let i = 0; i < chunkCount; i++) {
        chunks.push(base64.slice(i * chunkSize, (i + 1) * chunkSize))
      }
      // 发送上传请求 (meta)
      flushSync(() => setProgress(5))
      const res = await fetch('/api/mongodb/upload', {
        method: 'POST',
        body: JSON.stringify({ key, filename, file: '', password, chunkCount, chunkIndex: -1 }),
      })
      if (res.status !== 200) {
        const error = await res.text()
        throw new Error(error)
      }
      // 发送上传请求 (file)
      flushSync(() => setProgress(10))
      for (let i = 0; i < chunkCount; i++) {
        try {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/mongodb/upload')
          xhr.upload.onprogress = event => {
            flushSync(() => setProgress(+(10 + (89 * (i + (event.loaded / event.total)) / chunkCount))))
          }
          xhr.send(JSON.stringify({ key, filename, file: chunks[i], password, chunkCount, chunkIndex: i }))
          await new Promise((resolve, reject) => {
            xhr.onload = () => resolve(null)
            xhr.onerror = error => reject(error)
          })
        } catch (error) {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/mongodb/upload')
          xhr.upload.onprogress = event => {
            flushSync(() => setProgress(+(10 + (89 * (i + (event.loaded / event.total)) / chunkCount))))
          }
          xhr.send(JSON.stringify({ key, filename, file: chunks[i], password, chunkCount, chunkIndex: i }))
          await new Promise((resolve, reject) => {
            xhr.onload = () => resolve(null)
            xhr.onerror = error => reject(error)
          })
        }
      }
      flushSync(() => setProgress(100))
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
      if (file.size > 1024 * 1024 * STORAGES.file0.maxUploadSize) throw new Error('文件过大')
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
  const handleUploadSupabase = async (key: string, file: RcFile | null) => {
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
      if (file.size > 1024 * 1024 * STORAGES.supabase.maxUploadSize) throw new Error('文件过大')
      // 文件转为 blob
      const data = await file.arrayBuffer()
      const blob = new Blob([new Uint8Array(data)])
      // 发送上传请求
      flushSync(() => setProgress(5))
      const res = await fetch('/api/supabase/upload', {
        method: 'POST',
        body: JSON.stringify({ key, filename, password }),
      })
      if (res.status !== 200) {
        const error = await res.text()
        throw new Error(error)
      }
      const { signedUrl } = await res.json()
      // 上传文件
      flushSync(() => setProgress(10))
      // 通过 xhr 的 onprogress 事件监听上传进度
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', signedUrl)
      xhr.upload.onprogress = event => {
        flushSync(() => setProgress(+(10 + 89 * event.loaded / event.total)))
      }
      xhr.send(blob)
      await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(null)
        xhr.onerror = error => reject(error)
      })
      flushSync(() => setProgress(100))
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
          <p className='ant-upload-hint'>文件需小于 {STORAGES[localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'supabase'].maxUploadSize}MB</p>
          <p className='ant-upload-hint'>当前存储服务: {STORAGES[localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'supabase'].displayName}</p>
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
          const storage = localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'supabase'
          if (storage === 'r2') {
            await handleUploadR2(keyRef.current, file)
          } else if (storage === 'mongodb') {
            await handleUploadMongodb(keyRef.current, file)
          } else if (storage === 'file0') {
            await handleUploadFile0(keyRef.current, file)
          } else if (storage === 'supabase') {
            await handleUploadSupabase(keyRef.current, file)
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