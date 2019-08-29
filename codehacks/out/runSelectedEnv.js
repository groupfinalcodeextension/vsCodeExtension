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
    return range;
}
function runSelectedCode(editor, selection) {
    return __awaiter(this, void 0, void 0, function* () {
        const document = editor.document;
        var selectedRange = rangeBlock(editor);
        if (!selectedRange) {
            return;
        }
        let selectedText = editor.document.getText(selectedRange);
        var currentFolder = dirname(document.fileName);
        var input = yield vscode.window.showInputBox({
            prompt: "ENV Value: ",
            placeHolder: "Input your env value here.."
        });
        if (!input) {
            return;
        }
        var packageUris = yield vscode.workspace.findFiles("**/package.json", '**/node_modules/**');
        var trueFolder = null;
        var foundFolder = null;
        packageUris.forEach(uri => {
            var packageFolder = dirname(uri.fsPath).split("\\");
            foundFolder = packageFolder[packageFolder.length - 1];
            if (currentFolder.includes(foundFolder)) {
                trueFolder = dirname(uri.fsPath);
            }
        });
        if (!trueFolder) {
            return;
        }
        var selectedLine = document.lineAt(selectedRange.start.line);
        var docVariable = selectedLine.text.split("=");
        docVariable[1] = ` process.env.${selectedText.toLocaleUpperCase()}`;
        var newDocVariable = docVariable.join("=");
        editor.edit(edit => {
            edit.replace(selectedLine.range, newDocVariable);
        });
        var envUris = yield vscode.workspace.findFiles(`${foundFolder}/.env`, '**/node_modules/**');
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            if (envUris.length > 0) {
                var envFile = envUris[0];
                var envDoc = yield vscode.window.showTextDocument(envFile);
                var envText = envDoc.document.getText();
                var envs = envText.split("\n");
                var found = null;
                var index = 0;
                for (var i = 0; i < envs.length; i++) {
                    var envVariable = envs[i].split("=");
                    if (envVariable[0].toLocaleUpperCase() === selectedText.toLocaleUpperCase()) {
                        found = envVariable;
                        index = i;
                        break;
                    }
                }
                var newEnv = join(trueFolder, ".env");
                var finalEnv;
                if (!found) {
                    envs.push(`${selectedText.toLocaleUpperCase()}=${input}`);
                    finalEnv = envs.join("\n");
                    fs.writeFileSync(newEnv, finalEnv);
                    return;
                }
                if (found.length > 0) {
                    found[1] = input;
                    var newInput = found.join("=");
                    envs.splice(index, 1, newInput);
                    finalEnv = envs.join("\n");
                    fs.writeFileSync(newEnv, finalEnv);
                }
            }
            else {
                var newEnv = join(trueFolder, ".env");
                fs.writeFileSync(newEnv, `${selectedText.toLocaleUpperCase()}=${input}`);
            }
        }), 700);
        // // console.log(document.fileName,"disini");
        // let fileName = document.fileName;
        // let packageJson = dirname(fileName);
        // let flag = false;
        // while (flag === false) {
        //     try {
        //         fs.accessSync(join(packageJson, 'package.json'), fs.constants.R_OK | fs.constants.W_OK);
        //         flag = true;
        //     } catch (err) {
        //         packageJson = dirname(packageJson);
        //     }
        // }
        // if (flag === true) {
        //     try {
        //         fs.accessSync(join(packageJson, '.env'), fs.constants.R_OK | fs.constants.W_OK);
        //         let uri = vscode.Uri.file(join(packageJson, '.env'));
        //         let document = await vscode.workspace.openTextDocument(uri);
        //         let documentText = document.getText();
        //         let dataEnv = documentText.split('\n');
        //         console.log(dataEnv, "<<<<<<")
        //         let dataEnvTrue = true;
        //         dataEnv.forEach(element => {
        //             if (element.split('=')[0] === selectedText) {
        //                 dataEnvTrue = false;
        //                 return;
        //             }
        //         });
        //         if (dataEnvTrue === true) {
        //             console.log('disini ni');
        //             var masuk = await vscode.window.showInputBox({
        //                 prompt: `.env ${selectedText}: `,
        //                 placeHolder: "Input here.."
        //             });
        //             dataEnv.push(`${selectedText}=${masuk}`);
        //             let stringEnv = dataEnv.join('\n');
        //             let newData = join(packageJson, '.env');
        //             fs.writeFile(newData, stringEnv, (err: object) => {
        //                 if (err) {
        //                     console.log(err);
        //                 }
        //             });
        //         }
        //     } catch (err) {
        //         let codeFile = join(packageJson, '.env');
        //         var input = await vscode.window.showInputBox({
        //             prompt: `.env ${selectedText}: `,
        //             placeHolder: "Input here.."
        //         });
        //         fs.writeFile(codeFile, `${selectedText}=${input}`, (err: object) => {
        //             if (err) {
        //                 console.log(err);
        //             }
        //         });
        //         // console.error('no access .env!');
        //     }
        // }
    });
}
exports.default = runSelectedCode;
//# sourceMappingURL=runSelectedEnv.js.map