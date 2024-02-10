export const setProps = (
  dom: HTMLElement,
  oldProps: Record<string, any>,
  newProps: Record<string, any>
) => {
  for (const key in oldProps) { }
  for (const key in newProps) {
    setProp(dom, key, newProps[key])
  }
}

const setProp = (dom: HTMLElement, key: string, value: any) => {
  if (/^on/.test(key)) {
    (dom as any)[key.toLocaleLowerCase()] = value
  } else if (key === 'style') {
    if (value) {
      for (const styleName in value) {
        dom.style[styleName as any] = value[styleName]
      }
    }
  } else if (key === 'children') { }
  else {
    dom.setAttribute(key, value)
  }
}