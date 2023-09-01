import effect from '../vue/effect';
import { render } from '../runtime-dom';
import { h } from '../runtime-core/h';
import { parse } from '../ast/parse';
import { VNode, Text } from '../runtime-core';

const doH = (target: ReturnType<typeof parse>[0]): string | VNode => {
  return typeof target === 'string' ? h(Text, target) : h(target.tag, target.attrs, target.children.map(child => doH(child)));
};

interface Component {
  template: string;
  setup: () => any;
}
export default (component: Component) => {
  const app: HTMLElement = document.querySelector('#app')!;

  const variables = component.setup();

  effect(() => {
    for (const key in variables) (globalThis as any)[key] = variables[key];

    const parsedTemplate = {
      tag: 'div',
      props: {
        id: 'app'
      },
      children: parse(component.template)
    };

    const vnode = doH(parsedTemplate) as VNode;
    render(vnode, app);

    for (const value of variables) delete (globalThis as any)[value];
  });
};