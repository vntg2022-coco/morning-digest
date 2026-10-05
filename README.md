# Good Morning Digest

スペイン語を学ぶアメリカ人向けの語学ニュースサービス(対応言語は当面スペイン語のみ)。
毎朝ニュースを取得し、学習中の言語・レベルに合わせてAIが要約し、英語の対訳つきでメール配信する。
ニュース取得元は GNews(開発中は無料プラン、公開時に Essential プラン €49.99/月)。配信の仕組みは Make を使わず、すべてこのリポジトリのコードで動かす方針。

## 現状 (2026-10)

| 機能 | 状態 |
|---|---|
| ランディングページ / ログイン / 新規登録 / ダッシュボード / プラン変更 | 画面のみ(データは固定のサンプル) |
| 認証・ユーザーDB | 未実装(ログインは見た目だけ) |
| ニュース取得・要約・配信 | `lib/` に実装済み。`npm run digest:preview` で確認可能。メール送信は Resend の設定待ち |
| 決済 | Stripe のテスト用決済リンクをコードに直接記載 |

## 予定している構成

```
Vercel Cron(毎朝)
  → /api/cron/digest
      → GNews API(ニュース取得)
      → Claude API(要約)
      → Supabase(記事・ユーザー設定の保存)
      → Resend(メール配信)
Next.js の画面 ← Supabase Auth(ログイン) / Stripe Checkout + Webhook(課金)
```

## 開発

必要なもの: Node.js 18.17 以上

```bash
npm install
cp .env.example .env.local   # 必要なキーを記入
npm run dev                  # http://localhost:3000
```

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド(デプロイ前にエラーがないか確認) |
| `npm run lint` | ESLint |
| `npm run digest:preview -- intermediate` | 実際のニュースで要約を作り `previews/` にHTMLを出力(beginner / intermediate / advanced) |
| `npm run set-key -- 変数名` | `.env.local` にキーを画面に表示せず保存 |
| `npm run check-keys` | キーが有効か確認(値は表示しない) |

## ディレクトリ

- `pages/` — 各ページ(Next.js Pages Router)。`/`, `/login`, `/signup`, `/dashboard`, `/billing`
- `components/` — ダッシュボードのタブとサイドバー
- `styles/globals.css` — Tailwind の読み込み(現状の見た目はほぼインライン style)

## デプロイ

`main` に push すると Vercel が自動でデプロイする。環境変数は Vercel の Project Settings → Environment Variables に設定する。
