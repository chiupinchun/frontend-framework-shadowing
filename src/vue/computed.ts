import { ReactiveEffect, trackEffects, triggerEffect } from './effect';

class ComputedRefImpl<Value = unknown> {
  public effect;
  public __v_isReadonly = true;
  public __v_isRef = true;
  public _value: Value;
  public dep: Set<ReactiveEffect> = new Set;
  public _dirty = true;
  constructor(getter: () => Value, public setter?: (value: any) => void) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerEffect(this.dep);
      }
    });
  }
  get value() {
    trackEffects(this.dep);
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(newValue: Value) {
    this.setter(newValue);
  }
}

interface getterAndSetter {
  get: () => any;
  set: (value: any) => void;
}
export const computed = (getterOrOptions: getterAndSetter | (() => any)) => {
  let getter;
  let setter;

  if (typeof getterOrOptions === 'function') getter = getterOrOptions;
  else {
    getter = (getterOrOptions as getterAndSetter).get;
    setter = (getterOrOptions as getterAndSetter).set;
  }
  return new ComputedRefImpl(getter, setter);
};