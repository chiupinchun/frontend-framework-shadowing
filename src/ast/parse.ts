import parseAttrsString from './parseAttr';
import { parseTextData } from './parseText';

export const parse = (template: string) => {
  template = template.trim();
  // 指針
  let index = 0;
  // 檢測開始標籤，捕獲標籤內文字。ex:<(div)>
  const startRegExp = /^\<([a-z]+[1-6]?)(\s[^\<]+)?\>/;
  // 檢測結束標籤，捕獲標籤內文字。ex:</(div)>
  const endRegExp = /^\<\/([a-z]+[1-6]?)\>/;
  // 檢測文字+下標籤
  const wordRegExp = /^([^\<]+)\<\/[a-z]+[1-6]?\>/;

  const tagStack: string[] = [];
  type TagContent = {
    tag?: string;
    attrs?: Record<string, any>;
    children: (string | TagContent)[];
  };
  const textStack: TagContent[] = [{ children: [] }];

  while (index < template.length - 1) {
    const rest = template.substring(index);
    // 檢測剩餘文字「開頭」為開始標籤、結束標籤或內文
    if (startRegExp.test(rest)) {
      // 捕獲標籤內文字賦值tag
      const tag = rest.match(startRegExp)[1];
      const attrsStr = rest.match(startRegExp)[2];
      const attrs = parseAttrsString(attrsStr);

      tagStack.push(tag);
      textStack.push({ tag, children: [], attrs });
      // 標籤文字字數 + 2即為開始標籤字數，將指針後移至開始標籤之後
      index += tag.length + 2 + (attrsStr ? attrsStr.length : 0);
    } else if (endRegExp.test(rest)) {
      const tag = rest.match(endRegExp)[1];
      if (tag === tagStack[tagStack.length - 1]) {
        tagStack.pop();
        const popText = textStack.pop();
        textStack[textStack.length - 1].children.push(popText);
      } else {
        throw new Error(tagStack[tagStack.length - 1] + '標籤未封閉！');
      }
      index += tag.length + 3;
    } else if (wordRegExp.test(rest)) {
      // 剩餘文字開頭非標籤，結尾為下標籤，意即標籤內容
      const text = rest.match(wordRegExp)[1];
      // 檢查標籤內文字是否全為空
      if (!/^\s+$/.test(text)) {
        textStack[textStack.length - 1].children = parseTextData(text);
      }
      index += text.length;
    } else {
      index++;
    }
  }

  return textStack[0].children;
};