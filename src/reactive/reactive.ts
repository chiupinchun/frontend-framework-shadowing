import { isObject } from "../shared"
import { ReactiveFlags, baseHandler } from "./baseHandler"

const reactiveMap = new WeakMap()

export function isReactive(value:any) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

export function reactive(target: any) {
  // 只代理物件對象
  if (!isObject(target)) return
  // 不代理已被代理過的對象
  if (target[ReactiveFlags.IS_REACTIVE]) return target
  // 不重複代理同一個地址，若當前地址已被代理過，則返回WeakMap實例對象中存放的代理對象
  let existingProxy = reactiveMap.get(target)
  if (existingProxy) return existingProxy
  // 代理
  const proxy = new Proxy(target, baseHandler)
  reactiveMap.set(target, proxy)
  return proxy
}







