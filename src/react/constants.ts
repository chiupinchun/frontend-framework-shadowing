// config
export const RIC_TIMEOUT = 500;

// VDom

export const ELEMENT_TEXT = Symbol.for('ELEMENT_TEXT');
// root fiber
export const TAG_ROOT = Symbol.for('TAG_ROOT');
// 原生節點，例如div、span等等，與組件節點做區分
export const TAG_HOST = Symbol.for('TAG_HOST');
// 文本節點，和ELEMENT_TEXT好像不一樣
export const TAG_TEXT = Symbol.for('TAG_TEXT');