import { createVNode, isVnode, VNode } from "./vnode";

type Props = Record<string, any>;
type ChildNode = VNode | string;

export const h: {
  (type: string, h: VNode): VNode;
  (type: string, props: Props): VNode;
  (type: string, children: ChildNode | ChildNode[]): VNode;
  (type: string, props: Props, children?: ChildNode | ChildNode[]): VNode;
  (type: string, props: Props, ...args: ChildNode[]): VNode;
} = (...args) => {
  const l = args.length;
  const type = args[0];
  if (l === 2) {
    const propsOrChildren = args[1];
    if (
      propsOrChildren &&
      typeof propsOrChildren === 'object' &&
      !Array.isArray(propsOrChildren)
    ) {
      if (isVnode(propsOrChildren)) {
        // 元素需要循環創建，故包成陣列：h('tag',h(any)) => h('tag',[h(any)])
        return createVNode(type, null, [<VNode>propsOrChildren]);
      }
      // h('tag',{})
      return createVNode(type, propsOrChildren);
    } else {
      // h('tag',[h(any),...]) or h('tag','text')
      return createVNode(type, null, <ChildNode[]>propsOrChildren);
    }
  } else {
    const props = <Props>args[1];
    let children = args[2];
    if (l > 3) {
      // h('tag',{},'text',h(any),'text')
      children = Array.from(args).slice(2);
    } else if (l === 3 && isVnode(children)) {
      // h('tag',{},h(any))
      children = [<VNode>children];
    }
    // h('tag',{},'text') or h('tag',{},[h(any),...])
    return createVNode(type, props, <string | Array<VNode> | Array<string>>children);
  }
};