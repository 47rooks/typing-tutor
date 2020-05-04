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

  private renderPracticeButton = true;

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

  get resetDisabled() {
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

  clearHdlr(): void {
    this.reftext = '';
    // enable the Practice and Clear buttons
    this.renderPracticeButton = true;
    this.togglePaneVisibility();
  }

  resetHdlr(): void {
    console.log('resetHdlr called');
    this.togglePaneVisibility();
    this.practiceHdlr();
  }

  practiceHdlr(): void {
    console.log('practiceHdlr called');
    this.renderPracticeButton = false;
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
      this.graphemes,
      this.maxGraphemesPerLine,
      this.nextGraphemeIdx,
    );
    this.nextGraphemeIdx = nextGrapheme;
    this.textExampleLine = textToDisplay;
    this.lineComplete = false;

    // Get the practice box, clear it and set focus
    this.practiceLineText = '';
    const pBox = document.getElementById('practice-line') as HTMLInputElement;
    setTimeout(() => {
      pBox.focus();
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
        this.textExampleLine = 'You are done';
        return;
      }
      const { textToDisplay, nextGrapheme } = this.getTextToDisplay(
        this.graphemes,
        this.maxGraphemesPerLine,
        this.nextGraphemeIdx,
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
  private getTextToDisplay(
    graphemes: string[],
    maxGraphemesPerLine: number,
    nextGrapheme: number,
  ): { textToDisplay: string; nextGrapheme: number } {
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
    console.log(`before vis=${this.typingPaneVisibility}`);
    this.typingPaneVisibility = this.typingPaneVisibility === 'hidden' ? 'visible' : 'hidden';
    console.log(`after vis=${this.typingPaneVisibility}`);
  }
}
