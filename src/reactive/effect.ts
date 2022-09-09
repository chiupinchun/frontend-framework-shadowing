

/*
1.將渲染頁面所需參數與渲染頁面方法綁定
effect(()=>{
  渲染view中的obj.key1 // 將obj.key1綁定ReactiveEffect實例對象 e1
  effect(()=>{
    渲染component中的obj.key2 // 將obj.key2綁定e2，其中e2.parent = e1
  })
  渲染view中的obj.key3 // 將obj.key3綁定e3
})
2.將渲染函數與ReactiveEffect實例對象綁定
  effect方法會將參數的回調函數加工成可存放父組件渲染函數於parent屬性的ReactiveEffect實例對象，並執行該回調函數
3.讓所有變數與有使用到該變數的組件們的渲染函數完成綁定
  WeakMap = {target:Map{key:Set{activeEffect}
*/
// activeEffect代表當前正在運行的渲染函數
export let activeEffect: ReactiveEffect = undefined
// 清除渲染函數及變數的雙向綁定
function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  // 由於deps是引用地址，可以從ReactiveEffect實例對象刪除WeakMap實例對象中數據對渲染函數的綁定
  deps.forEach(dep => {
    dep.delete(effect)
  })
  // 再刪除ReactiveEffect實例對象中對該渲染函數經手的數據的綁定
  effect.deps.length = 0
}
export class ReactiveEffect {
  public parent: ReactiveEffect = null
  public deps: Array<Set<ReactiveEffect>> = []
  public active = true
  constructor(public fn: Function, public schedule: Function) { }
  run() {
    if (!this.active) return this.fn()

    try {
      // 讓父節點儲存爸爸組件的渲染函數
      this.parent = activeEffect
      // 當前正在渲染子組件
      activeEffect = this
      // 先清空上一次渲染函數雙向綁定的變數
      cleanupEffect(this)
      return this.fn()
    } finally {
      // 子組件渲染完畢，繼續渲染剩下的父組件
      activeEffect = this.parent
    }
  }
  stop() {
    this.active = false
    cleanupEffect(this)
  }
}

export function effect<T = any>(fn: () => T, options?: any) {
  const _effect = new ReactiveEffect(fn, options.schedule)
  _effect.run()

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  // console.log(runner.effect.stop) // undefined
  return runner
}

const targetMap: WeakMap<object, Map<any, Set<ReactiveEffect>>> = new WeakMap()
export function track(target: object, type: 'get', key: any) {
  // activeEffect代表正在作用的effect函數（數據驅動視圖），不存在activeEffect代表當前代碼並不更新視圖，故無需綁定數據直接return
  if (!activeEffect) return
  /*
  目標：對應數據綁定渲染函數，渲染函數也綁定對應數據
    數據綁函數：targetMap = WeakMap{target:Map{key:Set{activeEffect}},...}格式
    函數綁數據：activeEffect.deps = [obj.key1,obj.key2...]
  流程：
    1.先檢查當前target是否已綁定於WeakMap實例對象，若否綁定
    2.再檢查當前key是否已綁定於WeakMap實例對象中，若否綁定
    3.檢查activeEffect（當前正在執行的渲染函數）是否已綁定於Set實例對象中，若否綁定
  備註：
    1.WeakMap實例對象為限定將物件作為key綁定數據的特殊格式物件
    2.Map實例對象為可將物件作為key綁定數據的特殊格式物件
    3.Set實例對象為去除重複的數組 // ex: new Set([1,1,2]) -> [1,2]
  */
  // 流程1. target:Map
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  // 流程2. key:Set
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Set()))
  // 流程3. dep: Set{activeEffect}
  trackEffects(dep)
}
// 用於做出 dep: Set{activeEffect}
export function trackEffects(dep: Set<ReactiveEffect>) {
  if (activeEffect && !dep.has(activeEffect)) {
    // 在被傳入的Set地址中添加當前執行的渲染函數
    dep.add(activeEffect)
    // 也在當前執行的渲染函數的ReactiveEffect實例對象紀錄其綁定的屬性
    activeEffect.deps.push(dep)
  }
}

export function trigger(target: any, type: 'set', key: any, value: any, oldValue: any) {
  // 檢查變更的對象是否綁定渲染函數（意即是否需要更新頁面）
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  // 若該對象已綁定渲染函數，則檢查變更的屬性是否綁定渲染函數（須深拷貝，避免下方forEach超自然死迴圈）
  let effects = depsMap.get(key)
  if (effects) {
    triggerEffect(effects)
  }
}
// 依序執行數據綁定的所有渲染函數
export function triggerEffect(effects: Set<ReactiveEffect>) {
  effects = new Set(effects)
  effects.forEach(effect => {
    if (effect !== activeEffect) {
      // 若effect()的參數options有schedule屬性，則執行自定義的schedule()
      if (effect.schedule) effect.schedule()
      // 否則照舊綁定關聯數據並渲染頁面
      else effect.run()
    }
  })
}