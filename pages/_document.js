import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="icon" type="image/x-icon" href="/site-do-trabalhador.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/site-do-trabalhador.ico" />
        <link rel="apple-touch-icon" href="/site-do-trabalhador.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
