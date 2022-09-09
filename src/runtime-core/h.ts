import { isArray, isObject } from "../shared";
import { createVNode, isVnode, VNode } from "./vnode";

export function h(type: string | symbol, propsChildren: any, children?: Array<VNode | string> | VNode | string) {
  const l = arguments.length
  if (l === 2) {
    if (isObject(propsChildren) && !isArray(propsChildren)) {
      if (isVnode(propsChildren)) {
        // 元素需要循環創建，故包成陣列：h('tag',h(any)) => h('tag',[h(any)])
        return createVNode(type, null, [propsChildren])
      }
      // h('tag',{})
      return createVNode(type, propsChildren)
    } else {
      // h('tag',[h(any),...]) or h('tag','text')
      return createVNode(type, null, propsChildren)
    }

  } else {
    if (l > 3) {
      // h('tag',{},'text',h(any),'text')
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVnode(children)) {
      // h('tag',{},h(any))
      children = [<VNode>children]
    }
    // h('tag',{},'text') or h('tag',{},[h(any),...])
    return createVNode(type, propsChildren, <string | Array<VNode> | Array<string>>children)
  }
}