import { ELEMENT_TEXT } from "./constants";

interface VDomConfigWithoutProps {
  key: string | null;
  ref: null;
}

export interface VDom extends VDomConfigWithoutProps {
  $$typeof: Symbol;
  props: Record<string, any>;
  type: string | typeof ELEMENT_TEXT;

  __hato_version: true;
}

export const createElement = (
  type: string,
  config: VDom['props'] & VDomConfigWithoutProps,
  ...children: (VDom | string)[]
): VDom => {
  delete config._self;
  delete config._source;
  const { key, ref, ...others } = config;
  return {
    type, key, ref,
    props: {
      ...others,
      children: children.map(child => typeof child === 'object' ? child : createTextNode(child))
    },
    $$typeof: Symbol.for(''),
    __hato_version: true
  };
};

const createTextNode = (text: string): VDom => {
  return {
    $$typeof: ELEMENT_TEXT,
    type: ELEMENT_TEXT,
    props: { text, children: [] },
    key: null,
    ref: null,
    __hato_version: true
  };
};
