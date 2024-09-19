(function() {
    'use strict';

    // 置き換え対象のフィールドコードを指定
    let FIELD_CODE = '文字列__複数行_';
    
    // JIS X 020に含まれない文字の正規表現
    const nonJISRegex = /[^\u0020-\u007E\u00A1-\u00DF\uFF61-\uFF9F\uFF61-\uFF9F\u3041-\u3093\u30A1-\u30F6\u4E00-\u9FA0\u3000-\u303F\uFF01-\uFF5E]/g;
                    // /[^\u0020-\u007E\u00A1-\u00DF\uFF61-\uFF9F\u3041-\u3093\u30A1-\u30F6\u4E00-\u9FA0\u3000-\u303F\uFF01-\uFF5E]/g;
    // 置き換え用の関数
    function replaceNonJISCharacters(input) {

        // 置き換え文字を定義
        let replacementCharacter = '[縺]';

        return input.replace(nonJISRegex, replacementCharacter);
    }
    
    // 環境依存文字をチェックする関数
    function containsNonJISCharacters(input) {
        return nonJISRegex.test(input);
    }

    kintone.events.on("app.record.detail.show", (event) => {
        const record = event.record;
        const fieldValue = record.文字列__複数行_.value
        // 環境依存文字が含まれている場合、背景色を変更
        if (containsNonJISCharacters(fieldValue) || fieldValue.includes("[縺]")) {
            let fieldElement = kintone.app.record.getFieldElement('文字列__複数行_');
            fieldElement.style.backgroundColor = 'yellow';
        }
        return event;
    });    
    // レコード一覧画面イベント
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
                $("#replace_button").addClass("click");
                button.disabled = true;
                
                const client = new KintoneRestAPIClient();
                const APP_ID = kintone.app.getId();
                const getAllRecordsParams = {
                    app: APP_ID,
                };
                
                
                const getAllRecordsResp = await client.record.getAllRecords(getAllRecordsParams);
                const targetRecords = await getAllRecordsResp.filter((record) => {
                    return nonJISRegex.test(record.文字列__複数行_.value);
                });
                console.log(targetRecords);
                
                let updateRecords = [];
                
                // 更新する内容を作成
                targetRecords.forEach((record) => {
                    let updateRecord = {
                        id: record.$id.value,
                        record: {
                            文字列__複数行_: {
                                value: replaceNonJISCharacters(record.文字列__複数行_.value)
                            }                            
                        }
 
                    };
                    
                    updateRecords.push(updateRecord);
                });
                
                
                const updateAllRecordsParams = {
                    app: APP_ID,
                    records: updateRecords,
                };
                
                const updateRecordsResp = await client.record.updateAllRecords(updateAllRecordsParams);
                
                $("#replace_button").removeClass("click");
                $("#replace_button").html("<span></span>環境依存文字を置換する");
                button.disabled = null;
                
                alert("JIS非対応文字の置換が完了しました");
             
                location.reload();
                
            } catch(err) {
                console.log(err);
                alert(err.message);
            }
        };
        
        const headerMenuSpace = kintone.app.getHeaderMenuSpaceElement();
        headerMenuSpace.appendChild(button);
        
        return event;
    });
})();

