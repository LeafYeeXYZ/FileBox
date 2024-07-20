import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '文件快递柜',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="zh-CN">
      <body className='overflow-hidden'>
        {children}
      </body>
    </html>
  )
}
