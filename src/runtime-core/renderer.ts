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

  const patchKeyedChildren = (oldChildren: VNode[], newChildren: VNode[], el: HTMLElement) => {
    let pointer = 0;
    let oldEnd = oldChildren.length - 1;
    let newEnd = newChildren.length - 1;
    // 從開頭找相同子節點
    while (pointer <= oldEnd && pointer <= newEnd) {
      const oldNode = oldChildren[pointer];
      const newNode = newChildren[pointer];
      if (isSameVnode(oldNode, newNode)) patch(oldNode, newNode, el);
      else break;
      pointer++;
    }
    // 從結尾找相同子節點
    while (pointer <= oldEnd && pointer <= newEnd) {
      const oldNode = oldChildren[oldEnd];
      const newNode = newChildren[newEnd];
      if (isSameVnode(oldNode, newNode)) patch(oldNode, newNode, el);
      else break;
      oldEnd--;
      newEnd--;
    }

    if (pointer > oldEnd) {
      // 新子有剩舊子沒剩，則創建剩餘新子
      while (pointer <= newEnd) {
        const nextPosition = newEnd + 1;
        const anchor = nextPosition < newChildren.length ? newChildren[nextPosition].el : null;
        patch(null, newChildren[pointer], el, anchor);
        pointer++;
      }
    } else if (pointer > newEnd) {
      // 新子沒剩舊子有剩，則刪除剩餘舊子
      while (pointer <= oldEnd) {
        unmount(oldChildren[pointer]);
        pointer++;
      }
    } else {
      // 亂序比對
      let oldStart = pointer;
      let newStart = pointer;
      // Map{newKey:index}
      const keyToNewIndexMap: Map<string | number | symbol, number> = new Map();
      for (let i = newStart; i <= newEnd; i++) keyToNewIndexMap.set(newChildren[i].key, i);

      const toBePatched = newEnd - newStart + 1;
      // 宣告一個將新子項映射至舊子項（若舊子中無則映射為0）的陣列，用於後續排序
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

      // 遍歷舊子，多的刪，缺的新增
      for (let i = oldStart; i <= oldEnd; i++) {
        const oldChild = oldChildren[i];
        const newIndex = keyToNewIndexMap.get(oldChild.key);
        if (newIndex === undefined) unmount(oldChild);
        else {
          newIndexToOldIndexMap[newIndex - newStart] = i + 1;
          patch(oldChild, newChildren[newIndex], el);
        }
      }
    }
  };

  return { render };
};