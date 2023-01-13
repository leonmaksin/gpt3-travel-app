import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta property="og:title" content="Travel Finder" key="title"/>
        <meta property="og:description" content="Let GPT-3 find you things to do and places to see anywhere! Use when traveling, or even in your home town 😁" key="description"/>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAgjUuppkIs1PUMH5pde3hNl9ACfCJGc4A"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
