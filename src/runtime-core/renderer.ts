import { RenderOptions } from "../runtime-dom";
import { Text, VNode } from "./vnode";

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

  const unmount = (vnode: VNode) => {
    hostRemove(vnode.el);
  };

  const render = (vnode: VNode, container: any) => {
    if (vnode == null) {
      if (container._vnode) unmount(container._vnode);
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };

  return { render };
};