'use client'
import { Input, Button, Radio } from 'antd'
import { CloudOutlined, UploadOutlined, DownloadOutlined, FileOutlined } from '@ant-design/icons'

export default function Config() {

  return (
    <div className='relative w-full h-full'>

        <p className='mb-2 ml-1 text-rose-950 text-sm'>
          <CloudOutlined /> R2 服务器地址
        </p>
        <Input
          className='mb-2'
          addonBefore='https://'
          addonAfter='/'
          defaultValue={
            localStorage.getItem('SERVER') ?? process.env.NEXT_PUBLIC_DEFAULT_SERVER ?? ''
          }
          placeholder='api.xxx.workers.dev'
          onChange={e => localStorage.setItem('SERVER', e.target.value)}
        />

        <p className='mb-2 ml-1 text-rose-950 text-sm'>
          <UploadOutlined /> 上传密码
        </p>
        <Input.Password
          className='mb-2'
          defaultValue={
            localStorage.getItem('UPLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_UPLOAD_PW ?? ''
          }
          placeholder='请输入上传密码'
          onChange={e => localStorage.setItem('UPLOAD_PW', e.target.value)}
        />

        <p className='mb-2 ml-1 text-rose-950 text-sm'>
          <DownloadOutlined /> 下载密码
        </p>
        <Input.Password
          className='mb-2'
          defaultValue={
            localStorage.getItem('DOWNLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW ?? ''
          }
          placeholder='请输入下载密码'
          onChange={e => localStorage.setItem('DOWNLOAD_PW', e.target.value)}
        />

        <p className='mb-2 ml-1 text-rose-950 text-sm'>
          <FileOutlined /> 存储服务器
        </p>
        <Radio.Group
          className='mb-2 w-full'
          defaultValue={
            localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'r2'
          }
          onChange={e => localStorage.setItem('STORAGE', e.target.value)}
          buttonStyle='solid'
        >
          <Radio.Button value='r2' className='w-1/2'>Cloudflare R2</Radio.Button>
          <Radio.Button value='mongodb' className='w-1/2'>MongoDB</Radio.Button>
        </Radio.Group>

        <Button
          className='absolute bottom-0 left-0 w-full'
          onClick={() => {
            localStorage.clear()
            window.location.reload()
          }}
        >
          重置为默认值
        </Button>
    </div>
  )
}