import { Input, Button, Switch, Progress } from 'antd'
import { GiftOutlined, LoadingOutlined } from '@ant-design/icons'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { hc } from 'hono/client'

type DownloadProps = {
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>
  setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>
  setModelContent: React.Dispatch<React.SetStateAction<React.ReactElement>>
  setModelTitle: React.Dispatch<React.SetStateAction<string>>
}

export default function Download({ setDisabled, setIsModelOpen, setModelTitle, setModelContent }: DownloadProps) {

  // 取件码
  const keyRef = useRef<string>('')
  // 下载后是否删除
  const deleteRef = useRef<boolean>(true)

  // 下载按钮的状态
  const download = <span>下载</span>
  const downloading = <span>下载中 <LoadingOutlined /></span>
  const [buttonContent, setButtonContent] = useState<React.ReactElement>(download)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  // 下载进度
  const [progress, setProgress] = useState<number>(0)

  // 下载事件处理函数
  const handleDownload = async (key: string, shouldDelete: boolean) => {

    const server = localStorage.getItem('SERVER') ?? import.meta.env.VITE_DEFAULT_SERVER ?? ''
    const password = localStorage.getItem('DOWNLOAD_PW') ?? import.meta.env.VITE_DEFAULT_DOWNLOAD_PW ?? ''

    try {
      // 设置下载状态
      flushSync(() => {
        setButtonContent(downloading)
        setDisabled(true)
        setIsDownloading(true)
        setProgress(0)
      })
      // 判断信息
      if (!key) throw new Error('请输入取件码')
      if (!server) throw new Error('请设置服务器地址')
      if (!password) throw new Error('请设置下载密码')
      // 启动 WebSocket
      flushSync(() => setProgress(10))
      const client = hc(`https://${server}/filebox/download`)
      const ws = client.ws.$ws(0)
      await new Promise((resolve, reject) => {
        ws.addEventListener('open', () => {
          resolve(null)
        })
        ws.addEventListener('error', error => {
          reject(error)
        })
      })
      // 发送下载请求
      flushSync(() => setProgress(20))
      let data: number[] = []
      let end: boolean = false
      let filename: string = ''
      type DownloadData = {
        index: number
        max: number
        data: number[]
        filename: string
        error?: string
      }
      while (!end) {
        const downloadData: DownloadData = await new Promise((resolve, reject) => {
          ws.send(JSON.stringify({ key, password, shouldDelete }))
          ws.addEventListener('message', event => {
            const downloadData = JSON.parse(event.data)
            resolve(downloadData)
          })
          ws.addEventListener('error', error => {
            reject(error)
          })
        })
        if (downloadData.error) throw new Error(downloadData.error)
        data = [...data, ...downloadData.data]
        end = downloadData.index === downloadData.max
        filename = downloadData.filename
        flushSync(() => setProgress(+(20 + 70 * downloadData.index / downloadData.max).toFixed(2)))
      }
      // 关闭 WebSocket
      ws.close()
      // 下载文件
      const blob = new Blob([new Uint8Array(data)])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      // 弹窗提示
      flushSync(() => {
        setModelTitle('下载成功')
        setModelContent(<span>如果浏览器未自动弹出下载，请<a href={url} download={filename}>点击此处下载</a> (链接 5 分钟内有效)</span>)
        setIsModelOpen(true)
      })
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 300000)

    } catch (error) {
      // 弹窗提示
      flushSync(() => {
        setModelTitle('下载失败')
        if (error instanceof Error) {
          setModelContent(<span>{error.name}<br />{error.message}</span>)
        } else {
          setModelContent(<span>{JSON.stringify(error)}</span>)
        }
        setIsModelOpen(true)
      })

    } finally {
      // 恢复下载状态
      flushSync(() => {
        setButtonContent(download)
        setDisabled(false)
        setIsDownloading(false)
      })
    }
  }

  return (
    <div className='relative w-full h-full'>

      <p className='mb-2 ml-1 text-rose-950 text-sm'>
        <GiftOutlined /> 取件码
      </p>
      <Input
        className='mb-2'
        placeholder='请输入取件码'
        onChange={e => keyRef.current = e.target.value}
        disabled={isDownloading}
      />

      <Switch
        className='mt-1'
        checkedChildren='下载后删除云端文件'
        unCheckedChildren='下载后删除云端文件'
        defaultChecked
        disabled={isDownloading}
        onChange={checked => deleteRef.current = checked}
      />

      <Progress
        className='mb-2 absolute bottom-8 left-0'
        style={{ display: isDownloading ? 'block' : 'none' }}
        percent={progress}
        status='active'
        strokeColor={'#ff8080'}
      />

      <Button
        className='w-full absolute bottom-0 left-0'
        onClick={() => handleDownload(keyRef.current, deleteRef.current)}
        disabled={isDownloading}
      >
        {buttonContent}
      </Button>

    </div>
  )
}