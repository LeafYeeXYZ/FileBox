import { Upload as Up, Input, UploadFile, Button } from 'antd'
import { useRef, useState } from 'react'
import { GiftOutlined, LoadingOutlined } from '@ant-design/icons'
import { flushSync } from 'react-dom'

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
  const [file, setFile] = useState<UploadFile | null>(null)
  // 取件码
  const keyRef = useRef<string>('')

  // 上传事件处理函数
  const handleUpload = async () => {
    flushSync(() => {
      setButtonContent(uploading)
      setDisabled(true)
      setIsUploading(true)
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    flushSync(() => {
      setDisabled(false)
      setIsUploading(false)
      setButtonContent(upload)
      setModelTitle('上传失败')
      setModelContent(<span>取件码已被使用</span>)
      setIsModelOpen(true)
    })
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
        onChange={e => keyRef.current = e.target.value}
        disabled={isUploading}
      />

      <Button
        className='w-full absolute bottom-0 left-0'
        onClick={handleUpload}
        disabled={isUploading}
      >
        {buttonContent}
      </Button>

    </div>
  )
}