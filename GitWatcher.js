const NodeGit = require('nodegit');
const EventEmitter = require('event-emitter-es6');

class GitWatcher extends EventEmitter {
    constructor({git = './.git', remoteBranch = 'origin/master', localBranch = 'master'}) {
        super();

        this.git = git;
        this.remoteBranch = remoteBranch;
        this.localBranch = localBranch;

        NodeGit.Repository
        .open(this.git)
        .then((repository) => {
            this.repository = repository;
            this.emit('ready');
        }).catch(this.error);
    }

    watch(refreshRate = 30000) {
        const interval = setInterval(this.fetch, refreshRate);
        return () => {
            clearInterval(interval);
        };
    }

    fetch() {
        this.repository.fetchAll()
        .then(() => {
            this.repository.getReferenceCommit(this.remoteBranch)
            .then((remoteCommit) => {
                this.repository.getReferenceCommit(this.localBranch)
                .then((localCommit) => {
                    this.compare(remoteCommit, localCommit);
                }).catch(this.error);
            }).catch(this.error);
        }).catch(this.error);
    }

    compare(remoteCommit, localCommit) {
        this.emit('comparison', remoteCommit, localCommit);
        if (String(remoteCommit.id()) !== String(localCommit.id())) {
            this.emit('differentCommit', remoteCommit, localCommit);
        }
        if (remoteCommit.date() > localCommit.date()) {
            this.emit('newerCommit', remoteCommit, localCommit);
        }
    }

    update() {
        this.repository.mergeBranches(this.localBranch, this.remoteBranch)
        .then(() => {
            this.emit('updated');
        }).catch(this.error);
    }

    error(err) {
        this.emit('error', err);
    }
}

module.exports = GitWatcher;
