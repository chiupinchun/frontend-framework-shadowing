import { activeEffect, track, trigger } from "./effect"
import { reactive } from './reactive'
import { isObject } from "../shared"

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export const baseHandler = {
  // receiver代表this指向的對象（應傳入Proxy對象）
  get(target: any, key: any, receiver: any): boolean {
    if (key === ReactiveFlags.IS_REACTIVE) return true
    // 將數據與渲染函數綁定
    track(target, 'get', key)
    let res = Reflect.get(target, key, receiver)
    // 深度代理
    if (isObject(res)) return reactive(res)
    return res
  },
  set(target: any, key: any, value: any, receiver: any): boolean {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    // 若新值與舊值不同（意即數據改變）則執行渲染函數
    if (oldValue != value) trigger(target, 'set', key, value, oldValue)
    return result
  }
}