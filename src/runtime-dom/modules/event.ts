interface Invoker extends EventListener {
  value?: Function;
}
function createInvoker(callback: Function) {
  const invoker: Invoker = (e: Event) => invoker.value?.(e);
  invoker.value = callback;
  return invoker;
}

export const patchEvent = (el: any, vEvent: string, nextValue: Function | string) => {
  if (typeof nextValue === 'string') nextValue = eval(nextValue);

  const invokers = el._vei || (el._vei = {});

  const event = vEvent.slice(1);
  const existingInvoker = invokers[event];

  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else if (nextValue) {
    el.addEventListener(event, invokers[event] = createInvoker(<Function>nextValue));
  } else if (existingInvoker) {
    el.removeEventListener(event, existingInvoker);
    existingInvoker.value = undefined;
  }
};