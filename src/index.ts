import { ref } from "./reactive"

export default {
  template: `
    <div style="color:hotpink;background-color:pink">
      <h1>{{msg}}</h1>
    </div>
  `,
  setup() {
    const msg = ref('nmsl')
    setTimeout(() => {
      msg.value = 'wcnm'
    }, 1000)


    return {
      msg
    }
  }
}