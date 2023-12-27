import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const style = {
  border: '1px solid pink',
  margin: '5px'
};
const element = (
  <div id="A1" style={style}>A1
    <div id="B1" style={style}>B1
      <div id="C1" style={style}>C1</div>
      <div id="C2" style={style}>C2</div>
    </div>
    <div id="B2" style={style}>B2</div>
  </div>
);
console.log(element);

root.render(element);
