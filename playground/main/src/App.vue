<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
const handlePush = (subApp: string) => window.history.pushState(null, subApp, subApp)
</script>

<template>
  <div class="main-container">
    <h1 class="title">single-spa</h1>
    <ul class="side-menu">
      <li @click="handlePush('/vue')">Vue</li>
      <li @click="handlePush('/React')">React</li>
    </ul>
    <main class="sub-container" >
      <div id="sub-viewport"></div>
    </main>
  </div>
</template>

<style>
.title {
  font-size: 30x;
  font-weight: bold;
}

.side-menu {
  width: 130px;
  list-style: none;
  margin: 0;
  margin-left: 40px;
  padding: 0;
  border-right: 2px solid #aaa;
}

.side-menu li {
  color: #aaa;
  margin: 20px 0;
  font-size: 18px;
  font-weight: 400;
  cursor: pointer;
}

.side-menu li:hover {
  color: #444;
}

.side-menu li:first-child {
  margin-top: 5px;
}
.sub-container {
  flex-grow: 1;
  position: relative;
  margin: 0 40px;
}
</style>
