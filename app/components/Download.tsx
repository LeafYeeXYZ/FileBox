'use client'
import { Input, Button, Switch, Progress } from 'antd'
import { GiftOutlined, LoadingOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { hc } from 'hono/client'
import { f0 } from 'file0'
import { GetVar } from '../lib/getVar'

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
  const handleDownloadR2 = async (key: string, shouldDelete: boolean) => {

    const server = GetVar('SERVER')
    const password = GetVar('DOWNLOAD_PW')

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
      flushSync(() => setProgress(5))
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
      flushSync(() => setProgress(10))
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
          const timer = setTimeout(() => {
            ws.close()
            reject(new Error('下载超时, 可能是由于网络不稳定、WebSocket 连接被防火墙屏蔽、Workers 达到最大 CPU 时间等'))
          }, 1000 * 30)
          ws.addEventListener('message', event => {
            clearTimeout(timer)
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
        flushSync(() => setProgress(+(10 + 90 * (downloadData.index + 1) / (downloadData.max + 1))))
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
          setModelContent(<span>{error.message}</span>)
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
  const handleDownloadMongodb = async (key: string, shouldDelete: boolean) => {
    const password = GetVar('DOWNLOAD_PW')

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
      if (!password) throw new Error('请设置下载密码')
      // 发送下载请求 (meta)
      flushSync(() => setProgress(5))
      const res = await fetch('/api/mongodb/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, password, shouldDelete, chunkIndex: -1 })
      })
      if (res.status !== 200) {
        const error = await res.text()
        throw new Error(error)
      }
      const { filename, chunkCount }: {
        filename: string
        chunkCount: string
      } = await res.json() 
      const data: string[] = []
      // 发送下载请求 (file)
      flushSync(() => setProgress(10))
      for (let i = 0; i < +chunkCount; i++) {
        let res: Response
        try {
          res = await fetch('/api/mongodb/download', {
            method: 'POST',
            body: JSON.stringify({ key, password, shouldDelete, chunkIndex: i })
          })
          if (res.status !== 200) {
            const error = await res.text()
            throw new Error(error)
          }
        } catch (error) {
          res = await fetch('/api/mongodb/download', {
            method: 'POST',
            body: JSON.stringify({ key, password, shouldDelete, chunkIndex: i })
          })
          if (res.status !== 200) {
            const error = await res.text()
            throw new Error(error)
          }
        }
        const { file } = await res.json()
        data.push(file)
        flushSync(() => setProgress(10 + 89 * (i + 1) / +chunkCount))
      }
      // 下载文件
      flushSync(() => setProgress(100))
      const file = data.join('')
      const a = document.createElement('a')
      a.href = file
      a.download = filename
      a.click()
      // 弹窗提示
      flushSync(() => {
        setModelTitle('下载成功')
        setModelContent(<span>如果浏览器未自动弹出下载，请<a href={file} download={filename}>点击此处下载</a></span>)
        setIsModelOpen(true)
      })

    } catch (error) {
      // 弹窗提示
      flushSync(() => {
        setModelTitle('下载失败')
        if (error instanceof Error) {
          setModelContent(<span>{error.message}</span>)
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
  const handleDownloadFile0 = async (key: string, shouldDelete: boolean) => {

    const password = GetVar('DOWNLOAD_PW')

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
      if (!password) throw new Error('请设置下载密码')
      // 获取下载 Token
      flushSync(() => setProgress(5))
      const res = await fetch('/api/file0/download', {
        method: 'POST',
        body: JSON.stringify({ key, password })
      })
      if (res.status !== 200) {
        const error = await res.text()
        throw new Error(error)
      }
      const tokens = await res.json()
      // 下载文件
      flushSync(() => setProgress(10))
      const filename = await f0.useToken(tokens.keyToken).get({ as: 'text' })
      const metadata = await f0.useToken(tokens.fileToken).get({ as: 'metadata' })
      flushSync(() => setProgress(15))
      const stream = await f0.useToken(tokens.fileToken).get({ as: 'stream' })
      const reader = stream!.getReader()
      let data: number[] = []
      let end: boolean = false
      while (!end) {
        const { value, done } = await reader.read()
        if (done) {
          end = true
          flushSync(() => setProgress(100))
        } else {
          data = [...data, ...Array.from(value)]
          flushSync(() => setProgress(15 + 84 * data.length / metadata!.size))
        }
      }
      const file = new Blob([new Uint8Array(data)])
      if (shouldDelete) {
        await f0.useToken(tokens.keyToken).delete()
        await f0.useToken(tokens.fileToken).delete()
      }
      const url = URL.createObjectURL(file!)
      const a = document.createElement('a')
      a.href = url
      a.download = filename!
      a.click()
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 5 * 60 * 1000)
      // 弹窗提示
      flushSync(() => {
        setModelTitle('下载成功')
        setModelContent(<span>如果浏览器未自动弹出下载，请<a href={url} download={filename}>点击此处下载</a> (链接 5 分钟内有效)</span>)
        setIsModelOpen(true)
      })

    } catch (error) {
      // 弹窗提示
      flushSync(() => {
        setModelTitle('下载失败')
        if (error instanceof Error) {
          setModelContent(<span>{error.message}</span>)
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
  const handleDownloadSupabase = async (key: string, shouldDelete: boolean) => {
    let timer: NodeJS.Timeout | null = null
    const password = GetVar('DOWNLOAD_PW')

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
      if (!password) throw new Error('请设置下载密码')
      // 发送下载请求
      flushSync(() => setProgress(5))
      timer = setInterval(() => {
        flushSync(() => setProgress(prev => prev >= 97 ? prev : prev + Math.random() * 2))
      }, 500)
      const res = await fetch('/api/supabase/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, password, shouldDelete })
      })
      if (res.status !== 200) {
        const error = await res.text()
        throw new Error(error)
      }
      const data = await res.json() 
      // 下载文件
      const file = data.file
      const filename = data.filename
      const a = document.createElement('a')
      a.href = file
      a.download = filename
      a.click()
      // 弹窗提示
      flushSync(() => {
        setModelTitle('下载成功')
        setModelContent(<span>如果浏览器未自动弹出下载，请<a href={file} download={filename}>点击此处下载</a></span>)
        setIsModelOpen(true)
      })

    } catch (error) {
      // 弹窗提示
      flushSync(() => {
        setModelTitle('下载失败')
        if (error instanceof Error) {
          setModelContent(<span>{error.message}</span>)
        } else {
          setModelContent(<span>{JSON.stringify(error)}</span>)
        }
        setIsModelOpen(true)
      })

    } finally {
      // 清除定时器
      if (timer) clearTimeout(timer)
      // 恢复下载状态
      flushSync(() => {
        setButtonContent(download)
        setDisabled(false)
        setIsDownloading(false)
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
    mongodb: { displayName: 'MongoDB', maxUploadSize: '50MB' },
    file0: { displayName: 'File0', maxUploadSize: '50MB' },
    supabase: { displayName: 'Supabase', maxUploadSize: '50MB' },
  }
  // 解决 Next.js 的错误优化，无奈使用 state
  // 太无语了，Upload 组件同样的逻辑就不会报错
  const [displayName, setDisplayName] = useState<string>('')
  useEffect(() => {
    setDisplayName(STORAGES[GetVar('STORAGE')].displayName)
  }, [])
  
  return (
    <div className='relative w-full h-full'>

      <p className='mb-2 ml-1 text-rose-950 text-sm'>
        <GiftOutlined /> 取件码
      </p>
      <Input
        className='mb-2'
        placeholder={`请输入取件码, 当前存储服务: ${displayName}`}
        onChange={e => {
          keyRef.current = e.target.value
        }}
        disabled={isDownloading}
      />

      <Switch
        className='mt-1 mb-1'
        checkedChildren='下载后删除云端文件'
        unCheckedChildren='下载后删除云端文件'
        defaultChecked
        disabled={isDownloading}
        onChange={checked => deleteRef.current = checked}
      />

      <Progress
        className='mb-2 absolute bottom-8 left-0'
        style={{ display: isDownloading ? 'block' : 'none' }}
        percent={Math.floor(progress)}
        status='active'
        strokeColor={'#ff8080'}
      />

      <Button
        className='w-full absolute bottom-0 left-0'
        onClick={async () => {
          const storage = GetVar('STORAGE')
          if (storage === 'r2') {
            await handleDownloadR2(keyRef.current, deleteRef.current)
          } else if (storage === 'mongodb') {
            await handleDownloadMongodb(keyRef.current, deleteRef.current)
          } else if (storage === 'file0') {
            await handleDownloadFile0(keyRef.current, deleteRef.current)
          } else if (storage === 'supabase') {
            await handleDownloadSupabase(keyRef.current, deleteRef.current)
          } else {
            alert('系统错误: 未知的存储服务器')
          }
        }}
        disabled={isDownloading}
      >
        {buttonContent}
      </Button>

    </div>
  )
}