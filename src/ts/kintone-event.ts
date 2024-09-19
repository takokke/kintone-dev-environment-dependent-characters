import { KintoneRestAPIClient } from "@kintone/rest-api-client";


const nonJISRegex = /[^\u0020-\u007E\u00A1-\u00DF\uFF61-\uFF9F\uFF61-\uFF9F\u3041-\u3093\u30A1-\u30F6\u4E00-\u9FA0\u3000-\u303F\uFF01-\uFF5E]/g;

const replaceNonJISCharacters = (input: string) => {

    // 置き換え文字を定義
    let replacementCharacter = '[縺]';

    return input.replace(nonJISRegex, replacementCharacter);
}

interface KintoneEvent {
    record: kintone.types.SavedFields;
}

// レコード詳細画面において、環境依存文字に置き換えたフィールドを色付けする。
// まずは、全種類のフィールドを取得する必要がある。
kintone.events.on("app.record.detail.show", (event: KintoneEvent)=> {
    const record = event.record;
    


    return event;
})