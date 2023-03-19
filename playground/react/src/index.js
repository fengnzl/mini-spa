import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

function render(options = {}) {
  const { container } = options;
  console.log(container.querySelector("#root"));
  ReactDOM.render(<App />, container ? container.querySelector('#root'): document.querySelector('#root'));
}

export async function bootstrap() {
  console.log('[react16] react app bootstrapped');
}

export async function mount(options) {
  console.log('[react16] options from main framework', options);
  render(options);
}

export async function unmount(options) {
  const { container } = options;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
}

if (window.__IS_SINGLE_SPA__) {
  window.__SINGLE_SPA__ = {
    bootstrap,
    mount,
    unmount
  }
  window.addEventListener("click", () => {
    console.log("window click: react");
  });

  window.onclick = () => {
    console.log("window onclick: react");
  };

  document.addEventListener("click", () => {
    console.log("document click: react");
  });

  document.onclick = () => {
    console.log("document onclick: react");
  };

  setTimeout(() => {
    console.log("setTimeout react");
  }, 1000);
} else {
  render()
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
