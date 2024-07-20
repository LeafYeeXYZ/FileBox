'use client'
import { Modal as Md } from 'antd'

type ModalProps = {
  title: string
  content: React.ReactElement
  isModelOpen: boolean
  setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Modal({ title, content, isModelOpen, setIsModelOpen }: ModalProps) {

  return (
    <Md
      className='w-full h-full'
      title={title}
      onOk={() => setIsModelOpen(false)}
      onCancel={() => setIsModelOpen(false)}
      onClose={() => setIsModelOpen(false)}
      open={isModelOpen}
      cancelText='取消'
      okText='确定'
    >
      {content}
    </Md>
  )
}
