import './assets/css/style.less';
import { ref, reactive } from './vue';
import effect from './vue/effect';

const msg = ref('nmsl');

effect(() => {
  document.body.innerHTML = `
    <div>
      ${msg.value}
    </div>
  `;
});

setInterval(() => {
  msg.value = 'wcnm';
}, 3000);
