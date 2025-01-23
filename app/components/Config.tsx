'use client'
import { Input, Button, Radio } from 'antd'
import { CloudOutlined, UploadOutlined, DownloadOutlined, FileOutlined } from '@ant-design/icons'
import { useState } from 'react'

export default function Config() {

  const [appear, setAppear] = useState<boolean>((localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'supabase') === 'r2')

  return (
    <div className='relative w-full h-full'>

        <p className='mb-2 ml-1 text-rose-950 text-sm'>
          <UploadOutlined /> 上传密码
        </p>
        <Input.Password
          defaultValue={localStorage.getItem('UPLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_UPLOAD_PW ?? ''}
          placeholder='请输入上传密码'
          onChange={e => localStorage.setItem('UPLOAD_PW', e.target.value)}
        />

        <p className='my-2 ml-1 text-rose-950 text-sm'>
          <DownloadOutlined /> 下载密码
        </p>
        <Input.Password
          defaultValue={localStorage.getItem('DOWNLOAD_PW') ?? process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW ?? ''}
          placeholder='请输入下载密码'
          onChange={e => localStorage.setItem('DOWNLOAD_PW', e.target.value)}
        />

        <p className='my-2 ml-1 text-rose-950 text-sm'>
          <FileOutlined /> 存储服务器
        </p>
        <Radio.Group
          className='w-full'
          defaultValue={localStorage.getItem('STORAGE') ?? process.env.NEXT_PUBLIC_DEFAULT_STORAGE ?? 'supabase'}
          onChange={e => {
            localStorage.setItem('STORAGE', e.target.value)
            if (e.target.value === 'r2') {
              setAppear(true)
            } else {
              setAppear(false)
            }
          }}
          buttonStyle='solid'
        >
          <Radio.Button value='r2' className='w-1/4'><span className='inline-flex justify-center items-center text-xs w-full h-full'>R2</span></Radio.Button>
          <Radio.Button value='mongodb' className='w-1/4'><span className='inline-flex justify-center items-center text-xs w-full h-full'>MongoDB</span></Radio.Button>
          <Radio.Button value='file0' className='w-1/4'><span className='inline-flex justify-center items-center text-xs w-full h-full'>File0</span></Radio.Button>
          <Radio.Button value='supabase' className='w-1/4'><span className='inline-flex justify-center items-center text-xs w-full h-full'>Supabase</span></Radio.Button>
        </Radio.Group>

        <p 
          className='my-2 ml-1 text-rose-950 text-sm'
          style={{ display: appear ? 'block' : 'none' }}
        >
          <CloudOutlined /> R2 服务器地址
        </p>
        <Input
          style={{ display: appear ? 'block' : 'none' }}
          addonBefore='https://'
          addonAfter='/'
          defaultValue={localStorage.getItem('SERVER') ?? process.env.NEXT_PUBLIC_DEFAULT_SERVER ?? ''}
          placeholder='api.xxx.workers.dev'
          onChange={e => localStorage.setItem('SERVER', e.target.value)}
        />

        <div className='absolute bottom-0 left-0 w-full'>
          <Button
            block
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
          >
            重置为默认值
          </Button>
        </div>
    </div>
  )
}