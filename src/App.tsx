import { ConfigProvider, Radio } from 'antd'
import Upload from './components/Upload'
import Download from './components/Download'
import Config from './components/Config'
import Modal from './components/Model'
import { useState } from 'react'
import { CloudUploadOutlined, CloudDownloadOutlined, SettingOutlined } from '@ant-design/icons'

export default function App() {

  // 各种按钮的状态
  const [disabled, setDisabled] = useState<boolean>(false)
  // 弹窗状态
  const [isModelOpen, setIsModelOpen] = useState<boolean>(false)
  const [modelContent, setModelContent] = useState<React.ReactElement>(<span>提示内容</span>)
  const [modelTitle, setModelTitle] = useState<string>('提示')
  // 当前显示的内容
  const [content, setContent] = useState<React.ReactElement>(<Download setDisabled={setDisabled} setIsModelOpen={setIsModelOpen} setModelContent={setModelContent} setModelTitle={setModelTitle} />)

  return (
    <ConfigProvider 
      theme={{
        token: {
          colorPrimary: '#ff8080',
          colorText: '#4c0519'
        },
      }}
    >
      <div className='flex flex-col items-center justify-center h-screen w-screen min-w-96'>

        <Radio.Group 
          className='w-full mb-4 max-w-sm'
          disabled={disabled}
          defaultValue='download'
          options={[
            { label: <span><CloudUploadOutlined /> 上传</span>, value: 'upload', style: { width: '33.33%', textAlign: 'center'} },
            { label: <span><CloudDownloadOutlined /> 下载</span>, value: 'download', style: { width: '33.33%', textAlign: 'center'} },
            { label: <span><SettingOutlined /> 设置</span>, value: 'config', style: { width: '33.33%', textAlign: 'center'} },
          ]}
          optionType='button'
          buttonStyle='solid'
          onChange={e => {
            if (e.target.value === 'upload') {
              setContent(<Upload setDisabled={setDisabled} setIsModelOpen={setIsModelOpen} setModelContent={setModelContent} setModelTitle={setModelTitle} />)
            } else if (e.target.value === 'download') {
              setContent(<Download setDisabled={setDisabled} setIsModelOpen={setIsModelOpen} setModelContent={setModelContent} setModelTitle={setModelTitle} />)
            } else {
              setContent(<Config />)
            }
          }}
        >
        </Radio.Group>

        <div className='w-full max-w-sm h-96 border border-gray-300 rounded-md p-4'>
          {content}
        </div>

      </div>
      <Modal
        title={modelTitle}
        content={modelContent}
        isModelOpen={isModelOpen}
        setIsModelOpen={setIsModelOpen}
      />
    </ConfigProvider>
  )
}
