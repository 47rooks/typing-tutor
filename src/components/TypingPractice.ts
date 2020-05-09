import { Component, Vue } from 'vue-property-decorator';

/*
 * BUGS
 * ----
 * resetting text size after pasting increases referenceTA width and height, rather than
 *     rebreaking.
 * if there are two blanks at the break point the first word of the next line ends up on
 *     this line. This is the opposite issue where the last word of the current line is added
 *     to the next one, which is caused by the stepping back from the breakpoint before checking.
 */
@Component
export default class TypingPractice extends Vue {
  // ----------- Private-use member variables
  private lineComplete = false;

  // Array containing lines of text that are each as long as their corresponding line
  // in the input textarea when they are wrapped. This is used to step the user through
  // the lines of the test text, in a way that looks exacctly like that text.
  private referenceTextLines: string[] = [];

  // Next referenceTextLines entry to display to user
  private referenceTextNextLine = 0;

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
    return `resize: horizontal; font-size: ${this.curTextsize}px`;
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

  clearHdlr(): void {
    this.reftext = '';
    // enable the Practice and Clear buttons
    this.togglePaneVisibility();
    const ta = document.getElementById('referenceTA') as HTMLTextAreaElement;
    console.log(`empty scrollwidth=${ta.scrollWidth}`);
    // Reset the practice text variables
    this.practiceLineText = '';
    this.referenceTextLines = [];
    this.referenceTextNextLine = 0;
    this.lineComplete = false;
  }

  practiceHdlr(): void {
    console.log('practiceHdlr called');
    // Make the typing pane visible and populate it
    this.togglePaneVisibility();
    // Create the array of lines to practice through
    this.referenceTextLines = this.applyLineBreaks('referenceTA');

    // Get the practice box, clear it and set focus
    this.textExampleLine = this.referenceTextLines[this.referenceTextNextLine];
    this.referenceTextNextLine += 1;
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
    }
  }

  enterHdlr(event: KeyboardEvent) {
    if (event && event.keyCode === 13) {
      if (this.referenceTextNextLine >= this.referenceTextLines.length) {
        this.textExampleLine = 'You are done';
        return;
      }
      this.textExampleLine = this.referenceTextLines[this.referenceTextNextLine];
      this.referenceTextNextLine += 1;
      this.practiceLineText = '';
    }
  }

  /**
   * Create a list of lines broken as the textarea breaks them.
   * This is done by cloning the text area and using the clone as a way to test
   * each line break. This technique is an adaptation of the code found at:
   * https://stackoverflow.com/questions/4719777/finding-line-breaks-in-textarea-that-is-word-wrapping-arabic-text
   * Much thanx to the contributors.
   * Apart from using a separate area and not replacing the original which I need to keep
   * this version:
   *    is adjusted to handle, and retrain, blank lines in the input text,
   *    is converted to Typescript
   *    fixes the bug where the original would move the last word of a line to the next
   *        line if the breaking character was whitespace
   */
  /* eslint-disable-next-line class-methods-use-this */
  private applyLineBreaks(strTextAreaId: string): string[] {
    // Clone the textarea so that we can use the clone to size the lines
    const oTextarea = document.getElementById(
      strTextAreaId,
    ) as HTMLTextAreaElement;
    oTextarea.setAttribute('wrap', 'off');

    // Get the textarea raw string and scrollwidth,
    // zero out the textarea so we can use it to size the lines
    const strRawValue = oTextarea.value;
    oTextarea.value = '';
    const nEmptyWidth = oTextarea.scrollWidth;
    console.log(`nEmptyWidth=${nEmptyWidth}`);

    /**
     * Check if the string is rendered wider than the width of the textarea.
     * @param oTextarea test area to render the string in
     * @param nEmptyWidth the width of the test textarea empty, that is, where the break should be
     * @param strTest string to test
     * @returns true if it does render wider, false if not.
     */
    function testBreak(strTest: string): boolean {
      /* eslint-disable no-param-reassign */
      oTextarea.value = strTest;
      return oTextarea.scrollWidth > nEmptyWidth;
    }

    /**
     * Find the next break. This uses recursion to break the string up. Hopefully the
     * stack doesn't blow with large strings. If necessary we'll unroll it.
     * @param strSource string to place breaks in
     * @param oTextarea textarea to test rendering in
     * @param nEmptyWidth the width of the test textarea empty, that is, where the break should be
     * @param nLeft the current left hand end of the approximation of the line break location
     * @param nRight the current right hand end of the approximation of the line break location
     */
    function findNextBreakLength(strSource: string,
      nLeft?: number, nRight?: number): number | null {
      let nCurrent: number;
      if (typeof (nLeft) === 'undefined' || typeof (nRight) === 'undefined') {
        // Set initial estimates on first call.
        nLeft = 0;
        nRight = -1;
        nCurrent = 64;
      } else if (nRight === -1) {
        nCurrent = nLeft * 2;
      } else if (nRight - nLeft <= 1) {
        // Termination condition, nRight holds the break location if > 2, else break at 2.
        return Math.max(2, nRight);
      } else {
        nCurrent = nLeft + (nRight - nLeft) / 2;
      }

      const strTest = strSource.substr(0, nCurrent);
      // console.log(`strTest=${strTest}`);
      const bLonger = testBreak(strTest);
      // console.log(`bLonger=${bLonger} nCurrent=${nCurrent}`);
      if (bLonger) {
        nRight = nCurrent;
      } else {
        if (nCurrent >= strSource.length) {
          return null;
        }
        nLeft = nCurrent;
      }
      return findNextBreakLength(strSource, nLeft, nRight);
    }

    // Return arrays of strings - each string is broken at or before the width of the
    // input textarea, on word boundaries (whitespace delimited sequences of non-whitespace chars),
    // with n:1 grapheme composition accounted for.
    const rv: string[] = [];

    const strRawArray = strRawValue.split('\n');
    strRawArray.forEach((strRaw) => {
      console.log(`strRaw=${strRaw}`);
      let i = 0;
      let j: number;
      if (strRaw.length === 0) {
        rv.push('<BLANK LINE>');
      } else {
        while (i < strRaw.length) {
          const breakOffset = findNextBreakLength(strRaw.substr(i));
          if (breakOffset === null) {
            // Terminate iteration - we are at the end of the input text.
            console.log('returning the remainder');
            rv.push(strRaw.substr(i));
            break;
          }

          // Now backoff from the break point to the nearest preceding whitespace
          let nLineLength = breakOffset;
          for (j = nLineLength - 1; j >= 0; j -= 1) {
            const curChar = strRaw.charAt(i + j);
            if (curChar === ' ' || curChar === '-' || curChar === '+') {
              nLineLength = j + 1;
              break;
            }
          }
          console.log(`line=${strRaw.substr(i, nLineLength)}`);
          rv.push(strRaw.substr(i, nLineLength));
          i += nLineLength;
          console.log(`i=${i} nLinelength=${nLineLength}`);
        }
      }
    });
    oTextarea.setAttribute('wrap', 'on');
    oTextarea.value = '';
    return rv;
  }

  private togglePaneVisibility(): void {
    this.typingPaneVisibility = this.typingPaneVisibility === 'hidden' ? 'visible' : 'hidden';
  }
}
