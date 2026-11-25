import Link from 'next/link'
import AppLayout from '../../components/AppLayout'
import Reader from '../../components/Reader'
import { storyAccess } from '../../lib/access.mjs'
import { PLANS } from '../../lib/plans.mjs'
import { loadReader } from '../../lib/reader-context'
import { adminDb, getArticle, getPicks } from '../../lib/store.mjs'

export async function getServerSideProps(ctx) {
  const reader = await loadReader(ctx)
  if (reader.redirect) return reader
  const { user, profile, plan, languages } = reader

  const id = Number(ctx.params.id)
  const article = Number.isInteger(id) ? await getArticle(id, profile.native_lang) : null
  if (!article || !languages.some(l => l.lang === article.lang)) return { notFound: true }

  const picks = await getPicks(user.id, article.lang)
  const access = storyAccess(plan, article.storyId, picks[article.date])
  if (access !== 'open') return { redirect: { destination: `/dashboard?lang=${article.lang}`, permanent: false } }

  const canSave = PLANS[plan].vocab
  let saved = []
  if (canSave) {
    const { data } = await adminDb()
      .from('vocab')
      .select('lemma, meaning')
      .eq('user_id', user.id)
      .eq('article_id', id)
      .order('created_at', { ascending: false })
    saved = data ?? []
  }

  return { props: { article, nativeLang: profile.native_lang, canSave, saved } }
}

export default function ReadPage({ article, nativeLang, canSave, saved }) {
  return (
    <AppLayout title={article.headline.text} wide>
      <Link href={`/dashboard?lang=${article.lang}`} legacyBehavior>
        <a className="back">← Today&apos;s stories</a>
      </Link>
      <Reader article={article} learnLang={article.lang} nativeLang={nativeLang} canSave={canSave} initialSaved={saved} />
      <style jsx>{`
        .back {
          display: inline-block;
          font-size: 14px;
          color: #326891;
          margin-bottom: 18px;
        }
      `}</style>
    </AppLayout>
  )
}
