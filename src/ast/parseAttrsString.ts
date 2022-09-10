// interface attrs {
//   name: string,
//   value: string
// }



export default function (attrsString: string) {
  const result = {}
  if (!attrsString) return result
  attrsString = attrsString.trim()
  let inQuotation = false
  let point = 0

  // 遍歷各標籤屬性，依序將其整理成物件形式
  for (let i = 0; i < attrsString.length; i++) {
    const char = attrsString[i]
    if (char === '"') inQuotation = !inQuotation
    else if (char === ' ' && !inQuotation) {
      Object.assign(result, generateAttr(attrsString.substring(point, i)))
      point = i
    }
  }
  Object.assign(result, generateAttr(attrsString.substring(point)))

  return result
}

// 一次僅需處理一種屬性
function generateAttr(attrString: string) {
  attrString = attrString.trim()
  const attrArr = attrString.match(/^(.+)="(.+)"$/)
  const result: any = {}
  if (attrArr[1] === 'style') {
    result.style = parseStyles(attrArr[2])
  } else result[attrArr[1]] = attrArr[2]

  return result
}

// 處理style
function parseStyles(stylesStr: string) {
  const result: any = {}
  const styles = stylesStr.split(';')
  styles.forEach(style => {
    const styleArr = style.split(':')
    styleArr[0] = checkSlash(styleArr[0])
    result[styleArr[0]] = styleArr[1]
  })
  return result
}

// 處理style中包含'-'的屬性(ex:background-color)
function checkSlash(styleKey: string) {
  const needUpper = styleKey.indexOf('-')
  if (needUpper >= 0) return styleKey.slice(0, needUpper) + styleKey[needUpper + 1].toUpperCase() + styleKey.slice(needUpper + 2)
  return styleKey
}