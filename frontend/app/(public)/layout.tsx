import React from 'react'

function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div>{children}</div>
}

export default PublicLayout
