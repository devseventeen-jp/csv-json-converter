# csv-json-converter

GitHub Pagesで動作するCSV→JSON変換ツールです。

## 使い方

1. `site/index.html` をブラウザで開く
2. CSVを貼り付けて「変換する」を押す
3. JSONをコピーまたは保存

## GitHub Pages へのデプロイ

- `main` へpushすると `.github/workflows/gh-pages.yml` が `site/` をデプロイします。
- 初回のみ、GitHubのリポジトリ設定で Pages の Source を **GitHub Actions** に設定してください。
