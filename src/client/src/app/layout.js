"use client"
import { Provider } from 'react-redux'
import './globals.css'
import { Inter } from 'next/font/google'
import store from '@/redux/store'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'

const inter = Inter({ subsets: ['latin'] })
import '@mantine/core/styles.css';

export default function RootLayout({ children }) {
  return (
 <Provider store={store}>
 <>
 <html lang="en">
  <head>
    <ColorSchemeScript/>
  </head>
      <body className={inter.className}>
    <MantineProvider>
    {children}
    </MantineProvider>
        </body>
    </html>
 </>
 </Provider>
  )
}
