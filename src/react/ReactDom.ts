import { VDom } from "./ReactElement";
import { TAG_ROOT } from "./constants";
import { scheduleRoot } from "./schedule";

export const render = (element: VDom, container: HTMLElement) => {
  const rootFiber = {
    tag: TAG_ROOT,
    stateNode: container,
    props: { children: [element] },
    child: null,
    sibling: null,
    return: null
  };
  scheduleRoot(rootFiber);
};

const ReactDom = {
  render
};

export default ReactDom;