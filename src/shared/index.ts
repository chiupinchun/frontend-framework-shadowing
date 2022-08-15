export function isObject(value:any) {
  // return value instanceof Object
  return typeof value === 'object' && value !== null
}

export function isString(value:any) {
  return typeof value === 'string'
}

export function isNumber(value:any) {
  return typeof value === 'number'
}

export function isFunction(value:any) {
  return typeof value === 'function'
}

export const isArray = Array.isArray
export const assign = Object.assign