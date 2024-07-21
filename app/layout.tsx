import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: '文件快递柜',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
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
