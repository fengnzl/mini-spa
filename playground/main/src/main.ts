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
});

registerApplication({
  name: "react",
  pageEntry: "http://localhost:5054",
  activeRule: pathPrefix("/react"),
  container: $("#subapp-viewport"),
});

start()