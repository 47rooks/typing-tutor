<template>
  <div class="typing-practice">
    <div id="controls">
      <ul>
        <li>
          <font-picker @selected="fontHandler"
          :fonts="FONT_LIST"></font-picker>
        </li>
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
        <li>
          <button
            id="practice-button"
            type="button"
            @click="practiceHdlr"
            :disabled="practiceDisabled"
          >
            Practice
          </button>
        </li>
        <li>
          <button type="button" @click="clearHdlr" :disabled="clearDisabled">Clear</button>
        </li>
      </ul>
    </div>
    <div id="reference-pane" v-bind:style="referencePaneStyle">
      <textarea
        id="referenceTA"
        :rows="refTextareaRows"
        :cols="refTextareaCols"
        v-model="reftext"
        :style="textareaStyle"
        :placeholder="PLACEHOLDER_TEXT"
      ></textarea>
    </div>
    <div id="typing-pane" v-bind:style="typingPaneStyle">
      <div id="typing-pane-color-layer">
        <div id="typed-text-pane">
          <p id="typed-text" :style="typedTextStyle"><span v-html="typedPracticeText"></span></p>
        </div>
        <p id="ref-line"><span v-html="textExampleLine"></span></p>
        <input
          id="practice-line"
          size="80"
          :value="practiceLineText"
          @input="characterHdlr"
          @keydown="enterHdlr"
        />
        <div id="yet-to-be-typed-text-pane">
          <p id="yet-to-be-typed-text" :style="typedTextStyle">
            <span v-html="yetToBeTypedPracticeText"></span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./TypingPractice.ts"></script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped src="./TypingPractice.css"></style>
