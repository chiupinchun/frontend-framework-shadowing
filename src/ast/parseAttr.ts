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