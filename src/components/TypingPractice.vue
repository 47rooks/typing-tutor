<template>
  <div class="typing-practice">
    <div id="controls">
      <ul>
        <li>
          <span>Text size</span>
          <select v-model="curTextsize">
            <option
              v-for="ts in textsizes"
              v-bind:key="ts"
              v-bind:value="ts"
              :selected="ts === curTextsize ? true : false"
              >{{ ts }}</option
            >
          </select>
        </li>
        <li v-if="renderPracticeButton">
          <button
            id="practice-button"
            type="button"
            @click="practiceHdlr"
            :disabled="practiceDisabled"
          >
            Practice
          </button>
        </li>
        <li v-else>
          <button id="reset-button" type="button" @click="resetHdlr" :disabled="resetDisabled">
            Reset
          </button>
        </li>
        <li>
          <button type="button" @click="clearHdlr" :disabled="clearDisabled">Clear</button>
        </li>
      </ul>
    </div>
    <div id="reference-pane">
      <textarea
        id="referenceTA"
        rows="28"
        cols="80"
        v-model="reftext"
        :style="textareaStyle"
        @paste="pasteHdlr"
        :placeholder="PLACEHOLDER_TEXT"
      ></textarea>
    </div>
    <div id="typing-pane" :style="typingPaneStyle">
      <p id="ref-line">{{ textExampleLine }}</p>
      <input
        id="practice-line"
        size="80"
        :value="practiceLineText"
        @input="characterHdlr"
        @keydown="enterHdlr"
      />
    </div>
  </div>
</template>

<script lang="ts" src="./TypingPractice.ts"></script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped src="./TypingPractice.css"></style>
