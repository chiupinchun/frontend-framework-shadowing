import { isFunction, isObject } from "../shared"
import { ReactiveEffect } from "./effect"
import { isReactive } from "./reactive"

function traversal(value:unknown,set = new Set) {
  if(!isObject(value) || set.has(value)) return value
  for(let key in <Object>value) {
    traversal(key,set)
  }
  return value
}

export function watch(source:unknown,cb:Function) {
  // 1. 若watch的第一個參數source為響應式數據，將其作為getter
  let getter
  if(isReactive(source)) getter = () => traversal(source)
  else if(isFunction(source)) getter = <Function>source
  else return
  // cleanup存儲上一次watch數據變更時，希望於本次watch數據變更時執行的函數
  /* 
    onCleanup使用例：假設watch一個搜索框的v-model，每當文字變化時將newValue作為參數發起請求獲取資料庫資料
    由於每次獲取數據的速度不一，有上次請求結果蓋掉本次請求結果的風險
    因此可透過cleanup()變更flag阻止異步結果賦值
  */
  let cleanup:Function
  // 利用閉包將希望下次watch數據變更時執行的函數存儲於watch方法的作用域
  const onCleanup = (fn:Function) => {
    cleanup = fn
  }
  let oldValue:unknown
  // 4.當響應式數據的值產生變化，通過其set觸發trigger，將job作為effect的schedule執行
  const job = () => {
    // 若有cleanup代表上次watch數據變更時有存儲希望於本次watch數據變更時執行的函數，故執行
    if(cleanup) cleanup()
    // 5.調用job方法的時間點響應式數據的值已改變，因此可獲得新值同時將activeEffect指定為此watch作用域中的effect
    const newValue = effect.run()
    // 6.最終以新舊值作為參數執行watch的回調函數，並更新舊值為本次更新頁面時的新值
    cb(newValue,oldValue,onCleanup)
    oldValue = newValue
  }
  // 2. 將getter傳給ReactiveEffect構造器生成實例effect
  const effect = new ReactiveEffect(getter,job)
  // 3. 首次根據響應式數據取值oldValue，同時透過響應式數據的get將其綁定實例對象effect
  oldValue = effect.run()
}