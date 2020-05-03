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
              :selected="ts === curTextsize ? true: false"
            >{{ ts }}</option>
          </select>
        </li>
        <li>
          <button type="button" @click="practiceHdlr" :disabled="practiceDisabled">Practice</button>
        </li>
        <li>
          <button type="button" @click="clearTextareaHdlr" :disabled="clearDisabled">Clear</button>
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
      <p id="ref-line">{{textExampleLine}}</p>
      <input id="practice-line" size="80" :value="practiceLineText"
       @input="characterHdlr" @keydown="enterHdlr"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GraphemeSplitter from 'grapheme-splitter';

@Component
export default class TypingPractice extends Vue {
  // ----------- Private-use member variables
  private readonly splitter = new GraphemeSplitter();

  private lineComplete = false;

  private maxGraphemesPerLine = 80; // number of graphemes to show per line in example line

  private graphemes: string[] = []; // graphemes in the current example line

  private nextGraphemeIdx = 0; // Index of the grapheme in the reftext to start the next example

  // Vue related data (member vars), computed properties (get and set)
  // Reference textarea prompt text.
  private readonly PLACEHOLDER_TEXT = 'Paste in practice text';

  // Reference text that the user paste in to then copy as a typing
  // exercise.
  private reftext = '';

  // Text size options for reference text textarea
  private textsizes = [7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40];

  private curTextsize = '14';

  // The actual practice typing pane data.
  // Whether the pane is visible or not.  Initially not.
  private typingPaneVisibility = 'hidden';

  private textExampleLine = '';

  private practiceLineText = '';

  get textareaStyle() {
    return `font-size: ${this.curTextsize}px`;
  }

  get typingPaneStyle() {
    if (this.reftext === '') {
      return 'visibility: hidden';
    }
    return `visibility: ${this.typingPaneVisibility}`;
  }

  get practiceDisabled() {
    return this.reftext === '';
  }

  get clearDisabled() {
    return this.reftext === '';
  }

  // FIXME this may not be required.
  // eslint-disable-next-line class-methods-use-this
  pasteHdlr(event: ClipboardEvent): void {
    if (event && event.clipboardData) {
      // console.log(event.clipboardData.getData('text'));
      // event.preventDefault();
      // enable the Practice and Clear buttons
    }
  }

  clearTextareaHdlr(): void {
    this.reftext = '';
    // enable the Practice and Clear buttons
    this.typingPaneVisibility = 'hidden';
  }

  practiceHdlr(): void {
    console.log(this.reftext);
    const pTA = document.getElementById('referenceTA') as HTMLTextAreaElement;
    if (pTA) {
      console.log(`height=${pTA.clientHeight} width=${pTA.clientWidth}`);
    }
    // Make the typing pane visible and populate it
    this.togglePaneVisibility();
    // Get the line size from the pane
    this.maxGraphemesPerLine = this.getMaxGraphemesPerLine();
    // Get up to maxGraphemesPerLine graphemes from the string
    //  break at line breaks, or white space before maxGraphemesPerLine
    //  record the location as current point in this.reftext
    //  display text above the typing practice box
    //  when the user gets to the end of the line go to next line
    //    for the moment this may require that the user hit return at each line end
    this.nextGraphemeIdx = 0;
    this.graphemes = this.splitter.splitGraphemes(this.reftext);
    const { textToDisplay, nextGrapheme } = this.getTextToDisplay(
      this.graphemes, this.maxGraphemesPerLine, this.nextGraphemeIdx,
    );
    this.nextGraphemeIdx = nextGrapheme;
    this.textExampleLine = textToDisplay;
    this.lineComplete = false;

    // Get the practice box, clear it and set focus
    this.practiceLineText = '';
    const pBox = document.getElementById('practice-line') as HTMLInputElement;
    setTimeout(() => {
      (pBox).focus();
    }, 30);
  }

  characterHdlr(event: InputEvent) {
    const character = event.data;
    if (character === '\n' || character === '\r') {
      console.log('Got return');
      this.lineComplete = true;
    } else {
      console.log(event.data);
    }
  }

  enterHdlr(event: KeyboardEvent) {
    if (event && event.keyCode === 13) {
      if (this.nextGraphemeIdx === this.graphemes.length) {
        window.alert('We are done');
      }
      const { textToDisplay, nextGrapheme } = this.getTextToDisplay(
        this.graphemes, this.maxGraphemesPerLine, this.nextGraphemeIdx,
      );
      this.nextGraphemeIdx = nextGrapheme;
      this.textExampleLine = textToDisplay;
      this.practiceLineText = '';
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getMaxGraphemesPerLine(): number {
    console.log(`chars=${this.reftext.length}`
                + `, graphemes=${this.splitter.countGraphemes(this.reftext)}`);
    // FIXME fixed 80 chars. Later base it on estimating how it looks in the
    //  reference textarea
    return 80;
  }

  // eslint-disable-next-line class-methods-use-this
  private getTextToDisplay(graphemes: string[],
    maxGraphemesPerLine: number,
    nextGrapheme: number):
     { textToDisplay: string; nextGrapheme: number } {
    let nxt = nextGrapheme;
    let candText: string[];
    if (nxt + maxGraphemesPerLine > graphemes.length) {
      candText = graphemes.slice(nxt);
      nxt = graphemes.length;
    } else {
      const endOfSnippet = nxt + maxGraphemesPerLine;
      candText = graphemes.slice(nxt, nxt + maxGraphemesPerLine);
      // If the end of candText is just before whitespace or return then ok.
      // If not then trim back to nearest earlier whitespace or return
      if (!this.isWhitespaceOrReturn(graphemes[endOfSnippet])) {
        let i;
        for (i = candText.length; i > 0; i -= 1) {
          if (this.isWhitespaceOrReturn(candText[i])) {
            break;
          }
        }
        candText = candText.slice(0, i);
      }
      nxt += candText.length;
    }
    return { textToDisplay: candText.join('').trim(), nextGrapheme: nxt };
  }

  // eslint-disable-next-line class-methods-use-this
  private isWhitespaceOrReturn(grapheme: string): boolean {
    if (grapheme === ' ' || grapheme === '\r' || grapheme === '\n') {
      return true;
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  private togglePaneVisibility(): void {
    this.typingPaneVisibility = this.typingPaneVisibility === 'hidden' ? 'visible' : 'hidden';
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
div#controls {
  margin-bottom: 5px;
}
div#controls > ul > li > span {
  margin: 0 5px;
}
div#typing-pane {
  background-color: #c5e2d5;
  z-index: 1000;
  visibility: hidden;
  height: 150px;
  width: 100%;
  top: 50%;
  left: 50%;
  font-size: 150%;
  position: absolute;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
div#typing-pane input {
  font-size: 150%;
}
</style>
