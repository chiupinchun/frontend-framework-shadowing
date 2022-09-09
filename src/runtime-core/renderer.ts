// ./index.ts
// export function render(vnode,container) {
//   createRenderer(renderOptions).render(vnode,container)
// }
import { RenderOptions } from "../runtime-dom"
import { isString, ShapeFlags } from "../shared"
import { getLongestSubsequence } from "./sequence"
import { createVNode, isSameVnode, Text, VNode } from "./vnode"

export function createRenderer(renderOptions: RenderOptions) {
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
  } = renderOptions

  // ☆將虛擬DOM渲染至container裡面
  const render = (vnode: VNode, container: any) => {
    if (vnode == null) {
      if (container._vnode) unmount(container._vnode)
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }

  const unmount = (vnode: VNode) => {
    hostRemove(vnode.el)
  }

  // ☆比對新舊節點
  const patch = (oldNode: VNode, newNode: VNode, container: HTMLElement, anchor: HTMLElement | Text = null) => {
    if (oldNode === newNode) return

    if (oldNode && !isSameVnode(oldNode, newNode)) {
      unmount(oldNode)
      oldNode = null
    }

    // type可為標籤名或Text代表僅渲染純文字，shapeFlag以二進位存儲虛擬dom特徵
    // （例如children是陣列的HTML元素：10001，參考 shared/index.ts -> ShapeFlags）
    const { type, shapeFlag } = newNode

    switch (type) {
      case Text:
        processText(oldNode, newNode, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) processElement(oldNode, newNode, container, anchor)
    }
  }

  // 處理文字節點
  const processText = (oldNode: VNode, newNode: VNode, container: HTMLElement) => {
    if (oldNode === null) {
      newNode.el = hostCreateText(<string>newNode.children)
      hostInsert(newNode.el, container)
    } else {
      const el = newNode.el = oldNode.el
      if (oldNode.children !== newNode.children) hostSetText(el, <string>newNode.children)
    }
  }

  const processElement = (oldNode: VNode, newNode: VNode, container: HTMLElement, anchor: HTMLElement | Text) => {
    if (oldNode === null) mountElement(newNode, container, anchor)
    else patchElement(oldNode, newNode)
  }

  const patchElement = (oldNode: VNode, newNode: VNode) => {
    const el = newNode.el = oldNode.el
    const oldProps = oldNode.props || {}
    const newProps = newNode.props || {}

    patchProps(oldProps, newProps, <HTMLElement>el)

    patchChildren(oldNode, newNode, <HTMLElement>el)
  }

  const patchProps = (oldProps: any, newProps: any, el: HTMLElement) => {
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }
    for (let key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  const patchChildren = (oldNode: VNode, newNode: VNode, el: HTMLElement) => {
    const oldChildren = oldNode.children
    const newChildren = newNode.children
    const oldShapeFlag = oldNode.shapeFlag
    const newShapeFlag = newNode.shapeFlag

    // 新舊子節點皆有可能是陣列、文本或空，依序檢查以上6種排列組合
    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 舊子節點為陣列；新子節點為文字 -> 刪除舊子節點
      // 這裡的陣列類型新舊子節點都類型斷言為<Array<VNode>>，但其實好像也有可能是<Array<VNode|string>>
      // 之後如果報錯優先確認這個函數的所有類型斷言
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) unmountChildren(<Array<VNode>>oldChildren)
      // 舊子節點為文字或空；新子節點為文字
      if (oldChildren !== newChildren) hostSetElementText(el, <string>newChildren)
    } else {
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff
          patchKeyedChildren(<Array<VNode>>oldChildren, <Array<VNode>>newChildren, el)
        } else {
          // 舊子節點為陣列，新子節點為空
          unmountChildren(<Array<VNode>>oldChildren)
        }
      } else {
        // 舊子節點為文本或空，新節點為陣列或空
        if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) hostSetElementText(el, '')
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) mountChildren(<Array<VNode>>newChildren, el)
      }
    }
  }

  // diff
  const patchKeyedChildren = (oldChildren: Array<VNode>, newChildren: Array<VNode>, el: HTMLElement) => {
    let pointer = 0
    let oldEnd = oldChildren.length - 1
    let newEnd = newChildren.length - 1
    // 從開頭找相同子節點
    while (pointer <= oldEnd && pointer <= newEnd) {
      const oldNode = oldChildren[pointer]
      const newNode = newChildren[pointer]
      if (isSameVnode(oldNode, newNode)) patch(oldNode, newNode, el)
      else break
      pointer++
    }
    // 從結尾找相同子節點
    while (pointer <= oldEnd && pointer <= newEnd) {
      const oldNode = oldChildren[oldEnd]
      const newNode = newChildren[newEnd]
      if (isSameVnode(oldNode, newNode)) patch(oldNode, newNode, el)
      else break
      oldEnd--
      newEnd--
    }

    if (pointer > oldEnd) {
      // 老子比對完，循環創建新子
      while (pointer <= newEnd) {
        const nextPosition = newEnd + 1
        const anchor = nextPosition < newChildren.length ? newChildren[nextPosition].el : null
        patch(null, newChildren[pointer], el, anchor)
        pointer++
      }
    } else if (pointer > newEnd) {
      while (pointer <= oldEnd) {
        unmount(oldChildren[pointer])
        pointer++
      }
    } else {

      // 亂序比對
      let oldStart = pointer
      let newStart = pointer
      // 將新子節點作為Map的key方便查找
      // Map{newKey:index}
      const keyToNewIndexMap: Map<string, number> = new Map()
      for (let i = newStart; i <= newEnd; i++) keyToNewIndexMap.set(newChildren[i].key, i)

      const toBePatched = newEnd - newStart + 1
      // 宣告一個將新子項映射至老子項（若老子中無則映射為0）的陣列，用於後續排序
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0)

      // 遍歷老子，多的刪，缺的新增
      for (let i = oldStart; i <= oldEnd; i++) {
        const oldChild = oldChildren[i]
        const newIndex = keyToNewIndexMap.get(oldChild.key)
        if (newIndex === undefined) unmount(oldChild)
        else {
          newIndexToOldIndexMap[newIndex - newStart] = i + 1
          patch(oldChild, newChildren[newIndex], el)
        }
      }

      // 子節點排序
      const increment = getLongestSubsequence(newIndexToOldIndexMap)
      let j = increment.length - 1
      for (let i = toBePatched - 1; i >= 0; i--) {
        const index = newStart + i
        const current = newChildren[index]
        const anchor = index + 1 < newChildren.length ? newChildren[index + 1].el : null
        // 新子不存在於老子則創建新節點
        if (newIndexToOldIndexMap[i] === 0) patch(null, current, el, anchor)
        // 新子既存則移動
        else {
          if (newIndexToOldIndexMap[i] !== increment[j]) hostInsert(current.el, el, anchor)
          else j--
        }
      }
    }

  }

  const unmountChildren = (children: Array<VNode>) => {
    children.forEach(child => {
      unmount(child)
    })
  }

  // ☆將虛擬DOM轉換為真實DOM，並插入container
  const mountElement = (vnode: VNode, container: HTMLElement, anchor: HTMLElement | Text) => {
    const { type, props, children, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(<string>type)
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) hostSetElementText(el, <string>children)
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(<Array<VNode>>children, el)
    }

    hostInsert(el, container, anchor)
  }

  const mountChildren = (children: Array<VNode | string>, container: HTMLElement) => {
    for (let i = 0; i < children.length; i++) {
      children[i] = normalize(children[i])
      patch(null, <VNode>children[i], container)
    }
  }

  // 將可能是字串的子節點加工為虛擬DOM
  const normalize = (child: VNode | string) => {
    if (isString(child)) return createVNode(Text, null, <string>child)
    return <VNode>child
  }




  return { render }
}