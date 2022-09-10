import { parse } from "../ast/parse";
import { Fragment, h, VNode } from "../runtime-core";
import { render } from "../runtime-dom";
import { isArray } from "../shared";
import { effect } from "../reactive";

import Vue from '../main'
type Vue = typeof Vue

const app: HTMLElement = document.querySelector('#app')
createApp(Vue, app)



function createApp(Vue: Vue, container: HTMLElement) {
  let parsedTemplate = parse(Vue.template)
  if (parsedTemplate.length > 1) {
    parsedTemplate = { tag: Fragment, children: parsedTemplate }
  } else parsedTemplate = parsedTemplate[0]

  // render(doH(parsedTemplate), container)

  const data = Vue.setup()
  effect(() => {
    render(doH(parsedTemplate), container)
  }, {})
}


interface ParsedTemplate {
  tag: string,
  attrs?: any,
  children: Array<ParsedTemplate> | string
}
function doH(parsedTemplate: ParsedTemplate) {
  let children: unknown = parsedTemplate.children
  if (isArray(children)) {
    children = children.map(child => doH(child))
  }
  return h(parsedTemplate.tag, parsedTemplate.attrs, <Array<VNode>>children)
}