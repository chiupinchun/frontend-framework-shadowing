import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { RefImpl, isRef } from './ref';

const traversal = (value: Record<string, any>) => {
  if (!value || typeof value !== 'object') return value;
  for (const key in value) {
    traversal(value[key]);
  }
  return value;
};

export const watch = (source: unknown, cb: Function) => {
  let getter;
  if (isReactive(source)) getter = () => traversal(source);
  else if (isRef(source)) getter = () => (<RefImpl>source).value;
  else if (typeof source === 'function') getter = source;
  else return;

  let oldValue: unknown;
  const job = () => {
    const newValue = effect.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  };

  const effect = new ReactiveEffect(getter, job);
  oldValue = effect.run();
};