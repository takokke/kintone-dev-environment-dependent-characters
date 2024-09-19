# kintoneアプリID 1202用 環境依存文字置き換え

## npmの確認
npmを使用するため、インストールされているか確認
```
npm --version
```

## 型情報の取得・更新
```
npx kintone-dts-gen --base-url https://devreptiles.cybozu.com \
                                    -u ユーザー名 \
                                    -p パスワード \
                                    --app-id 1202
```

## アプリにファイルをアップロード

```
kintone-customize-uploader \
  --base-url https://devreptiles.cybozu.com --username ユーザー名 --password パスワード dest/customize-manifest.json
```