import './assets/css/style.less';
import { ref, reactive, watch, computed } from './vue';
import effect from './vue/effect';

const msg = ref('nmsl');
const angryMsg = computed({
  get: () => msg.value + '!!',
  set: (value) => {
    msg.value = value.replace(/\!\!$/, '');
  }
});

effect(() => {
  document.body.innerHTML = `
    <div>
      ${msg.value}
    </div>
    <div>
      ${angryMsg.value}
    </div>
  `;
});

setInterval(() => {
  angryMsg.value = 'wcnm!!';
}, 3000);
