'use client'
import { Input, Button, Radio } from 'antd'
import { CloudOutlined, UploadOutlined, DownloadOutlined, FileOutlined } from '@ant-design/icons'
import { GetVar } from '../lib/getVar'

export default function Config() {

  return (
    <div className='relative w-full h-full'>

        <p className='mb-2 ml-1 text-rose-950 text-sm'>
          <UploadOutlined /> 上传密码
        </p>
        <Input.Password
          className='mb-2'
          defaultValue={GetVar('UPLOAD_PW')}
          placeholder='请输入上传密码'
          onChange={e => localStorage.setItem('UPLOAD_PW', e.target.value)}
        />

        <p className='mb-2 ml-1 text-rose-950 text-sm'>
          <DownloadOutlined /> 下载密码
        </p>
        <Input.Password
          className='mb-2'
          defaultValue={GetVar('DOWNLOAD_PW')}
          placeholder='请输入下载密码'
          onChange={e => localStorage.setItem('DOWNLOAD_PW', e.target.value)}
        />

        <p className='mb-2 ml-1 text-rose-950 text-sm'>
          <FileOutlined /> 存储服务器
        </p>
        <Radio.Group
          className='mb-2 w-full'
          defaultValue={GetVar('STORAGE')}
          onChange={e => localStorage.setItem('STORAGE', e.target.value)}
          buttonStyle='solid'
        >
          <Radio.Button value='r2' className='w-1/4 text-center'>R2</Radio.Button>
          <Radio.Button value='mongodb' className='w-1/4 text-center'>Mongo</Radio.Button>
          <Radio.Button value='file0' className='w-1/4 text-center'>File0</Radio.Button>
          <Radio.Button disabled value='vercel' className='w-1/4 text-center'>Vercel</Radio.Button>
        </Radio.Group>

        <p className='mb-2 ml-1 text-rose-950 text-sm'>
          <CloudOutlined /> R2 服务器地址
        </p>
        <Input
          className='mb-2'
          addonBefore='https://'
          addonAfter='/'
          defaultValue={GetVar('SERVER')}
          placeholder='api.xxx.workers.dev'
          onChange={e => localStorage.setItem('SERVER', e.target.value)}
        />

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