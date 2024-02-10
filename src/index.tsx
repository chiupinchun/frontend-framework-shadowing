import { render } from './react/ReactDom';
import { createElement } from './react/ReactElement';

const root: HTMLElement = document.getElementById('root')!

const mockBabelParse = (props: Record<string, any>) => {
  return {
    $$typeof: Symbol(),
    ...props,
    __hato_version: true as const,
    key: null,
    ref: null
  }
}

/*
<div id="A1" style={style}>A1
  <div id="B1" style={style}>B1
    <div id="C1" style={style}>C1</div>
    <div id="C2" style={style}>C2</div>
  </div>
  <div id="B2" style={style}>B2</div>
</div>
*/
root && render(createElement(
  'div',
  mockBabelParse({
    style: { color: 'pink' },
    id: 'A1'
  }),
  'A1',
  createElement(
    'div',
    mockBabelParse({
      style: { color: 'pink', paddingLeft: '1rem' },
      id: 'B1'
    }),
    'B1',
    createElement(
      'div',
      mockBabelParse({
        style: { color: 'pink', paddingLeft: '2rem' },
        id: 'C1'
      }),
      'C1',
      createElement(
        'div',
        mockBabelParse({
          style: { color: 'pink', paddingLeft: '3rem' },
          id: 'D1'
        }),
        'D1'
      )
    ),
    createElement(
      'div',
      mockBabelParse({
        style: { color: 'pink', paddingLeft: '2rem' },
        id: 'C2'
      }),
      'C2'
    )
  ),
  createElement(
    'div',
    mockBabelParse({
      style: { color: 'pink', paddingLeft: '1rem' },
      id: 'B2'
    }),
    'B2'
  )
), root)
