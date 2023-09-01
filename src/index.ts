import './assets/css/style.less';
import { ref, reactive, watch, computed } from './vue';
import createApp from './create-app';

document.body.innerHTML = '<div id="app"></div>';

createApp({
  template: `
    <div class="owo">{{ face }}</div>
  `,
  setup() {
    const face = ref(`(*'ω'*)`);

    setTimeout(() => {
      face.value = `(*´Д｀)`;
    }, 3000);
    return { face };
  }
});