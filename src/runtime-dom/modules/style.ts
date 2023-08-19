type Style = null | Record<string, string>;

export const patchStyle = (el: HTMLElement, prevValue: Style, nextValue: Style) => {
  for (const key in nextValue) {
    el.style[<any>key] = nextValue[key];
  }
  if (prevValue) {
    for (const key in prevValue) {
      if (nextValue == null || nextValue[key] == null) el.style[<any>key] = null;
    }
  }
};
