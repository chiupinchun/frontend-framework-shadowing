export const Text = Symbol('Text');
export const Fragment = Symbol('Fragment');

export interface VNode {
  type: string | symbol,
  props: Record<string, any>,
  children: Array<VNode | string> | string,
  el: HTMLElement | Text,
  key: string,
  __v_isVnode: true,
  shapeFlag: number;
}

export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEEP_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

export const createVNode = (type: string | symbol, props: Record<string, any>, children: Array<VNode | string> | string = null) => {
  const shapeFlag = typeof type === 'string' ? ShapeFlags.ELEMENT : 0;

  const vnode: VNode = {
    type,
    props,
    children,
    el: null,
    key: props?.key,
    __v_isVnode: true,
    shapeFlag
  };

  if (children) {
    let type;
    if (Array.isArray(children)) type = ShapeFlags.ARRAY_CHILDREN;
    else {
      children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type;
  }
  return vnode;
};

export function isSameVnode(oldNode: VNode, newNode: VNode) {
  return (oldNode.type === newNode.type) && (oldNode.key === newNode.key);
}