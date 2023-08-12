import './assets/css/style.less';
import { ref, reactive, watch } from './vue';
import effect from './vue/effect';

const msg = ref('nmsl');

effect(() => {
  document.body.innerHTML = `
    <div>
      ${msg.value}
    </div>
  `;
});

watch(msg, (nv: string, ov: string) => {
  console.log(nv, ov);
});

setInterval(() => {
  msg.value = 'wcnm';
}, 3000);
