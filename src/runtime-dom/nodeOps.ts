export const nodeOps = {
  insert(child: HTMLElement | Text, parent: HTMLElement, anchor: HTMLElement | Text = null) {
    parent.insertBefore(child, anchor);
  },
  remove(child: HTMLElement | Text) {
    const parentNode = child.parentNode;
    if (parentNode) parentNode.removeChild(child);
  },
  setElementText(el: HTMLElement, text: string) {
    el.textContent = text;
  },
  setText(node: HTMLElement | Text, text: string) {
    node.nodeValue = text;
  },
  querySelector(selector: string) {
    return document.querySelector(selector);
  },
  parentNode(node: HTMLElement) {
    return node.parentNode;
  },
  nextSibling(node: HTMLElement) {
    return node.nextSibling;
  },
  createElement(tagName: string) {
    return document.createElement(tagName);
  },
  createText(text: string) {
    return document.createTextNode(text);
  }
};