'use cient'
import { Input, Button, Switch, Progress } from 'antd'
import { GiftOutlined, LoadingOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { f0 } from 'file0'
import { STORAGES } from '../lib/storage'

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

    const server = localStorage.getItem('SERVER') ?? process.env.NEXT_PUBLIC_DEFAULT_SERVER ?? ''
    const password = localStorage.getItem('DOWNLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW ?? ''

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
      // 发送下载请求（meta）
      flushSync(() => setProgress(5))
      const meatRes = await fetch(`https://${server}/filebox/download`, {
        method: 'POST',
        body: JSON.stringify({ key, password, shouldDelete, type: 'meta' }),
      })
      if (meatRes.status !== 200) {
        const error = await meatRes.text()
        throw new Error(error)
      }
      const { filename, filesize } = await meatRes.json()
      // 使用 fetch 和流式响应来获取下载进度
      flushSync(() => setProgress(10))
      const fileRes = await fetch(`https://${server}/filebox/download`, {
        method: 'POST',
        body: JSON.stringify({ key, password, shouldDelete, type: 'file' }),
      })
      if (fileRes.status !== 200) {
        const error = await fileRes.text()
        throw new Error(error)
      }
      let file: Uint8Array = new Uint8Array()
      const reader = fileRes.body!.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        file = new Uint8Array([...file, ...value])
        flushSync(() => setProgress(10 + 89 * file.byteLength / filesize))
      }
      // 下载文件, 转 blob
      flushSync(() => setProgress(100))
      const blob = new Blob([file])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
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
  const handleDownloadMongodb = async (key: string, shouldDelete: boolean) => {
    const password = localStorage.getItem('DOWNLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW ?? ''

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
      // 使用 fetch 和流式响应来获取下载进度
      const res = await fetch('/api/mongodb/download', {
        method: 'POST',
        body: JSON.stringify({ key, password, shouldDelete })
      })
      if (res.status !== 200) {
        const error = await res.text()
        throw new Error(error)
      }
      // 下载文件
      flushSync(() => setProgress(10))
      let file: string = ''
      const filesize = +res.headers.get('X-FILEBOX-Content-Length')!
      const filename = decodeURI(res.headers.get('X-FILEBOX-Content-Disposition')!.split('filename=')[1].replace(/"/g, ''))
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        file += decoder.decode(value)
        flushSync(() => setProgress(10 + 89 * file.length / filesize))
      }
      // 下载文件, base64 转 blob
      flushSync(() => setProgress(100))
      const data = file.split(',')[1]
      const blob = new Blob([new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)))])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
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
  const handleDownloadFile0 = async (key: string, shouldDelete: boolean) => {

    const password = localStorage.getItem('DOWNLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW ?? ''

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
      let data: Uint8Array = new Uint8Array()
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        data = new Uint8Array([...data, ...value])
        console.log(data.byteLength, metadata!.size)
        flushSync(() => setProgress(15 + 84 * data.byteLength / metadata!.size))
      }
      const file = new Blob([data])
      flushSync(() => setProgress(100))
      if (shouldDelete) {
        await f0.useToken(tokens.keyToken).delete()
        await f0.useToken(tokens.fileToken).delete()
      }
      const url = URL.createObjectURL(file)
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
    const password = localStorage.getItem('DOWNLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW ?? ''

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
      flushSync(() => setProgress(10))
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
      flushSync(() => setProgress(50))
      const data = await res.json() 
      // 下载文件
      const file = data.file
      const a = document.createElement('a')
      a.href = file
      a.target = '_blank'
      a.click()
      // 弹窗提示
      flushSync(() => {
        setModelTitle('下载成功')
        setModelContent(<span>如果浏览器未自动弹出下载，请<a href={file} target='_blank'>点击此处下载</a> (链接 5 分钟内有效)</span>)
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

  // 解决 Next.js 的错误优化，无奈使用 state
  // 太无语了，Upload 组件同样的逻辑就不会报错
  const [displayName, setDisplayName] = useState<string>('')
  useEffect(() => {
    setDisplayName(STORAGES[localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'supabase'].displayName)
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
          const storage = localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'supabase'
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