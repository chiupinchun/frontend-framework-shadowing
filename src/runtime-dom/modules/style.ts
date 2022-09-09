export function patchStyle(el: HTMLElement, prevValue: any, nextValue: any) {
  for (let key in nextValue) {
    el.style[<any>key] = nextValue[key]
  }
  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue == null || nextValue[key] == null) el.style[<any>key] = null
    }
  }
}
