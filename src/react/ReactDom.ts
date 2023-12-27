import { VDom } from "./ReactElement";
import { TAG_ROOT } from "./constants";
import { scheduleRoot } from "./schedule";

export const render = (element: VDom, container: HTMLElement) => {
  const rootFiber = {
    tag: TAG_ROOT,
    stateNode: container,
    props: { children: [element] }
  };
  scheduleRoot(rootFiber);
};

const ReactDom = {
  render
};

export default ReactDom;