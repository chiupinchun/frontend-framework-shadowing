export default (attrsString: string) => {
  const result = {};
  if (!attrsString) return result;

  let inQuotation = false;
  let point = 0;

  // 遍歷各標籤屬性，依序將其整理成物件形式
  for (let i = 0; i < attrsString.length; i++) {
    const char = attrsString[i];
    if (char === '"') inQuotation = !inQuotation;
    else if (char === ' ' && !inQuotation) {
      Object.assign(result, generateAttr(attrsString.substring(point, i)));
      point = i;
    }
  }
  Object.assign(result, generateAttr(attrsString.substring(point)));

  return result;
};

const generateAttr = (attrString: string) => {
  attrString = attrString.trim();
  if (attrString[0] === ':') attrString = parseAttrData(attrString);
  const attrArr = attrString.match(/^(.+)="(.+)"$/);
  const result: Record<string, any> = {};
  if (attrArr[1] === 'style') {
    result.style = parseStyles(attrArr[2]);
  } else result[attrArr[1]] = attrArr[2];

  return result;
};

const parseAttrData = (attrStr: string) => {
  const attrArr = attrStr.split('=');
  const key = attrArr[0].slice(1);
  const value = eval(attrArr[1].slice(1, attrArr[1].length - 1));

  return key + '="' + value + '"';
};

const parseStyles = (stylesStr: string) => {
  const result: Record<string, string> = {};
  const styles = stylesStr.split(';');
  styles.forEach(style => {
    const styleArr = style.split(':');
    styleArr[0] = checkSlash(styleArr[0]);
    result[styleArr[0]] = styleArr[1];
  });
  return result;
};

// 處理style中包含'-'的屬性(ex:background-color)
const checkSlash = (styleKey: string) => {
  const needUpper = styleKey.indexOf('-');
  if (needUpper >= 0) return styleKey.slice(0, needUpper) + styleKey[needUpper + 1].toUpperCase() + styleKey.slice(needUpper + 2);
  return styleKey;
};