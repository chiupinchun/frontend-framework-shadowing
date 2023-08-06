import baseHandler, { ReactiveFlags } from './baseHandler';

const reactiveMap = new WeakMap();

export const reactive = (target: Record<string, any>) => {
  if (target && typeof target === 'object') {
    if (target[ReactiveFlags.IS_REACTIVE]) return target;

    const existingProxy = reactiveMap.get(target);
    if (existingProxy) return existingProxy;

    const proxy = new Proxy(target, baseHandler);
    reactiveMap.set(target, proxy);
    return proxy;
  }
};