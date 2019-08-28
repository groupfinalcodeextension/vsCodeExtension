"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const { join, dirname } = require("path");
function rangeBlock(editor) {
    if (!editor) {
        return;
    }
    const selection = editor.selection;
    const range = new vscode.Range(selection.start, selection.end);
    console.log(range, "disinii ni");
    return range;
}
function runSelectedCode(editor, selection) {
    return __awaiter(this, void 0, void 0, function* () {
        const document = editor.document;
        let selectedText = editor.document.getText(rangeBlock(editor));
        // console.log(document.fileName,"disini");
        let fileName = document.fileName;
        let packageJson = dirname(fileName);
        let flag = false;
        while (flag === false) {
            try {
                fs.accessSync(join(packageJson, 'package.json'), fs.constants.R_OK | fs.constants.W_OK);
                flag = true;
                console.log('can read/write');
            }
            catch (err) {
                packageJson = dirname(packageJson);
                console.error('no access!');
            }
        }
        if (flag === true) {
            try {
                fs.accessSync(join(packageJson, '.env'), fs.constants.R_OK | fs.constants.W_OK);
                let uri = vscode.Uri.file(join(packageJson, '.env'));
                console.log(uri);
                let document = yield vscode.workspace.openTextDocument(uri);
                let documentText = document.getText();
                let dataEnv = documentText.split('\n');
                let dataEnvTrue = true;
                dataEnv.forEach(element => {
                    if (element.split('=')[0] === selectedText) {
                        dataEnvTrue = false;
                        return;
                    }
                });
                console.log(dataEnvTrue, "ada ga");
                if (dataEnvTrue === true) {
                    console.log('disini ni');
                    var masuk = yield vscode.window.showInputBox({
                        prompt: `.env ${selectedText}: `,
                        placeHolder: "Input here.."
                    });
                    dataEnv.push(`${selectedText}=${masuk}`);
                    let stringEnv = dataEnv.join('\n');
                    let newData = join(packageJson, '.env');
                    fs.writeFile(newData, stringEnv, (err) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log('kebikin');
                    });
                }
                console.log('can read/write .env');
            }
            catch (err) {
                let codeFile = join(packageJson, '.env');
                console.log(codeFile);
                var input = yield vscode.window.showInputBox({
                    prompt: `.env ${selectedText}: `,
                    placeHolder: "Input here.."
                });
                fs.writeFile(codeFile, `${selectedText}=${input}`, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log('kebikin');
                });
                console.log(input);
                // console.error('no access .env!');
            }
        }
    });
}
exports.default = runSelectedCode;
//# sourceMappingURL=runSelectedEnv.js.map