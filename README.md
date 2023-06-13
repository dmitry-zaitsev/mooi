# mooi

Tool for generating AI translations.

A more detailed README is coming soon, stay tuned!

## Installation

Install it via npm:

```
npm -g mooi-cli
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
  - name: default     # 'default' is a keyword. We are going to allow selecting between formats in future releases
    outputFormat: src/translations/{{languageCode}}/index.js  # where to write the results for a given language
    format: |
    export default {
    {{#each translations}}
      {{this.key}}: '{{this.value}}',
    {{/each}}
    }
```
