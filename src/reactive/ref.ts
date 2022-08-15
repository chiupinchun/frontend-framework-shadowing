import { isArray, isObject } from "../shared"
import { ReactiveEffect, trackEffects, triggerEffect } from "./effect"
import { reactive } from "./reactive"

function toReactive(value:unknown) {
  return isObject(value)?reactive(value):value
}

class RefImpl {
  public dep:Set<ReactiveEffect> = new Set
  public _value
  public __v_isRef = true
  constructor(public rawValue:unknown) {
    this._value = toReactive(rawValue)
  }
  get value() {
    trackEffects(this.dep)
    return this._value
  }
  set value(newValue:unknown) {
    if(newValue !== this.rawValue) {
      this._value = toReactive(newValue)
      this.rawValue = newValue
      triggerEffect(this.dep)
    }
  }
}

export function ref(value:unknown) {
  return new RefImpl(value)
}

class ObjectRefImpl {
  constructor(public object:any,public key:any) {}
  get value() {
    return this.object[this.key]
  }
  set value(newValue) {
    this.object[this.key] = newValue
  }
}
export function toRef(object:any,key:any) {
  return new ObjectRefImpl(object,key)
}

export function toRefs(object:any) {
  const result:any = isArray(object)?[]:{}
  for(let key in object) {
    result[key] = toRef(object,key)
  }
  return result
}

export function proxyRefs(object:any) {
  return new Proxy(object,{
    get:(target,value,receiver)=>{
      let r = Reflect.get(target,value,receiver)
      return r.__v_isRef?r.value:r
    },
    set:(target,key,value,receiver)=>{
      if(target[key].__v_isRef) {
        target[key].value = value
        return true
      }
      else return Reflect.set(target,key,value,receiver)
    }
  })
}