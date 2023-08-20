import { createRenderer } from "../runtime-core";
import { VNode } from "../runtime-core/vnode";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const renderOptions = Object.assign(nodeOps, { patchProp });
export type RenderOptions = typeof renderOptions;

export function render(vnode: VNode, container: VNode | HTMLElement) {
  createRenderer(renderOptions).render(vnode, container);
}