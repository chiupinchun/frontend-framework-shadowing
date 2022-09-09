export function patchClass(el: HTMLElement, nextValue: string) {
  if (nextValue == null) el.removeAttribute('class')
  else el.className = nextValue
}
