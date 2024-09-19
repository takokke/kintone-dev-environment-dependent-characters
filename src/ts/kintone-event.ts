import { KintoneRestAPIClient, KintoneRecordField } from "@kintone/rest-api-client";

(() => {
    'use strict';
    /* 定数の定義*/
    const nonJISRegex = /[^\u0020-\u007E\u00A1-\u00DF\uFF61-\uFF9F\uFF61-\uFF9F\u3041-\u3093\u30A1-\u30F6\u4E00-\u9FA0\u3000-\u303F\uFF01-\uFF5E]/g;

    /* 関数の定義 */
    const replaceNonJISCharacters = (input: string) => {

        // 置き換え文字を定義
        let replacementCharacter = '[縺]';

        return input.replace(nonJISRegex, replacementCharacter);
    }

    // 環境依存文字をチェックする関数
    const containsNonJISCharacters =  (input: string)=>{
      
       return nonJISRegex.test(input);
    }

    /* 型の定義 */ 
    interface KintoneEvent {
        record: kintone.types.SavedFields;
    }

    type SavedData = {
        $id: KintoneRecordField.ID;
        $revision: KintoneRecordField.Revision;
        更新者: KintoneRecordField.Modifier;
        作成者: KintoneRecordField.Creator;
        レコード番号: KintoneRecordField.RecordNumber;
        更新日時: KintoneRecordField.UpdatedTime;
        作成日時: KintoneRecordField.CreatedTime;
        文字列__複数行_: KintoneRecordField.MultiLineText;
        文字列__1行_: KintoneRecordField.SingleLineText;
        文字列__1行__0: KintoneRecordField.SingleLineText;
    }

    // レコード詳細画面において、環境依存文字を含むフィールドを黄色にする
    // まずは、全種類のフィールドを取得する必要がある。
    kintone.events.on("app.record.detail.show", (event: KintoneEvent)=> {

        const checkFieldsWithDelay = () => {
            try {
                const record = event.record;
                // フィールド名を配列で定義
                const fieldCodes: (keyof kintone.types.SavedFields)[] = [
                    '文字列__複数行_', 
                    '文字列__1行_', 
                    '文字列__1行__0',
                ];

                fieldCodes.forEach(fieldCode => {
                    const fieldValue = record[fieldCode]?.value;
                
                    console.log(`フィールド名: ${fieldCode}, 値: ${fieldValue}, 型: ${typeof fieldValue}`);
                
                    if (fieldValue == null || typeof fieldValue !== 'string') {
                        console.log(`${fieldCode} は値がnullまたは文字列ではありません。`);
                        return;
                    }
                    
                    const containsNonJIS = containsNonJISCharacters(fieldValue);
                    const containsSpecialChar = fieldValue.includes("[縺]");
                
                    console.log(`フィールド名: ${fieldCode}, Non-JIS: ${containsNonJIS}, 特殊文字: ${containsSpecialChar}`);
                
                    if (containsNonJIS || containsSpecialChar) {
                        let fieldElement = kintone.app.record.getFieldElement(fieldCode);
                        if (fieldElement === null) {
                            throw new Error(`フィールド "${fieldCode}" が見つかりません`);
                        }
                        fieldElement.style.backgroundColor = 'yellow';
                    }
                });

            } catch (err) {
                if (err instanceof Error) {
                    console.error(err);
                    alert(err.message);
                } else {
                    console.error(err);
                    alert("An unknown error occurred");
                }
            }

        }

        // 500ミリ秒後に処理を実行
        setTimeout(checkFieldsWithDelay, 100);

        return event;
    })
    // レコード一覧画面
    // 置き換えボタンを表示
    kintone.events.on("app.record.index.show", (event) => {

        if (document.getElementById('replace_button') !== null) {
          return false;
        }
        const button = document.createElement("button");
        button.id = "replace_button";
        button.innerHTML = '<span></span>環境依存文字を置換する';
        
        button.onclick = async () => {
            console.log("click!");
            // 全レコードを取得

            try {

                document.getElementById("#replace_button")?.classList.add("click");

                button.disabled = true;
                
                const client = new KintoneRestAPIClient({});
                const APP_ID = kintone.app.getId();

                if (APP_ID === null) {
                    throw new Error("アプリIDが取得できませんでした。");
                }

                const getAllRecordsParams = {
                    app: APP_ID,
                };
                
                const getAllRecordsResp = await client.record.getAllRecords<SavedData>(getAllRecordsParams);

                const targetRecords = await getAllRecordsResp.filter((record) => {
                    return nonJISRegex.test(record.文字列__複数行_.value) || 
                        nonJISRegex.test(record.文字列__1行_.value) || 
                        nonJISRegex.test(record.文字列__1行__0.value);
                });

                console.log(targetRecords);
                
                let updateRecords: any[] = [];
                
                // 更新する内容を作成
                targetRecords.forEach((record) => {
                    let updateRecord = {
                        id: record.$id.value,
                        record: {
                            文字列__複数行_: {
                                value: replaceNonJISCharacters(record.文字列__複数行_.value)
                            },
                            文字列__1行_: {
                                value: replaceNonJISCharacters(record.文字列__1行_.value)
                            },
                            文字列__1行__0: {
                                value: replaceNonJISCharacters(record.文字列__1行__0.value)
                            }
                        }
                    };
                    updateRecords.push(updateRecord);
                });


                const updateAllRecordsParams = {
                    app: APP_ID,
                    records: updateRecords,
                };
                
                await client.record.updateAllRecords(updateAllRecordsParams);
                
                // ボタン要素を取得
                const replaceButton = document.getElementById("replace_button");

                // クラスを削除
                if (replaceButton) {
                    replaceButton.classList.remove("click");
                    // HTMLを更新
                    replaceButton.innerHTML = "<span></span>環境依存文字を置換する";
                }
                button.disabled = false;
                
                alert("JIS非対応文字の置換が完了しました");
             
                location.reload();
                
            } catch (err) {
                if (err instanceof Error) {
                    console.error(err);
                    alert(err.message);
                } else {
                    console.error(err);
                    alert("An unknown error occurred");
                }
            }
        };
        
        const headerMenuSpace = kintone.app.getHeaderMenuSpaceElement();
        headerMenuSpace?.appendChild(button);
        
        return event;
    });

})();