import { isFunction } from "../shared"
import {ReactiveEffect, trackEffects, triggerEffect} from './effect'

/*
1. 宣告computed傳入回調函數（此時尚未執行該回調函數）
2. 回調函數賦值ComputedRefImpl.effect，將回調函數中的響應式數據綁定Computed的effect函數；並賦予effect.schedule（若非dirty）執行所有數據綁定的渲染函數
  note:dirty用於緩存computed，若依賴的響應式數據並未改變，重複訪問computed.value也不會重新渲染頁面
3. ｛關鍵｝當computed.value被讀取時，調用trackEffect方法綁定computed及其渲染函數，並進行初次渲染；同時透過this.effect.run()在第一次頁面渲染的同時，將響應式數據綁定當前的activeEffect（即ComputedRefImpl.effect）
4. 當computed回調函數中響應式數據的值改變時，觸發其trigger方法執行其綁定的ComputedRefImpl.effect.schedule()，進而觸發computed所綁定的渲染函數更新頁面
*/

class ComputedRefImpl<Value=unknown> {
  public effect
  public _dirty = true
  public __v_isReadonly = true
  public __v_isRef = true
  public _value:Value
  public dep:Set<ReactiveEffect> = new Set
  constructor(getter:()=>Value,public setter:(newValue:Value)=>void) {
    this.effect = new ReactiveEffect(getter,()=>{
      if(!this._dirty) {
        this._dirty = true
        triggerEffect(this.dep)
      }
    })
  }
  get value() {
    trackEffects(this.dep)
    if(this._dirty) {
      this._dirty = false
      // 被讀取value屬性時初次渲染頁面
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValue:Value) {
    this.setter(newValue)
  }
}

interface getterAndSetter {
  get:()=>any
  set:()=>void
}
export const computed = (getterOrOptions:getterAndSetter | (() => any)) => {
  let getter
  let setter
  // 若computed的參數為函數，則僅需設定getter
  if(isFunction(getterOrOptions)) getter = getterOrOptions as () => any
  // 若computed的參數為{get:function,set:function}，則兩者皆須設定
  else {
    getter = (getterOrOptions as getterAndSetter).get
    setter = (getterOrOptions as getterAndSetter).set
  }
  return new ComputedRefImpl(getter,setter)
}