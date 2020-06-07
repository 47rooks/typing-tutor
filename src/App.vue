<template>
  <div id="app">
    <header>
    <span>Typing Practice Tool</span>
    <a href="http://47rooks.com">
      <img id="logo" src="./images/MemZayin64PaleGreen.png">
    </a>
    </header>
    <TypingPractice msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TypingPractice from '@/components/TypingPractice.vue';

@Component({
  name: 'App',
  components: {
    TypingPractice,
  },
})
export default class App extends Vue {}
</script>

<style>
#app,
textarea,
input {
  font-family: Accordance, Cardo, 'Times New Roman', Helvetica, Arial, sans-serif;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  /* color: #043d00;  Standard 47rooks green*/
}
img#logo {
  float: right;
}
div#app > header {
  /* width:100%;*/
  height:80px;
  width: 80%;
  margin: auto;
  background:#fff;    /* #d1e0e1; */
  color:#043d00;                /*   #333;*/
  font-weight: normal;
  font-size: 30px;
  text-align:center;
  line-height: 80px;
  vertical-align: baseline;
}
</style>
