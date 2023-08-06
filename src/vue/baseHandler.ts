import { reactive } from './reactive';
import { track, trigger } from './effect';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export default {
  get: (
    target: Record<string, any>,
    key: string,
    receiver: any
  ): any => {
    if (key === ReactiveFlags.IS_REACTIVE) return true;

    track(target, key);

    const res = Reflect.get(target, key, receiver);
    if (res && typeof res === 'object') return reactive(res);

    return res;
  },
  set: (target: Record<string, any>, key: string, value: any) => {
    target[key] = value;
    trigger(target, key);
    return true;
  }
};