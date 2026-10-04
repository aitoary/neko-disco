# NEKO DISCO — ローカル開発・外部Git移行

## この書き出しについて

公開中のバージョン11のプロジェクトです。
元ソースのコミット: `dd9fcfdbe0f164a526da30c211d0393e599c092b`

アプリの実装、依存関係、lockfile、画像・音声、設定ファイルは元のままです。
ローカル用の説明書、Nodeバージョン指定、TypeScriptの参照ファイル、照合用のマニフェストを追加しています。

## 必要な環境

- Node.js 24推奨（package.jsonの指定は22.13.0以上）
- npm
- 初回の依存関係インストール時はインターネット接続

macOS・Windows・Linux用のローカル起動経路を既存のスクリプトが持っています。
APIキー、ChatGPTへのログイン、Cloudflareへのログイン、環境変数の設定は、このLPのローカル実行には不要です。

## 起動

ZIPを展開し、`neko-disco` フォルダで実行します。

```sh
npm ci
npm run dev
```

開発サーバー: http://localhost:5173/
試聴ページ: http://localhost:5173/music-samples

nvmを使用している場合は、先に `nvm install` と `nvm use` を実行できます。

## 本番ビルドのローカル確認

```sh
npm run build
npm start -- --port 8787
```

http://127.0.0.1:8787/ を開きます。
これはローカルでの起動です。外部へのデプロイ操作は行いません。

## 構成

- `app/`: Reactの画面、スタイル、猫種・生態データ、音楽再生、吹き出し
- `components/`, `hooks/`, `lib/`: UI部品・共通処理
- `public/images/`: ディスコ背景と12猫種のイラスト
- `public/music-samples/`: 全サンプル、STAR POP EXPRESSのフル版・イントロ・ループ音源
- `public/music-samples.html`, `public/music-samples-loop.js`: 試聴ページ
- `audio-source/`: 音楽の制作・レンダリング用コードと検証データ
- `package.json`, `package-lock.json`: 依存関係と固定バージョン
- `vite.config.ts`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`: 開発・ビルド設定
- `build/`, `scripts/`: Vinext / Cloudflare Workerのビルド・ローカル起動処理
- `.openai/hosting.json`: 元サイトの非秘密の設定。現行のビルドが参照するので同梱しています
- `vendor/`, `build/sites-vite-plugin.LICENSE`: 同梱コードのライセンス

このプロジェクトはReact / TypeScriptのApp Router形式で、Vinext / ViteとCloudflare Workerを使っています。
アプリのソースは `src/` ではなく `app/` にあります。

音楽を聴くにはヘッダーのSOUND OFFをクリックします。
最初の読み込み後にイントロを再生し、その後は本編のWAVを連続ループします。
音楽の再制作にはPython・NumPy・SciPy・FFmpegが必要ですが、サイトの起動には不要です。

## 外部Gitリポジトリで継続開発

展開したフォルダには元サイトのGit認証情報やリモート設定は含まれません。

```sh
git init
git add .
git commit -m "Import NEKO DISCO"
git branch -M main
git remote add origin <外部GitリポジトリのURL>
git push -u origin main
```

`node_modules/`、ビルド出力、ローカルツールの状態、認証情報は書き出しに含めません。
依存関係は同梱のlockfileを使い、`npm ci` でインストールします。
画像・音声は外部URLへの参照に置き換えず、実ファイルをすべて同梱しています。

元のスターターの詳細説明は `README.md` にあります。
