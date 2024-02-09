import { VDom } from "./ReactElement";
import { EFFECTS, ELEMENT_TEXT, PLACEMENT, RIC_TIMEOUT, TAGS, TAG_HOST, TAG_ROOT, TAG_TEXT } from "./constants";
import { setProps } from "./utils";

interface FiberNode<Tag = Symbol> {
  tag: Tag;
  props: Record<string, any> & {
    children?: Tag extends typeof TAG_HOST ? VDom[] : (VDom | string)[];
  };
  type?: string | typeof ELEMENT_TEXT
  stateNode?: HTMLElement | Text | null // 一開始還沒創建DOM元素
  child: FiberNode | null
  sibling: FiberNode | null
  return: FiberNode | null
  effectTag?: EFFECTS

  nextEffect?: FiberNode | null // 之後會有個單鏈表 effect list 放這兒，代表有effect的兒子fiber們
  firstEffect?: FiberNode | null
  lastEffect?: FiberNode | null
}

let nextUnitOfWork: FiberNode | null = null;
let workInProgressRoot: FiberNode | null = null;
export const scheduleRoot = (rootFiber: FiberNode) => {
  nextUnitOfWork = workInProgressRoot = rootFiber;
};

const workLoop = (deadline: IdleDeadline) => {
  let shouldYeild = false;
  while (nextUnitOfWork && !shouldYeild) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYeild = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork) {
    console.log('render階段結束');
  }
  requestIdleCallback(workLoop, { timeout: RIC_TIMEOUT });
};

/**
 * begin: 從fiber樹頂，由上至下，由左至右。
 * 
 * (ex: parent -> child -> sibling -> parent -> sibling -> child -> sibling ...)
 * 
 * complete: 從fiber樹最左子葉，由左至右，由下至上。
 * 
 * (ex: child -> sibling's child -> sibling -> return -> sibling -> return ...)
 */
const performUnitOfWork = (currentFiber: FiberNode) => {
  beginWork(currentFiber);
  if (currentFiber.child) { return currentFiber.child }

  while (currentFiber) {
    completeUnitOfWork(currentFiber)
    if (currentFiber.sibling) {
      return currentFiber.sibling
    }
    if (currentFiber.return) { currentFiber = currentFiber.return }
  }
  return null;
};

/**
 * 把cihld、sibling、return串接好，並創建真實DOM掛載到stateNode
 */
const beginWork = (currentFiber: FiberNode) => {
  if (currentFiber.tag === TAG_ROOT) {
    updateHostRoot(currentFiber);
  } else if (currentFiber.tag === TAG_TEXT) {
    updateHostText(currentFiber)
  } else if (currentFiber.tag === TAG_HOST) {
    updateHost(currentFiber as FiberNode<typeof TAG_HOST>)
  }
};

/**
 * nextEffect: 將fibers以nextEffect屬性串成鏈表，之後依 子 -> 父 順序進行effect。
 * 
 * (順序同completeUnitOfWork。)
 * 
 * firstEffect：指向這個fiber節點的最左子葉。
 * 
 * lastEffect: 記錄這個fiber節點在以nextEffect屬性串成的鏈表的末項。
 */
const completeUnitOfWork = (currentFiber: FiberNode) => {
  const returnFiber = currentFiber.return
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect
    }

    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect
      } else {
        returnFiber.lastEffect = currentFiber.lastEffect
      }
    }

    const effectTag = currentFiber.effectTag
    if (effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber
      } else {
        returnFiber.firstEffect = currentFiber
      }
      returnFiber.lastEffect = currentFiber
    }
  }
}

const updateHostRoot = (currentFiber: FiberNode) => {
  const newChildren = currentFiber.props.children as VDom[];
  // root node處理孩子就好，因為它們可以直接裝進#root，不需要特別做一個爸爸元素來裝
  reconcileChildren(currentFiber, newChildren)
};

const updateHostText = (currentFiber: FiberNode) => {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
}

const updateHost = (currentFiber: FiberNode<typeof TAG_HOST>) => {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }

  const newChildren = currentFiber.props.children
  reconcileChildren(currentFiber, newChildren!)
}

const createDOM = (currentFiber: FiberNode) => {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text as string)
  } else if (currentFiber.tag === TAG_HOST) {
    const stateNode = document.createElement(currentFiber.type as string)
    updateDOM(stateNode, {}, currentFiber.props)
    return stateNode
  }
  return null
}

const updateDOM = (
  stateNode: HTMLElement,
  oldProps: Record<string, any>,
  newProps: Record<string, any>
) => {
  setProps(stateNode, oldProps, newProps)
}

/**
 * 把FiberNode.props.children中的大兒子、其他兒子們和自己的fiber，
 * 依child、sibling、return屬性串成鏈表
 */
const reconcileChildren = (
  currentFiber: FiberNode,
  newChildren: VDom[]
) => {
  let newChildIndex = 0
  let prevSibling: FiberNode
  while (newChildIndex < newChildren.length) {
    const newChild = newChildren[newChildIndex]
    let tag: TAGS = TAG_HOST
    if (newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT
    } else if (typeof newChild.type === 'string') {
      tag = TAG_HOST
    }

    // vdom -> fiber
    const newFiber: FiberNode = {
      tag,
      type: newChild.type,
      props: newChild.props,
      stateNode: null, // 一開始還沒創建DOM元素
      return: currentFiber,
      child: null,
      sibling: null,
      effectTag: PLACEMENT,
      nextEffect: null // 之後會有個單鏈表 effect list 放這兒
    }
    if (newFiber) {
      if (newChildIndex === 0) {
        currentFiber.child = newFiber
      } else {
        prevSibling!.sibling = newFiber
      }
      prevSibling = newFiber
    }

    newChildIndex++
  }
}

requestIdleCallback(workLoop, { timeout: RIC_TIMEOUT });
