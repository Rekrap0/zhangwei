import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>张薇失联事件</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
