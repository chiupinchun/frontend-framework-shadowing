import { computed, reactive, ref } from "./reactive"

export default {
  template: `
    <ul style="color:hotpink;background-color:pink">
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


    return {
      data,
      name
    }
  }
}