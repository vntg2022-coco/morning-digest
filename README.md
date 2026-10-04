# Good Morning Digest

スペイン語・日本語などを学ぶアメリカ人向けの語学ニュースサービス。
毎朝ニュースを取得し、学習中の言語・レベルに合わせてAIが要約し、英語の対訳つきでメール配信する。
ニュース取得元は GNews(開発中は無料プラン、公開時に Essential プラン €49.99/月)。配信の仕組みは Make を使わず、すべてこのリポジトリのコードで動かす方針。

## 現状 (2026-10)

| 機能 | 状態 |
|---|---|
| ランディングページ / ログイン / 新規登録 / ダッシュボード / プラン変更 | 画面のみ(データは固定のサンプル) |
| 認証・ユーザーDB | 未実装(ログインは見た目だけ) |
| ニュース取得・要約・配信 | 未実装(旧: Make + NewsAPI + Claude + Gmail) |
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

## ディレクトリ

- `pages/` — 各ページ(Next.js Pages Router)。`/`, `/login`, `/signup`, `/dashboard`, `/billing`
- `components/` — ダッシュボードのタブとサイドバー
- `styles/globals.css` — Tailwind の読み込み(現状の見た目はほぼインライン style)

## デプロイ

`main` に push すると Vercel が自動でデプロイする。環境変数は Vercel の Project Settings → Environment Variables に設定する。
