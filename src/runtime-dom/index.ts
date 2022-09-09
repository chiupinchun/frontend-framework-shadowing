import { createRenderer } from "../runtime-core"
import { VNode } from "../runtime-core/vnode"
import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProp"

// 封裝了一些dom元素的操作方法
const renderOptions = Object.assign(nodeOps, { patchProp })
export type RenderOptions = typeof renderOptions

// 主邏輯為render()
export function render(vnode: VNode, container: VNode | HTMLElement) {
  createRenderer(renderOptions).render(vnode, container)
}