import { isArray, isString, ShapeFlags } from "../shared";

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')

export function isVnode(value: any) {
  return !!(value && value.__v_isVnode)
}

export function isSameVnode(oldNode: VNode, newNode: VNode) {
  return (oldNode.type === newNode.type) && (oldNode.key === newNode.key)
}

export interface VNode {
  type: string | symbol,
  props: any,
  children: Array<VNode | string> | string,
  el: HTMLElement | Text,
  key: string,
  __v_isVnode: boolean,
  shapeFlag: number
}

export function createVNode(type: string | symbol, props: any, children: Array<VNode | string> | string = null) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0

  const vnode: VNode = {
    type,
    props,
    children,
    el: null,
    key: props?.key,
    __v_isVnode: true,
    shapeFlag
  }

  if (children) {
    let type
    if (isArray(children)) type = ShapeFlags.ARRAY_CHILDREN
    else {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }
  return vnode
}