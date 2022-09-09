export function isObject(value: any) {
  // return value instanceof Object
  return typeof value === 'object' && value !== null
}

export function isString(value: any) {
  return typeof value === 'string'
}

export function isNumber(value: any) {
  return typeof value === 'number'
}

export function isFunction(value: any) {
  return typeof value === 'function'
}

export const isArray = Array.isArray
export const assign = Object.assign

export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEEP_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}