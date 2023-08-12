import { ReactiveEffect, trackEffects, triggerEffect } from "./effect";
import { reactive } from './reactive';

const toReactive = (value: any) => {
  return value && typeof value === 'object' ?
    reactive(value) :
    value;
};

export const isRef = (value: any) => {
  return !!(value && value.__v_isRef);
};

export class RefImpl {
  public dep: Set<ReactiveEffect> = new Set;
  public _value;
  public readonly __v_isRef = true;
  constructor(public rawValue: any) {
    this._value = toReactive(rawValue);
  }
  get value() {
    trackEffects(this.dep);
    return this._value;
  }
  set value(newValue: any) {
    if (newValue !== this.rawValue) {
      this._value = toReactive(newValue);
      this.rawValue = newValue;
      triggerEffect(this.dep);
    }
  }
}

export const ref = (value: any) => {
  return new RefImpl(value);
};

export const toRaw = (ref: RefImpl) => {
  return ref?.rawValue ?? ref;
};

class ObjectRefImpl {
  constructor(public object: any, public key: any) { }
  get value() {
    return this.object[this.key];
  }
  set value(newValue) {
    this.object[this.key] = newValue;
  }
}
export const toRef = (object: any, key: any) => {
  return new ObjectRefImpl(object, key);
};
export const toRefs = (object: any) => {
  const result: any = Array.isArray(object) ? [] : {};
  for (let key in object) {
    result[key] = toRef(object, key);
  }
  return result;
};