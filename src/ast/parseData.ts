import { data } from "../create-app"

export function parseTextData(text: string) {
  const checkData = /({{.+}})/
  const dirtyVar = text.match(checkData)[1]
  const cleanVar = refine(dirtyVar)
  let textArr
  if (data[cleanVar] && data[cleanVar].__v_isRef) text = text.replace(dirtyVar, data[cleanVar].value)
  else if (textArr = textIsObj(cleanVar)) {
    const value = (<Array<string>>textArr).reduce((data: any, key: string) => data[key], data)
    text = text.replace(dirtyVar, value)
  } else if (data[cleanVar]) text = text.replace(dirtyVar, data[refine(cleanVar)])

  return text
}

export function parseAttrData(attr: string) {

}

function refine(text: string) {
  return text.replace('{{', '').replace('}}', '')
}

function textIsObj(text: string) {
  const arr = text.split('.')
  if (arr.length >= 2) return arr
  else return false
}