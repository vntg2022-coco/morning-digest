import { Playfair_Display } from 'next/font/google'
import '../styles/globals.css'

// Serif for headlines and the newspaper look; exposed as var(--font-serif).
const serif = Playfair_Display({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-serif' })

export default function App({ Component, pageProps }) {
  return (
    <div className={serif.variable}>
      <Component {...pageProps} />
    </div>
  )
}
