oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g mooi
$ mooi COMMAND
running command...
$ mooi (--version)
mooi/0.0.0 darwin-x64 node-v18.16.0
$ mooi --help [COMMAND]
USAGE
  $ mooi COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mooi hello PERSON`](#mooi-hello-person)
* [`mooi hello world`](#mooi-hello-world)
* [`mooi help [COMMANDS]`](#mooi-help-commands)
* [`mooi plugins`](#mooi-plugins)
* [`mooi plugins:install PLUGIN...`](#mooi-pluginsinstall-plugin)
* [`mooi plugins:inspect PLUGIN...`](#mooi-pluginsinspect-plugin)
* [`mooi plugins:install PLUGIN...`](#mooi-pluginsinstall-plugin-1)
* [`mooi plugins:link PLUGIN`](#mooi-pluginslink-plugin)
* [`mooi plugins:uninstall PLUGIN...`](#mooi-pluginsuninstall-plugin)
* [`mooi plugins:uninstall PLUGIN...`](#mooi-pluginsuninstall-plugin-1)
* [`mooi plugins:uninstall PLUGIN...`](#mooi-pluginsuninstall-plugin-2)
* [`mooi plugins update`](#mooi-plugins-update)

## `mooi hello PERSON`

Say hello

```
USAGE
  $ mooi hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/dmitry-zaitsev/mooi/blob/v0.0.0/dist/commands/hello/index.ts)_

## `mooi hello world`

Say hello world

```
USAGE
  $ mooi hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ mooi hello world
  hello world! (./src/commands/hello/world.ts)
```

## `mooi help [COMMANDS]`

Display help for mooi.

```
USAGE
  $ mooi help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for mooi.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.9/src/commands/help.ts)_

## `mooi plugins`

List installed plugins.

```
USAGE
  $ mooi plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ mooi plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/index.ts)_

## `mooi plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ mooi plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ mooi plugins add

EXAMPLES
  $ mooi plugins:install myplugin 

  $ mooi plugins:install https://github.com/someuser/someplugin

  $ mooi plugins:install someuser/someplugin
```

## `mooi plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ mooi plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ mooi plugins:inspect myplugin
```

## `mooi plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ mooi plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ mooi plugins add

EXAMPLES
  $ mooi plugins:install myplugin 

  $ mooi plugins:install https://github.com/someuser/someplugin

  $ mooi plugins:install someuser/someplugin
```

## `mooi plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ mooi plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ mooi plugins:link myplugin
```

## `mooi plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ mooi plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mooi plugins unlink
  $ mooi plugins remove
```

## `mooi plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ mooi plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mooi plugins unlink
  $ mooi plugins remove
```

## `mooi plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ mooi plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mooi plugins unlink
  $ mooi plugins remove
```

## `mooi plugins update`

Update installed plugins.

```
USAGE
  $ mooi plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
