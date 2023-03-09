import { createApp } from 'vue'
import App from './App.vue'
import { registerApplication, start } from 'mini-spa'
import { pathPrefix, $ } from './utils/utils';


createApp(App).mount('#app')

registerApplication({
  name: "vue",
  pageEntry: "http://localhost:5054",
  activeRule: pathPrefix("/vue"),
  container: $("#sub-viewport"),
});

start()