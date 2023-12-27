import { VDom } from "./ReactElement";
import { RIC_TIMEOUT, TAG_ROOT } from "./constants";

interface FiberNode {
  tag: Symbol;
  props: Record<string, any> & {
    children: (VDom | string)[];
  };
}

let nextUnitOfWork: FiberNode | null = null;
let workInProgressRoot: FiberNode | null = null;
export const scheduleRoot = (rootFiber: FiberNode) => {
  nextUnitOfWork = workInProgressRoot = rootFiber;
};

const workLoop: IdleRequestCallback = (deadline) => {
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

const performUnitOfWork = (fiber: FiberNode) => {
  beginWork(fiber);
  return null;
};

/**
 * 創建真實DOM
 * @param fiber 真實DOM來源的fiber
 */
const beginWork = (currentFiber: FiberNode) => {
  if (currentFiber.tag === TAG_ROOT) {
    updateHostRoot(currentFiber);
  }
};

const updateHostRoot = (currentFiber: FiberNode) => {
  const newChildren = currentFiber.props.children;
};

requestIdleCallback(workLoop, { timeout: RIC_TIMEOUT });