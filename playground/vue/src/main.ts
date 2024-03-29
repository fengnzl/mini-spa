import { App, createApp, ComponentPublicInstance } from "vue";
import AppCom from "./App.vue";
import { routes } from "./router";
import store from "./store";
import { createRouter, createWebHistory, Router } from "vue-router";

declare const window: any
let app: App<Element> | null
let router: Router | null
let instance: ComponentPublicInstance | null
function render(options: any) {
  const { container } = options || {}
  app = createApp(AppCom);
  router = createRouter({
    history: createWebHistory(window.__IS_SINGLE_SPA__ ? "/vue" : "/"),
    routes,
  });
  app.use(store).use(router)
  instance = app.mount(container ? container.querySelector('#app') :  '#app')
}

export async function bootstrap() {
  console.log("[vue] vue app bootstrapped");
}

export async function mount(options: any) {
  console.log("[vue] options from main framework", options);
  render(options);
}

export async function unmount() {
  app?.unmount()
  instance!.$el.innerHTML = "";
  app = null;
  router = null;
}

if (window.__IS_SINGLE_SPA__) {
  window.__SINGLE_SPA__ = {
    bootstrap,
    mount,
    unmount,
  }
  window.addEventListener("click", () => {
    console.log("window click: vue");
  });

  window.onclick = () => {
    console.log("window onclick: vue");
  };

  document.addEventListener("click", () => {
    console.log("document click: vue");
  });

  document.onclick = () => {
    console.log("document onclick: vue");
  };

  setTimeout(() => {
    console.log("setTimeout");
  }, 3000);
} else {
  render({});
}