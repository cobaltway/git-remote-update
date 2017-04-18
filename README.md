# git-remote-update

This library exposes a single object to watch for a remote git repo changes, and to update a local git repo. It is intended to work well with github.

Its process is quite simple, and was **not** designed to handle out of the box situations where the updated code has received commits from another source than the watched on. By the way, it is quite generic so it probably can be easely used to do so.

The git client used is the excellent [nodegit](http://www.nodegit.org/).

## Install

`npm install git-remote-update --save`

## Use

`const GitWatcher = require('git-remote-update');`

## Intended use case

You own a server, which host a process (a web service, a bot, etc).

You want to update the code on your server by using github (or any other remote git repo). Each time you push a change on the dedicated github repo from your personnal computer, you want the server to update its code.

Do the following:
- Create a repo on github and put your code in (including git-remote-update handlers)
- Clone the repo on your server
- On your server, start your script with forever [forever](https://github.com/foreverjs/forever); this is a client that will restart your script if it ends
- On your code, there should be something like that, which will simply kill your script after an update is done (and forever will gently restart it):

```
const gw = new GitWatcher();

gw.on('ready', gw.watch);
gw.on('newerCommit', gw.update);
gw.on('updated', process.exit);
```

## API
This library exposes the GitWatcher class. GitWatcher is a simple event emitter.

**new GitWatcher(config)**

The `config` is an object with the following values:
Option       | Description                                                                | Default
------------ | -------------------------------------------------------------------------  | ---------------
git          | Location of the git file (relative to the script entry point, or fullpath) | './.git'
remoteBranch | The branch to get update from                                              | 'origin/master'
localBranch  | The branch to be updated                                                   | 'master'

**fetch()**

Look once at the remote branch.

**watch(interval)**

Call fetch each `interval` (in ms, default 30000), so it can look for changes on the repo overtime.

**update()**

Performs merge from remote branch to localBranch.

**on(event, callback)**

Call the `callback` function when the corresponding event is fired.

Event           | Description                                                                | Callback parameters
--------------- | -------------------------------------------------------------------------  | -------------------------
ready           | The object is ready, so you can call `fetch` or `watch`                    | -
comparison      | A comparison is done, so you can make your own comparison function         | remoteCommit, localCommit
newerCommit     | There is a more recent commit on the remote branch                         | remoteCommit, localCommit
differentCommit | The last commit id on the remote branch is different from the local        | remoteCommit, localCommit
updated         | Update is done                                                             | -
error           | An error happend                                                           | error

`remoteCommit` and `localCommit` are commit objects from nodegit, you can have documentation for them [on nodegit website](http://www.nodegit.org/api/commit/).
