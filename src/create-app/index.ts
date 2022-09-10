import { parse } from "../ast/parse";
import { Fragment, h, VNode } from "../runtime-core";
import { render } from "../runtime-dom";
import { isArray } from "../shared";


export function createApp(template: string, container: HTMLElement) {
  let parsedTemplate = parse(template)
  if (parsedTemplate.length > 1) {
    parsedTemplate = { tag: Fragment, children: parsedTemplate }
  } else parsedTemplate = parsedTemplate[0]

  render(doH(parsedTemplate), container)
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