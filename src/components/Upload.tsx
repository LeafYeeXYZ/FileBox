import { Upload as Up, Input, Button, Progress } from 'antd'
import { useRef, useState } from 'react'
import { GiftOutlined, LoadingOutlined } from '@ant-design/icons'
import { flushSync } from 'react-dom'
import { hc } from 'hono/client'
import { RcFile } from 'antd/es/upload'

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
  const keyRef = useRef<string>(sessionStorage.getItem('uploadKey') ?? '')
  // 上传进度
  const [progress, setProgress] = useState<number>(0)

  // 上传事件处理函数
  const handleUpload = async (key: string, file: RcFile | undefined) => {

    const server = localStorage.getItem('SERVER') ?? import.meta.env.VITE_DEFAULT_SERVER ?? ''
    const uploadPw = localStorage.getItem('UPLOAD_PW') ?? import.meta.env.VITE_DEFAULT_UPLOAD_PW ?? ''
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
      if (file.size > 1024 * 1024 * 100) throw new Error('文件过大')
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
          ws.addEventListener('message', message => {
            if (message.data === 'continue' || message.data === 'success') {
              resolve(null)
            } else {
              reject(message.data)
            }
          })
        })
        flushSync(() => setProgress(+(10 + 85 * i / chunks).toFixed(2)))
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
          <p className='ant-upload-hint'>文件需小于100MB</p>
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
          sessionStorage.setItem('uploadKey', e.target.value)
        }}
        disabled={isUploading}
        defaultValue={keyRef.current}
      />

      <Progress
        className='mb-2 absolute bottom-8 left-0'
        style={{ display: isUploading ? 'block' : 'none' }}
        percent={progress}
        status='active'
        strokeColor={'#ff8080'}
      />

      <Button
        className='w-full absolute bottom-0 left-0'
        onClick={() => handleUpload(keyRef.current, file!)}
        disabled={isUploading}
      >
        {buttonContent}
      </Button>

    </div>
  )
}