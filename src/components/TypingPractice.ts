import { Component, Vue } from 'vue-property-decorator';
import GraphemeSplitter from 'grapheme-splitter';
import FontPicker from './FontPicker.vue';
import InputPopup from './InputPopup.vue';
import Library from '../database/Library';
import TypingDb from '../database/TypingDb';

const COLOR_ADDED = 'color:orange';
const COLOR_OMITTED = 'color:blue';
const COLOR_DIFFERENT = 'color:red';

/*
 * Typing practice Vue component
 */
@Component({
  components: {
    'font-picker': FontPicker,
    'input-popup': InputPopup,
  },
})
export default class TypingPractice extends Vue {
  // ----------- Private-use member variables

  // User has finished typing the current practice line, currently indicated by
  // hitting return.
  private lineComplete = false;

  // Array containing lines of text that are each as long as their corresponding line
  // in the input textarea when they are wrapped. This is used to step the user through
  // the lines of the test text, in a way that looks exacctly like that text.
  private referenceTextLines: string[] = [];

  // Next referenceTextLines entry to display to user
  private referenceTextNextLine = 0;

  private referencePaneVisble = true;

  private readonly DEFAULT_REF_TEXTAREA_ROWS = 28;

  private refTextareaRows = this.DEFAULT_REF_TEXTAREA_ROWS;

  private readonly DEFAULT_REF_TEXTAREA_COLS = 80;

  private refTextareaCols = this.DEFAULT_REF_TEXTAREA_COLS;

  // Vue related data (member vars), computed properties (get and set)
  // Reference textarea prompt text.
  private readonly PLACEHOLDER_TEXT = `
  Welcome to the Typing Practice Tool.
  
  Paste your practice text into this window. Then choose the display font you want to use.
  Set the size. Edit out any bits of the text you don't want to practice. Resize the textarea
  to set the basic line length you want.
  
  Hit the Practice button and you will be led through the practice text one line at a time.
  Hit return at the end of each line to progress to the next line.
  
  When you are done hit the Clear button to reset and paste in new text.`;

  // Reference text that the user pasted in to use as a typing exercise.
  private reftext = '';

  // Whether to report the Practice button as disabled or not, true if disabled.
  private disablePracticeButton = false;

  // Text size options for reference text textarea
  private textsizes = [7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40];

  private readonly DEFAULT_TEXT_SIZE = 14;

  private curTextsize = this.DEFAULT_TEXT_SIZE;

  // The actual practice typing pane data.
  // Whether the pane is visible or not.  Initially not.
  private typingPaneVisible = false;

  // The text the user has typed, ideally it matches the practice text.
  private typedPracticeText = '';

  private numTypedPracticeLines = 0;

  // Practice text that the user has not got to yet.
  private yetToBeTypedPracticeText = '';

  // The next line in the to-be-practiced text.
  private nextYetToBeTypedPracticeLine = 0;

  // The current line the user is practicing typing.
  private textExampleLine = '';

  // The <input> element text that the user types. This is the user's practice for
  // the current line. It is not currently compared to the reference or checked for
  // accuracy.
  private practiceLineText = '';

  // Correction marking members
  private showCorrections = true;

  annotatedRefLine = '';

  annotatedTypedLine = '';

  // Restart button support
  disableRestartButton = false;

  notStarted = true;

  // Database for persisting application state
  database: TypingDb;

  // Library support
  libraryDb: Library | undefined;

  libraryTexts: string[] | undefined;

  selectedText = 'none';

  showSaveNameDialog = false;

  validationErrorText = ''; // Report validation error to dialog to reprompt for name

  disableSaveButton = false;

  // Timer support for typing rate
  private wordsTyped = 0;

  private lastTimeStartedTyping = 0;

  private totalTypingTime = 0;

  private currentlyTyping = false;

  // List of fonts to be presented by the font-picker
  FONT_LIST = [
    'Accordance',
    'Cardo',
    'Times New Roman',
    'Helvetica',
    'Arial',
    'sans-serif',
  ];

  PREFERRED_FONT = 'Accordance';

  // The selected font in which to render all text
  private chosenFont = this.PREFERRED_FONT;

  // Database name
  DATABASE_NAME = 'typingdb';

  // Database version
  DATABASE_VERSION = 1;

  constructor() {
    super();
    console.log('Constructor called');
    this.database = new TypingDb(this.DATABASE_NAME, this.DATABASE_VERSION);
    // Launch the library text load
    this.database.getLibrary()
      .then((lib) => {
        this.libraryDb = lib;
        this.loadLibraryTexts();
      });
  }

  /**
   * ---------------------------------------------------
   * Computed properties for the Reference pane - pane 1
   * ---------------------------------------------------
   */

  /**
   * Reference div visibility
   */
  get referencePaneStyle(): object {
    if (this.referencePaneVisble) {
      return {
        display: 'inline',
        visibility: 'visible',
      };
    }
    return {
      display: 'none',
      visibility: 'hidden',
    };
  }

  /**
   * Computed overall style for the textarea, which receives the practice text
   */
  get textareaStyle(): object {
    return {
      resize: 'horizontal',
      'font-family': `${this.chosenFont}`,
      'font-size': `${this.curTextsize}px`,
    };
  }

  /**
   * ---------------------------------------------------
   * Computed properties for the Practice pane - pane 2
   * ---------------------------------------------------
   */

  /**
   * Computed overall style for the typing pane - the app's second page
   */
  get typingPaneStyle(): object {
    if (this.typingPaneVisible) {
      return {
        'background-color': 'red',
        display: 'inline',
        visibility: 'visible',
        'font-family': `${this.chosenFont}`,
      };
    }
    return {
      display: 'none',
      visibility: 'hidden',
    };
  }

  /**
   * Computed style for the reference text before it is typed and the typed text, after
   * it is typed and scrolling up the screen.
   */
  get typedTextStyle(): object {
    return {
      'text-align': 'justify',
      'font-family': `${this.chosenFont}`,
    };
  }

  /**
   * Computed <input> element font style
   */
  get practiceInputStyle(): object {
    return {
      'font-family': `${this.chosenFont}; font-size: ${this.curTextsize}px`,
    };
  }

  /**
   * Computed visibility for corrections pane
   */
  get correctionsPaneStyle(): object {
    if (this.showCorrections && (this.annotatedRefLine !== '' || this.annotatedTypedLine !== '')) {
      return {
        display: 'inline',
        visibility: 'visible',
      };
    }
    return {
      display: 'none',
      visibility: 'hidden',
    };
  }

  /**
   * Computed visibility for the corrections color key
   */
  get correctionsKeyStyle() {
    if (this.showCorrections) {
      return {
        display: 'inline',
        visibility: 'visible',
      };
    }
    return {
      display: 'none',
      visibility: 'hidden',
    };
  }

  /**
   * Computed property for enabling the practice button.
   */
  get practiceButtonDisabled(): boolean {
    return this.reftext === '' || this.disablePracticeButton;
  }

  /**
   * Computed property for disabling the clear button.
   */
  get clearButtonDisabled(): boolean {
    return this.reftext === '';
  }

  get restartButtonDisabled(): boolean {
    return this.reftext === '' || this.notStarted;
  }

  /**
   * Return the typing rate in words per minute
   */
  get typingRate(): string {
    const rate = this.totalTypingTime > 0 ? this.wordsTyped / (this.totalTypingTime / 60000) : 0.0;
    return rate.toFixed(1);
  }

  /**
   * Handle the font selected by the user. The member variable feeds the various
   * computed properties which style their fonts.
   * @param chosenFont the font name the user chose
   */
  fontHandler(chosenFont: string): void {
    this.chosenFont = chosenFont;
  }

  /**
   * Handler function for the Practice button.
   * This function takes the input text and splits it into lines to present to the user
   * switches from the reference text pane to the typing pane, setting button states
   * appropriately.
   */
  practiceHdlr(): void {
    // Make the typing pane visible and populate it
    this.showTypingPane();
    // Create the array of lines to practice through
    this.referenceTextLines = this.applyLineBreaks('reference-ta');
    // Strip out tabs as they cannot be entered easily in a browser while typing
    //   and they result in invisible errors being flagged.
    this.referenceTextLines = this.referenceTextLines.map((s) => TypingPractice.stripTabs(s));
    // Hide the reference-pane
    this.hideReferencePane();
    // Disable practice button
    this.disablePracticeButton = true;
    // Get the practice box, clear it and set focus
    this.textExampleLine = this.referenceTextLines[this.referenceTextNextLine];
    this.referenceTextNextLine += 1;
    this.practiceLineText = '';
    // Set up the yet-to-be-typed-text
    const linesToAdd = this.referenceTextLines.length > 6 ? 6 : this.referenceTextLines.length;
    const textToAdd = this.referenceTextLines.slice(1, linesToAdd);
    textToAdd.forEach((t, idx) => {
      if (idx === 0) {
        this.yetToBeTypedPracticeText = `${t}`;
      } else {
        this.yetToBeTypedPracticeText = `${this.yetToBeTypedPracticeText}<br>${t}`;
      }
    });
    this.nextYetToBeTypedPracticeLine = linesToAdd;

    // Enable the restart button
    this.notStarted = false;

    // disable Save button
    this.disableSaveButton = true;

    // Set focus in the text input box with a delay so it renders before focus is made.
    const pBox = document.getElementById('practice-line') as HTMLInputElement;
    setTimeout(() => {
      pBox.focus();
    }, 30);
  }

  /**
   * Replace tabs in a string with a space and then replace all multiple spaces with just one.
   * @param s string to replace spaces in.
   */
  private static stripTabs(s: string): string {
    let rv = '';
    // first convert tabs to spaces
    rv = s.replace(/\t/g, ' ');
    // convert any multiple spaces to single ones
    rv = rv.replace(/  +/, ' ');
    return rv;
  }

  /**
   * Handler function for the Clear button.
   * This function resets all state and switches back to the reference text paste-in page.
   */
  clearHdlr(): void {
    this.reftext = '';
    // enable the Practice and Clear buttons
    this.disablePracticeButton = false;

    this.hideTypingPane();
    this.showReferencePane();
    // Reset the practice text variables
    this.practiceLineText = '';
    this.referenceTextLines = [];
    this.referenceTextNextLine = 0;
    this.textExampleLine = '';
    this.lineComplete = false;
    this.typedPracticeText = '';
    this.numTypedPracticeLines = 0;
    // Reset default text input box parameters
    this.curTextsize = this.DEFAULT_TEXT_SIZE;
    this.refTextareaCols = this.DEFAULT_REF_TEXTAREA_COLS;
    this.refTextareaRows = this.DEFAULT_REF_TEXTAREA_ROWS;
    // Reset corrections pane
    this.annotatedTypedLine = '';
    this.annotatedRefLine = '';
    // Reset timing
    this.currentlyTyping = false;
    this.lastTimeStartedTyping = 0;
    this.totalTypingTime = 0;
    this.wordsTyped = 0;
    // Clear the restart button
    this.notStarted = true;
    // Reset library selection
    this.selectedText = 'none';
    this.disableSaveButton = false;
  }

  restartHdlr(): void {
    const txt = this.reftext;
    this.clearHdlr();
    this.reftext = txt;
  }

  /**
   * Disable the save button when:
   *   there is no text in the reference text area,
   *   when the text in textarea is an unmodified library item,
   *   when in practice mode
   */
  get saveButtonDisabled(): boolean {
    return this.reftext === '' || this.disablePracticeButton;
  }

  /**
   * Disabled when there is no library, or once a text is in use
   */
  get librarySelectListDisabled(): boolean {
    return this.libraryTexts?.length === 0;
  }

  /*
   * Perform the requested library operation
   */
  private libraryOperation(operation: (db: IDBDatabase) => void) {
    console.log(`FIXME Going to save text in library ${this.saveButtonDisabled}`);
    // indexedDB.deleteDatabase('typingdb');
    const openRequest = indexedDB.open('typingdb', 1);

    openRequest.onupgradeneeded = (event) => {
      // FIXME Handle upgrade case
      console.log('initialization required');
      const db = openRequest.result;
      switch (event.oldVersion) {
        case 0:
          // Create DB for first time
          // Create 'library' object store
          db.createObjectStore('library', { keyPath: 'id' });
          break;
        case 1:
          // At v1 - for now do nothing
          break;
        default:
        // do nothing
      }
    };

    openRequest.onsuccess = () => {
      const db = openRequest.result;

      db.onversionchange = () => {
        db.close();
        alert('Library database is out of date. Please reload the page');
      };

      operation(db);
    };

    openRequest.onerror = (event) => {
      console.log(`open failed with ${event}`);
    };

    openRequest.onblocked = () => {
      // FIXME handle blocked case
    };
  }

  /**
   * Get the list of saved library texts
   */
  // private loadLibraryTexts(): void {
  //   this.libraryOperation((db: IDBDatabase) => {
  //     // Read the list of texts
  //     const txn = db.transaction('library');
  //     const library = txn.objectStore('library');
  //     const getReq = library.getAll();
  //     getReq.onsuccess = () => {
  //       this.libraryTexts = [];
  //       getReq.result.forEach((t) => {
  //         this.libraryTexts.push(t.id);
  //       });
  //       db.close();
  //       console.log(`Current texts=${this.libraryTexts}`);
  //     };

  //     getReq.onerror = () => {
  //       alert(`Failed to read texts from library.
  // Will continue without it. Error = ${getReq.error}`);
  //       db.close();
  //     };
  //   });
  // }
  private loadLibraryTexts(): void {
    if (this.libraryDb) {
      this.libraryDb.loadLibraryTextNames()
        .then((texts) => {
          this.libraryTexts = texts;
        })
        .catch((reason: Error) => {
          console.log(`Could not load texts. Reason=${reason.message}`);
          this.libraryTexts = [];
        });
    } else {
      this.libraryTexts = [];
    }
  }

  get libraryTextsList(): string[] {
    if (this.libraryTexts) {
      return this.libraryTexts;
    }
    return [];
  }

  /**
   * Load a specific library text as the practice text
   */
  private loadNamedText(textId: string): void {
    this.libraryOperation((db: IDBDatabase) => {
      // Read the list of texts
      const txn = db.transaction('library');
      const library = txn.objectStore('library');
      const getReq = library.get(`${textId}`);
      getReq.onsuccess = () => {
        console.log(`loaded ${textId} with content ${getReq.result.text}`);
        this.reftext = getReq.result.text;
        db.close();
      };

      getReq.onerror = () => {
        alert(`Failed to read text ${textId} from library. Error = ${getReq.error}`);
        db.close();
      };
    });
  }

  /**
   * Handle the text selection - retrieve the selected text.
   */
  handleLibrarySelection(event: Event): void {
    const textId = (event.target as HTMLSelectElement).value;
    console.log(`User selected event text = ${textId}`);
    // Load the selected text
    this.loadNamedText(textId);
  }

  private saveTextToLibrary(name: string) {
    this.libraryOperation((db: IDBDatabase) => {
      // Read the list of texts
      const txn = db.transaction('library', 'readwrite');
      const library = txn.objectStore('library');
      try {
        const getReq = library.put({ id: `${name}`, text: `${this.reftext}` });
        getReq.onsuccess = () => {
          db.close();
        };

        getReq.onerror = () => {
          alert(`Failed to save text to library. Will continue without it. Error = ${getReq.error}`);
          db.close();
        };
      } catch (e) {
        alert(`Library operation failed: ${e}`);
      }
    });
  }

  /**
   * Receive and handle the name to save the current text.
   */
  handleSaveName(saveName: string): void {
    console.log(`handleSaveName: ${saveName}`);
    if (this.libraryTextsList.includes(saveName)) {
      this.validationErrorText = `Name ${saveName} already in use. Enter new name or confirm overwrite ?`;
      return;
    }
    this.showSaveNameDialog = false;
    this.saveTextToLibrary(saveName);
    this.loadLibraryTexts();
  }

  /**
   * Vue computed property to determine whether to display the popup to prompt for the
   * name to save the text under or not.
   */
  get promptForSaveName(): boolean {
    return this.showSaveNameDialog;
  }

  /**
   * Handle the Save button click
   */
  saveHdlr(): void {
    this.showSaveNameDialog = true;
  }

  handleCancel(): void {
    this.showSaveNameDialog = false;
  }

  /**
   * This function is called from the enterHdlr function to ensure that the character entered
   * matches the corresponding one in the practice text.
   * @param event KeyboardEvent for the key release
   */
  showTypingErrors(typedLine: string): void {
    // const f = this.curTextsize;
    // const gs = new GraphemeSplitter();
    // let annotatedEnteredLine = '<span>';
    // let annotatedRefLine = '<span>';
    let annotatedEnteredLine = '';
    let annotatedRefLine = '';
    const refTextNFD = this.textExampleLine.trim().normalize('NFD');
    const enteredTextNFD = typedLine.trim().normalize('NFD');
    // Split on whitespace to get "words" - this constrains the corrections so we don't
    //   incorrectly mark the whole remaining string in error if characters are added or
    //   omitted in a word.
    const refTextNFDGrWords: string[] = refTextNFD.split(' ');
    const enteredTextNFDGrWords: string[] = enteredTextNFD.split(' ');
    let done = false;
    let currentRefWord = 0;
    let currentEnteredWord = 0;
    const numRefWords = refTextNFDGrWords.length;
    const numEnteredWords = enteredTextNFDGrWords.length;
    let errorsFound = false;

    while (!done) {
      if (currentRefWord === numRefWords && currentEnteredWord < numEnteredWords) {
        // entered line has more words than reference
        annotatedEnteredLine += `<span style="${COLOR_ADDED}">`;
        const wordsToCopy = numEnteredWords - currentEnteredWord;
        for (let k = 0; k < wordsToCopy; k += 1) {
          annotatedEnteredLine += `${enteredTextNFDGrWords[currentEnteredWord + k]} `;
        }
        annotatedEnteredLine += '</span>';
        currentEnteredWord += wordsToCopy;
        errorsFound = true;
      } else if (currentRefWord < numRefWords && currentEnteredWord === numEnteredWords) {
        // reference line has more words than the typed line
        annotatedRefLine += `<span style="${COLOR_OMITTED}">`;
        const wordsToCopy = numRefWords - currentRefWord;
        for (let k = 0; k < wordsToCopy; k += 1) {
          annotatedRefLine += `${refTextNFDGrWords[currentRefWord + k]} `;
        }
        annotatedRefLine += '</span>';
        currentRefWord += wordsToCopy;
        errorsFound = true;
      } else {
        const { diffMetric, annotatedRefWord, annotatedEnteredWord } = TypingPractice.diffWord(
          enteredTextNFDGrWords[currentEnteredWord], refTextNFDGrWords[currentRefWord],
        );
        if (diffMetric === 0) {
          // current words match
          annotatedEnteredLine += `${annotatedEnteredWord} `;
          annotatedRefLine += `${annotatedRefWord} `;
          currentRefWord += 1;
          currentEnteredWord += 1;
        } else {
          errorsFound = true;
          let adjacentMatch = false;
          if (currentRefWord + 1 < numRefWords) {
            // entered line is missing word in the current slot
            const rv = TypingPractice.diffWord(
              enteredTextNFDGrWords[currentEnteredWord], refTextNFDGrWords[currentRefWord + 1],
            );
            const { diffMetric: dM, annotatedRefWord: aRW, annotatedEnteredWord: aEW } = rv;
            if (dM === 0) {
              annotatedRefLine += `<span style="${COLOR_OMITTED}">${refTextNFDGrWords[currentRefWord]} </span>`;
              annotatedRefLine += `${aRW} `;
              currentRefWord += 2;
              annotatedEnteredLine += `${aEW} `;
              currentEnteredWord += 1;
              adjacentMatch = true;
            }
          }
          if (currentEnteredWord + 1 < numEnteredWords && !adjacentMatch) {
            // entered line has an extra word in the current slot
            const rv = TypingPractice.diffWord(
              enteredTextNFDGrWords[currentEnteredWord + 1], refTextNFDGrWords[currentRefWord],
            );
            const { diffMetric: dM, annotatedRefWord: aRW, annotatedEnteredWord: aEW } = rv;
            if (dM === 0) {
              annotatedEnteredLine += `<span style="${COLOR_ADDED}">${enteredTextNFDGrWords[currentEnteredWord]} </span>`;
              annotatedEnteredLine += `${aEW} `;
              currentEnteredWord += 2;
              annotatedRefLine += `${aRW} `;
              currentRefWord += 1;
              adjacentMatch = true;
            }
          }
          if (!adjacentMatch) {
            // Just this word is wrong or there are multiple errors in sequence - give up for now
            // Assume the former and update reference as ok and entered as different
            annotatedRefLine += `${annotatedRefWord} `;
            // annotatedEnteredLine +=
            // `<span style="${COLOR_DIFFERENT}">${annotatedEnteredWord} </span>`;
            annotatedEnteredLine += `${annotatedEnteredWord} `;
            currentRefWord += 1;
            currentEnteredWord += 1;
          }
        }
      }

      // Check termination condition for diffing
      if (currentRefWord >= numRefWords && currentEnteredWord >= numEnteredWords) {
        done = true;
      }
    }
    if (errorsFound) {
      this.annotatedRefLine = annotatedRefLine.trimEnd();
      this.annotatedTypedLine = annotatedEnteredLine.trimEnd();
    } else {
      this.annotatedRefLine = '';
      this.annotatedTypedLine = '';
    }
  }

  private static diffWord(enteredWord: string, refWord: string): {
    diffMetric: number; annotatedRefWord: string; annotatedEnteredWord: string;
  } {
    const gs = new GraphemeSplitter();
    const refWordNFDGr: string[] = gs.splitGraphemes(refWord);
    const enteredWordNFDGr: string[] = gs.splitGraphemes(enteredWord);
    console.log(`ref: ${refWordNFDGr}`);
    console.log(`ent: ${enteredWordNFDGr}`);
    // let annotatedEnteredWord = '<span>';
    // let annotatedRefWord = '<span>';
    let annotatedEnteredWord = '';
    let annotatedRefWord = '';
    const refLen = refWordNFDGr.length;
    const enteredLen = enteredWordNFDGr.length;
    // const checkedRef: boolean[] = [];
    // const checkedEntered: boolean[] = [];
    let currentRef = 0;
    let currentEntered = 0;
    let done = false;
    let diffMetric = 0;

    while (!done) {
      if (currentRef === refLen && currentEntered < enteredLen) {
        // Extra graphemes left over in entered word
        annotatedEnteredWord += `<span style="${COLOR_ADDED}">`;
        const gsToCopy = enteredLen - currentEntered;
        for (let k = 0; k < gsToCopy; k += 1) {
          annotatedEnteredWord += enteredWordNFDGr[currentEntered + k];
        }
        annotatedEnteredWord += '</span>';
        currentEntered += gsToCopy;
        diffMetric = 1;
      } else if (currentRef < refLen && currentEntered === enteredLen) {
        // Extra graphemes left over in the reference word
        annotatedRefWord += `<span style="${COLOR_OMITTED}">`;
        const gsToCopy = refLen - currentRef;
        for (let k = 0; k < gsToCopy; k += 1) {
          annotatedRefWord += refWordNFDGr[currentRef + k];
        }
        annotatedRefWord += '</span>';
        currentRef += gsToCopy;
        diffMetric = 1;
      } else if (refWordNFDGr[currentRef] === enteredWordNFDGr[currentEntered]) {
        // current graphemes match
        annotatedEnteredWord += `${enteredWordNFDGr[currentEntered]}`;
        annotatedRefWord += refWordNFDGr[currentRef];
        currentRef += 1;
        currentEntered += 1;
      } else if (currentRef + 1 < refLen
        && refWordNFDGr[currentRef + 1] === enteredWordNFDGr[currentEntered]) {
        // entered word is missing character in the current slot
        annotatedRefWord += `<span style="${COLOR_OMITTED}">${refWordNFDGr[currentRef]}</span>`;
        annotatedRefWord += refWordNFDGr[currentRef + 1];
        currentRef += 2;
        annotatedEnteredWord += `${enteredWordNFDGr[currentEntered]}`;
        currentEntered += 1;
        diffMetric = 1;
      } else if (currentEntered + 1 < enteredLen
        && refWordNFDGr[currentRef] === enteredWordNFDGr[currentEntered + 1]) {
        // entered word has an extra character in the current slot
        annotatedEnteredWord += `<span style="${COLOR_ADDED}">${enteredWordNFDGr[currentEntered]}</span>`;
        annotatedEnteredWord += enteredWordNFDGr[currentEntered + 1];
        currentEntered += 2;
        annotatedRefWord += `${refWordNFDGr[currentRef]}`;
        currentRef += 1;
        diffMetric = 1;
      } else {
        // Just this character is wrong or there are multiple errors in sequence - give up for now
        // Assume the former and update reference as ok and entered as different
        annotatedRefWord += refWordNFDGr[currentRef];
        annotatedEnteredWord += `<span style="${COLOR_DIFFERENT}">${enteredWordNFDGr[currentEntered]}</span>`;
        currentRef += 1;
        currentEntered += 1;
        diffMetric = 1;
      }

      // Check termination condition for diffing
      if (currentRef >= refLen && currentEntered >= enteredLen) {
        done = true;
      }
    }
    // annotatedRefWord += '</span>';
    // annotatedEnteredWord += '</span>';
    return { diffMetric, annotatedRefWord, annotatedEnteredWord };
  }

  /**
   * Handler function for the end of each typed line.
   * This function handles the end of line:
   *   - moving the typed text from the input box to the output text
   *   - moving the next line in from the yet-to-be-typed text
   *   - handles intervening blank lines
   *   - handles completion of the practice text
   * @param event event containing the typed character
   */
  enterHdlr(event: KeyboardEvent): void {
    if (event && event.keyCode === 13) {
      // Halt the timer and add the time to the total
      this.totalTypingTime += Date.now() - this.lastTimeStartedTyping;
      this.currentlyTyping = false;

      // Get entered text
      const inputElt = document.getElementById('practice-line') as HTMLInputElement;

      // Update the number of words typed
      this.wordsTyped += inputElt.value.split(' ').length;

      // Validate entered line against the practice text line
      if (this.showCorrections) {
        this.showTypingErrors(inputElt.value);
      }

      // let textToAdd = inputElt.value;
      let textToAdd = this.textExampleLine;

      // Copy line to typed area
      if (textToAdd.length === 0 || textToAdd === '\n' || textToAdd === '') {
        textToAdd = '&nbsp;';
      }
      if (this.typedPracticeText.length > 0) {
        if (this.numTypedPracticeLines > 4) {
          const idx = this.typedPracticeText.search('<br>') + 4;
          this.typedPracticeText = this.typedPracticeText.substr(idx);
        }
        this.typedPracticeText = `${this.typedPracticeText}<br>${textToAdd}`;
        // this.typedPracticeText = `${this.typedPracticeText}<br>${correctedText}`;
      } else {
        this.typedPracticeText = textToAdd;
        // this.typedPracticeText = correctedText;
      }
      this.numTypedPracticeLines += 1;

      // Exit if we are done.
      if (this.referenceTextNextLine >= this.referenceTextLines.length) {
        this.textExampleLine = 'You are done';
        return;
      }

      // Display next copy line
      this.textExampleLine = this.referenceTextLines[this.referenceTextNextLine];
      if (this.textExampleLine.length === 0 || this.textExampleLine === '\n' || this.textExampleLine === '') {
        this.textExampleLine = '&nbsp';
      }
      this.referenceTextNextLine += 1;
      this.practiceLineText = '';

      // Shuffle the yet-to-be-typed-text
      const lineBreak = '<br>';
      let idx = this.yetToBeTypedPracticeText.search(lineBreak);
      if (idx === -1) {
        this.yetToBeTypedPracticeText = '';
      } else {
        idx += lineBreak.length;
        this.yetToBeTypedPracticeText = this.yetToBeTypedPracticeText.substr(idx);
        if (this.nextYetToBeTypedPracticeLine < this.referenceTextLines.length) {
          textToAdd = this.referenceTextLines[this.nextYetToBeTypedPracticeLine];
          if (textToAdd.length === 0 || textToAdd === '\n' || textToAdd === '') {
            textToAdd = '&nbsp;';
          }
          this.yetToBeTypedPracticeText = `${this.yetToBeTypedPracticeText}<br>${textToAdd}`;
          this.nextYetToBeTypedPracticeLine += 1;
        }
      }
    } else if (!this.currentlyTyping) {
      this.lastTimeStartedTyping = Date.now();
      this.currentlyTyping = true;
    }
  }

  /**
   * Create a list of lines broken as the textarea breaks them.
   * This is done by cloning the text area and using the clone as a way to test
   * each line break. This technique is an adaptation of the code found at:
   * https://stackoverflow.com/questions/4719777/finding-line-breaks-in-textarea-that-is-word-wrapping-arabic-text
   * Many thanx to the contributors.
   * Apart from using a separate area and not replacing the original which I need to keep
   * this version:
   *    is adjusted to handle, and retain, blank lines in the input text,
   *    is converted to Typescript
   *    fixes the bug where the original would move the last word of a line to the next
   *        line if the breaking character was whitespace. Actually it only moves the bug
   *        to cause the break too early in some cases.
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
      const bLonger = testBreak(strTest);
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
      let i = 0;
      let j: number;
      if (strRaw.length === 0) {
        rv.push('\n');
      } else {
        while (i < strRaw.length) {
          const breakOffset = findNextBreakLength(strRaw.substr(i));
          if (breakOffset === null) {
            // Terminate iteration - we are at the end of the input text.
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
          rv.push(strRaw.substr(i, nLineLength));
          i += nLineLength;
        }
      }
    });
    oTextarea.setAttribute('wrap', 'on');
    oTextarea.value = '';
    return rv;
  }

  private showTypingPane(): void {
    this.typingPaneVisible = true;
  }

  private hideTypingPane(): void {
    this.typingPaneVisible = false;
  }

  private showReferencePane(): void {
    this.referencePaneVisble = true;
  }

  private hideReferencePane(): void {
    this.referencePaneVisble = false;
  }
}
