import './css/index.less'
// import { reactive } from './reactive/reactive'
// import { effect } from './reactive/effect'
import {reactive,effect,computed,watch,ref} from './reactive/'

const person = reactive({ name: 'cyw', age: 100000 })
const nmsl = computed(()=>{
  return `${person.name}安安`
})

const msg = ref('nmsl')
setTimeout(()=>{msg.value = '蓋歐卡使用噴水'},1000)

/*
0. 每個effect()內傳入一組件的渲染函數
1. 透過effect()將傳入的渲染函數加工成「可記錄父組件渲染函數的ReactiveEffect實例對象」
2. 執行渲染函數
3. 渲染時觸發所有Proxy對象代理變數的get方法，調用track()將變數與包含該變數的渲染函數綁定
（變數綁定渲染函數：WeakMap{obj:Map{key:Set{effect1,e2...}}}；
  渲染函數綁定變數：new ReactiveEffect().deps）
*/
const runner = effect(() => {
  const app = document.querySelector('#app')
  app.innerHTML = ''
  app.innerHTML += `<div>${nmsl.value}</div>`
  app.innerHTML += `<div>${msg.value}</div>`
},{
  // schedule() {
  //   console.log('schedule effected.')
  // }
})

setTimeout(() => {
  person.name='bd'
}, 1000)

watch(person,(newValue:any,oldValue:any)=>{
  console.log(newValue,oldValue)
})