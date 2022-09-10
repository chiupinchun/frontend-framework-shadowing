import { $data } from "../create-app"
function init() {
  for (let key in $data) {
    if ($data[key].__v_isRef) window[<any>key] = $data[key].value
    else window[<any>key] = $data[key]
  }
}

export function parseTextData(text: string) {
  init()
  const checkData = /{{(.+)}}/
  const express = text.match(checkData)[1]
  return eval(express)
}

export function parseAttrData(attrStr: string) {
  init()
  const attrArr = attrStr.split('=')
  const key = attrArr[0].slice(1)
  const value = eval(attrArr[1].slice(1, attrArr[1].length - 1))

  return key + '="' + value + '"'
}