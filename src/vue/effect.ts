let activeEffect: ReactiveEffect | undefined;
class ReactiveEffect {
  parent?: ReactiveEffect;
  constructor(public fn: Function) { }

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