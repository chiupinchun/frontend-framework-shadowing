let activeEffect: ReactiveEffect | undefined;
export class ReactiveEffect {
  parent?: ReactiveEffect;
  constructor(public fn: Function, public schedule?: Function) { }

  run() {
    try {
      this.parent = activeEffect;
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
}

export default <T = any>(fn: () => T) => {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
};

type Dep = Set<ReactiveEffect>;
type DepsMap = Map<string | symbol, Dep>;
type TargetMap = WeakMap<object, DepsMap>;
// type TargetMap = WeakMap<
//   object,
//   Map<
//     string | symbol, Set<ReactiveEffect>
//   >
// >
const targetMap: TargetMap = new WeakMap();
export const trackEffects = (dep: Dep) => {
  if (activeEffect && !dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
};
export const track = (target: object, key: string | symbol) => {
  if (!activeEffect) return;

  let depsMap: DepsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, depsMap = new Map());

  let dep: Dep = depsMap.get(key);
  if (!dep) depsMap.set(key, dep = new Set());

  trackEffects(dep);
};

export const triggerEffect = (effects: Dep) => {
  effects.forEach(effect => {
    if (effect !== activeEffect) {
      if (effect.schedule) effect.schedule();
      else effect.run();
    }
  });
};
export const trigger = (target: object, key: string | symbol) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  if (effects) {
    triggerEffect(effects);
  }
};