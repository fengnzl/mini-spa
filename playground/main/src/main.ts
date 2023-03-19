import { createApp } from "vue";
import App from "./App.vue";
import { registerApplication, start } from 'mini-spa'
import { pathPrefix, $ } from "./utils";

createApp(App).mount("#app");


registerApplication({
  name: "vue",
  pageEntry: "http://localhost:5055",
  activeRule: pathPrefix("/vue"),
  container: $("#subapp-viewport"),
  sandboxConfig: {
    enabled: true,
    css: true
  },
  /**
   * app 生命周期钩子，加载页面资源前触发，只会触发一次
   */
  beforeBootstrap: () => console.log("vue beforeBootstrap"),
  /**
   * app 生命周期钩子，页面入口的资源被加载并执行后触发，只会触发一次
   */
  bootstrapped: () => console.log("vue bootstrapped"),
  /**
   * app 生命周期钩子，挂载前触发
   */
  beforeMount: () => console.log("vue beforeMount"),
  /**
   * app 生命周期钩子，挂载后触发
   */
  mounted: () => console.log("vue mounted"),
  /**
   * app 生命周期钩子，卸载前触发
   */
  beforeUnmount: () => console.log("vue beforeUnmount"),
  /**
   * app 生命周期钩子，卸载后触发
   */
  unMounted: () => console.log("vue unmounted"),
});

registerApplication({
  name: "react",
  pageEntry: "http://localhost:5054",
  activeRule: pathPrefix("/react"),
  container: $("#subapp-viewport"),
  sandboxConfig: {
    enabled: true,
    css: true
  }
});

start()