import { Lato } from 'next/font/google'
import "../styles/_globals.scss"

import classnames from 'classnames'

const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700', '900']})

export const metadata = {
  title: 'Gradient PG',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={classnames(lato.className)}>{children}</body>
    </html>
  )
}
