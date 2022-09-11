import { isString } from "../../shared"

function createInvoker(callback: Function | string) {
  const invoker: any = (e: Function) => invoker.value(e)
  invoker.value = callback
  return invoker
}

// eventName包含但不限於onClick、onKeydown......
export function patchEvent(el: any, eventName: string, nextValue: Function | string) {
  if (isString(nextValue)) nextValue = eval(<string>nextValue)
  const invokers = el._vei || (el._vei = {})
  const event = eventName.slice(1)
  const exits = invokers[eventName]
  if (exits && nextValue) exits.value = nextValue
  else {
    if (nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue)
      el.addEventListener(event, invoker)
    } else if (exits) {
      el.removeEventListener(event, exits)
      exits.value = undefined
    }
  }
}
