<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <button @click="onClick">Click me</button>
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts" setup name="Home">
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
const onClick = () => {
  console.log((window as any).appName)
}
</script>
