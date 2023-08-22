import { RenderOptions } from "../runtime-dom";
import { Text, Fragment, VNode, ShapeFlags, isSameVnode, createVNode } from "./vnode";

export const createRenderer = (renderOptions: RenderOptions) => {
  const {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp
  } = renderOptions;

  const render = (vnode: VNode, container: any) => {
    if (vnode == null) {
      if (container._vnode) unmount(container._vnode);
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };

  const unmount = (vnode: VNode) => {
    hostRemove(vnode.el);
  };

  const patch = (oldNode: VNode, newNode: VNode, container: HTMLElement, anchor: HTMLElement | Text = null) => {
    if (oldNode === newNode) return;

    if (oldNode && !isSameVnode(oldNode, newNode)) {
      unmount(oldNode);
      oldNode = null;
    }

    // type可為標籤名或Text代表僅渲染純文字，shapeFlag以二進位存儲虛擬dom特徵
    // （例如children是陣列的HTML元素：10001，參考 shared/index.ts -> ShapeFlags）
    const { type, shapeFlag } = newNode;

    switch (type) {
      case Text:
        processText(oldNode, newNode, container);
        break;
      case Fragment:
        processFragment(oldNode, newNode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) processElement(oldNode, newNode, container, anchor);
    }
  };

  const processText = (oldNode: VNode, newNode: VNode, container: HTMLElement) => {
    if (oldNode === null) {
      newNode.el = hostCreateText(<string>newNode.children);
      hostInsert(newNode.el, container);
    } else {
      const el = newNode.el = oldNode.el;
      if (oldNode.children !== newNode.children) hostSetText(el, <string>newNode.children);
    }
  };

  const processFragment = (oldNode: VNode, newNode: VNode, container: HTMLElement) => {
    if (oldNode === null) mountChildren(<(VNode | string)[]>newNode.children, container);
    else patchChildren(oldNode, newNode, container);
  };

  const processElement = (oldNode: VNode, newNode: VNode, container: HTMLElement, anchor: HTMLElement | Text) => {
    if (oldNode === null) mountElement(newNode, container, anchor);
    else patchElement(oldNode, newNode);
  };

  const mountChildren = (children: (VNode | string)[], container: HTMLElement) => {
    for (let i = 0; i < children.length; i++) {
      children[i] = normalize(children[i]);
      patch(null, <VNode>children[i], container);
    }
  };

  // 將可能是字串的子節點加工為虛擬DOM
  const normalize = (child: VNode | string) => {
    if (typeof child === 'string') return createVNode(Text, null, <string>child);
    return <VNode>child;
  };

  const mountElement = (vnode: VNode, container: HTMLElement, anchor: HTMLElement | Text) => {
    const { type, props, children, shapeFlag } = vnode;
    const el = vnode.el = hostCreateElement(<string>type);
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) hostSetElementText(el, <string>children);
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(<VNode[]>children, el);
    }

    hostInsert(el, container, anchor);
  };

  const patchElement = (oldNode: VNode, newNode: VNode) => {
    const el = newNode.el = oldNode.el;
    const oldProps = oldNode.props || {};
    const newProps = newNode.props || {};

    patchProps(oldProps, newProps, <HTMLElement>el);

    patchChildren(oldNode, newNode, <HTMLElement>el);
  };

  const patchProps = (oldProps: any, newProps: any, el: HTMLElement) => {
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }
    for (let key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };

  const patchChildren = (oldNode: VNode, newNode: VNode, el: HTMLElement) => {
    const oldChildren = oldNode.children;
    const newChildren = newNode.children;
    const oldShapeFlag = oldNode.shapeFlag;
    const newShapeFlag = newNode.shapeFlag;

    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 舊子節點為陣列；新子節點為文字 -> 刪除舊子節點
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) unmountChildren(<Array<VNode>>oldChildren);
      // 舊子節點為文字或空；新子節點為文字
      if (oldChildren !== newChildren) hostSetElementText(el, <string>newChildren);
    } else {
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff
          patchKeyedChildren(<Array<VNode>>oldChildren, <Array<VNode>>newChildren, el);
        } else {
          // 舊子節點為陣列，新子節點為空
          unmountChildren(<Array<VNode>>oldChildren);
        }
      } else {
        // 舊子節點為文本或空，新節點為陣列或空
        if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) hostSetElementText(el, '');
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) mountChildren(<Array<VNode>>newChildren, el);
      }
    }
  };

  const unmountChildren = (children: Array<VNode>) => {
    children.forEach(child => {
      unmount(child);
    });
  };

  return { render };
};