import './css/index.less'
// import { reactive } from './reactive/reactive'
// import { effect } from './reactive/effect'
import { reactive, effect, computed, watch, ref } from './reactive/'
import { h, Text } from './runtime-core'
import { render } from './runtime-dom'



const app: HTMLElement = document.querySelector('#app')

render(h('ul', { onClick: testFn }, [
  h('li', { key: 'd' }, 'd'),
  h('li', { key: 'a', style: { color: 'red' } }, 'a'),
  h('li', { key: 'b' }, 'b'),
  h('li', { key: 'c' }, 'c')
]), app)
function testFn() {
  render(h('ul', {}, [
    h('li', { key: 'c' }, 'c'),
    h('li', { key: 'a' }, 'a'),
    h('li', { key: 'b' }, 'b')
  ]), app)
}
// -----------------------------------

const person = reactive({ name: 'cyw', age: 100000 })
const nmsl = computed(() => {
  return `${person.name}安安`
})

const msg = ref('nmsl')
setTimeout(() => { msg.value = '蓋歐卡使用噴水' }, 1000)

/*
0. 每個effect()內傳入一組件的渲染函數
1. 透過effect()將傳入的渲染函數加工成「可記錄父組件渲染函數的ReactiveEffect實例對象」
2. 執行渲染函數
3. 渲染時觸發所有Proxy對象代理變數的get方法，調用track()將變數與包含該變數的渲染函數綁定
（變數綁定渲染函數：WeakMap{obj:Map{key:Set{effect1,e2...}}}；
  渲染函數綁定變數：new ReactiveEffect().deps）
*/
const runner = effect(() => {
  let test = document.querySelector('#app .test')
  if (!test) {
    test = document.createElement('div')
    test.className = 'test'
    app.append(test)
  }
  test.innerHTML = ''
  test.innerHTML += `<div>${nmsl.value}</div>`
  test.innerHTML += `<div>${msg.value}</div>`
}, {
  // schedule() {
  //   console.log('schedule effected.')
  // }
})

setTimeout(() => {
  person.name = 'bd'
}, 1000)

watch(person, (newValue: any, oldValue: any) => {
  console.log(newValue, oldValue)
})