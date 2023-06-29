![logo64](https://github.com/dmitry-zaitsev/mooi/assets/2990722/82c82da6-a6d0-4f60-9787-c45e136c2987)

# mooi

*mooi* is a language translator that:

- Is aware in what context the text is going to be used (thanks to GPT).
- Supports nearly every imaginable framework (Spring, Android, iOS, React, etc.).
- Only translates values that weren't translated already.

## How it Works

At a high level:

- Define your product copies in a `yaml` file
- Attach a description to each of your copies (just as you would do with a real translator)
- Configure in what format you would like your output to be.
- Run `mooi-cli` and get the result.
- Commit the changes.

## Installation

Install it via npm:

```
npm i -g mooi-cli
```

## Use it

Define a `mooi` folder in the root of your repository. Within that folder, put the **original** untranslated string copies (currently English is assumed) and specify what languages you want to generate. Here is an example:

```yaml
# Assuming that this file is mooi/translations.yaml

languages: ['de', 'nl']
entries:
    - key: myCodeFriendlyKey                                            # a key that you will later use to look up this value
      value: Hello World                                                # what you actually want to translate
      description: This value is shown as a title of the home screen    # (optional, but recommended) Let mooi know in what context this value is used to get a better quality of translation
```

Then run 

```
npx mooi-cli translate --openAiKey {YOUR OPEN AI API KEY}
```

## Format the output
By default, results are generated in `mooi/translations` folder. If you want to provide an additional output, you can do so via `mooi/config.yaml` file using Handlebar.js syntax

```yaml
formats:
  - outputFormat: src/translations/{{languageCode}}/index.js  # where to write the results for a given language
    format: |
    export default {
    {{#each translations}}
      {{this.key}}: '{{this.value}}',
    {{/each}}
    }
```
