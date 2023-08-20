import { RenderOptions } from "../runtime-dom";
import { Text, Fragment, VNode, ShapeFlags, isSameVnode } from "./vnode";

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

  return { render };
};