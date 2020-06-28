# typing-tutor

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run tests with debugger
```
node ./node_modules/@vue/cli-service/bin/vue-cli-service.js test:unit --inspect-brk
```
Then connect to the designated port in VSCode and start the tests with run button.

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Deploy for production

   + ```npm run build```
   + Go to the dist directory and upload all the objects to the production GCP bucket.
     + Remember not to upload the favicon as that is Vue's not mine
     + Remember to upload everything else because the build recreates everything with a unique name
     + Delete the old files that you are replacing.
       + In theory you can leave them in place and replace index.html last and the old version will work until the new one is in place.

### Ideas for Improvements

   + Add timer to calculate word rate
   + Add error counter so that an accuracy estimate can be displayed. Error counting must work whether errors are displayed or not.
   + Add option to save reference text to local storage for reuse later
   + Add option for to reset and practice the same text again

### Known Bugs/ToDos

   + Changing size of font does not work during the actual practice typing session. We should 
   have the size setting in the pasting of the reference text influence the practice text size.
   May need to blank the font and size controls once Practice is clicked.
   + Changing the font erases the typing input box if it is change while typing. It should leave
   you where you are and just change the font.
   + resetting text size after pasting increases reference-ta width and height, rather than rebreaking. This appears to happen only on the initial paste if the user has not manually resized the box. This may be naturally how it works.
   + if there are two blanks at the break point the first word of the next line ends up on this line.
   This is the opposite issue where the last word of the current line is added to the next one, which is caused by the stepping back from the breakpoint before checking.
   + Not clear in exampleLine anymore that you have a  blank line. Poss. fixes Tweak color ? Insert BLANK LINE, HIT RETURN text ?
   + there is no final stop. Instead the user can keep typing and hitting return pushing the text
   further up the screen. Harmless but not very good.
   + 'You are done' is not very explanatory as to next moves.
