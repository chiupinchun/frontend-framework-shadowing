import './assets/css/style.less';

interface Lyrics {
  value: string;
}
const lyrics = new Proxy({
  value: '再多一眼看一眼就會爆炸'
}, {
  get: (target: Lyrics, key: keyof Lyrics) => target[key],
  set: (target: Lyrics, key: keyof Lyrics, value: string) => {
    target[key] = value;
    render();
    return true;
  }
});

const render = () => {
  document.body.innerHTML = `
    <h1>${lyrics.value}</h1>
  `;
};
render();

setTimeout(() => lyrics.value = '再近一點靠近點快被融化', 7000);