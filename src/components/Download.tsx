import { Input, Button, Switch } from 'antd'
import { GiftOutlined, LoadingOutlined } from '@ant-design/icons'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'

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

  // 下载事件处理函数
  const handleDownload = async () => {
    flushSync(() => {
      setButtonContent(downloading)
      setDisabled(true)
      setIsDownloading(true)
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    flushSync(() => {
      setDisabled(false)
      setIsDownloading(false)
      setButtonContent(download)
      setModelTitle('下载失败')
      setModelContent(<span>请检查取件码是否正确</span>)
      setIsModelOpen(true)
    })
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

      <Button
        className='w-full absolute bottom-0 left-0'
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {buttonContent}
      </Button>

    </div>
  )
}