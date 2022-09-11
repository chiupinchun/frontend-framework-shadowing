import { computed, reactive, ref } from "./reactive"

export default {
  template: `
    <h1 @click="test">Vue HatoVer.</h1>
    <ul :class="name" style="color:hotpink;background-color:pink">
      <li>name: {{name}}</li>
      <li>msg: {{data.msg}}</li>
    </ul>
  `,
  setup() {
    const data = reactive({ msg: 'nmsl' })
    const firstName = ref('c')
    const lastName = ref('yw')
    const name = computed(() => firstName.value + lastName.value)
    setTimeout(() => {
      data.msg = 'wcnm'
    }, 1000)
    function test() {
      alert(123)
    }

    return {
      data,
      name,
      test
    }
  }
}