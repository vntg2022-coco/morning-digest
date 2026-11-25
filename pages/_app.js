import { Libre_Franklin, Source_Serif_4 } from 'next/font/google'
import '../styles/globals.css'

// Newspaper look: a light serif for headlines (var(--font-serif)) and a
// Franklin-style sans for body text and buttons (var(--font-sans)).
const serif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-serif' })
const sans = Libre_Franklin({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans' })

export default function App({ Component, pageProps }) {
  return (
    <div className={`${serif.variable} ${sans.variable}`}>
      <Component {...pageProps} />
    </div>
  )
}
