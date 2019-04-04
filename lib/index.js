const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const debugFilePath = path.resolve(__dirname, '../files/debug.js');
const debugFileContent = fs.readFileSync(debugFilePath, 'utf8');
const PLuginID = 'ConsoleDebugWebpackPlugin';

const isObject = (data) => Object.prototype.toString.call(data) === '[object Object]';
const isString = (data) => typeof data === 'string';
const isArray = (data) => Array.isArray(data);


const getDebugJs = function () {
    return debugFileContent;
};


class ConsoleDebugWebpackPlugin {
    constructor (options = {}) {
        this.options = options;
    }

    injectDebugPlugin (_location, entries) {
        if (isString(entries)) {
            // eslint-disable-next-line
            console.log(
                chalk.red(`[WARN] the entry(${entries}) shoudle be config a array`)
            );
        } else if (isArray(entries)) {
            entries.unshift(debugFilePath);
        } else if (isObject(entries)) {
            for (const chunkName in entries) {
                this.injectDebugPlugin(_location, entries[chunkName]);
            }
        }
    }

    // 将webpack config entry为string的chunk变为数组
    resolveWebpackEntry (compiler) {
        const { options } = compiler;
        const { entry } = options;
        if (isString(entry)) {
            options.entry = [entry];
        } else if (isObject(entry)) {
            for (const chunkName in entry) {
                if (isString(entry[chunkName])) {
                    entry[chunkName] = [entry[chunkName]];
                }
            }
        }
    }

    apply (compiler) {
        const injectPlugin = this.injectDebugPlugin.bind(this);
        this.resolveWebpackEntry(compiler);
        if (compiler.hooks) {
            compiler.hooks.entryOption.tap(PLuginID, injectPlugin);
        } else {
            compiler.plugin('entry-option', injectPlugin);
        }
    }
}

ConsoleDebugWebpackPlugin.getDebugJs = getDebugJs;

module.exports = ConsoleDebugWebpackPlugin;