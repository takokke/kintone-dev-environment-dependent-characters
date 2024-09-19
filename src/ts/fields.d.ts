// kintone-dts-genで作られる型
// これを見て、KitoneRestClientの型を決める
declare namespace kintone.types {
  interface Fields {
    文字列__複数行_: kintone.fieldTypes.MultiLineText;
    文字列__1行_: kintone.fieldTypes.SingleLineText;
    文字列__1行__0: kintone.fieldTypes.SingleLineText;
  }
  interface SavedFields extends Fields {
    $id: kintone.fieldTypes.Id;
    $revision: kintone.fieldTypes.Revision;
    更新者: kintone.fieldTypes.Modifier;
    作成者: kintone.fieldTypes.Creator;
    レコード番号: kintone.fieldTypes.RecordNumber;
    更新日時: kintone.fieldTypes.UpdatedTime;
    作成日時: kintone.fieldTypes.CreatedTime;
  }
}
