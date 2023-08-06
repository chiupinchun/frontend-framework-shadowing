import './assets/css/style.less';
import { reactive } from './vue';
import effect from './vue/effect';

const person = reactive({
  name: '自尤雨溪望',
  msg: '我想準時下班'
});

effect(() => {
  document.body.innerHTML = `
    <div>
      <h5>${person.name}</h5>
      <p>${person.msg}</p>
    </div>
  `;
});

setInterval(() => {
  person.msg += '！';
}, 3000);
