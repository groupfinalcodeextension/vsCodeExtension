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
        let codeFile = join(dirname(fileName), 'tempFileCodeHacks.js');
        console.log(vscode.window.activeTerminal, "disini ni");
        let terminal;
        if (vscode.window.activeTerminal) {
            terminal = vscode.window.activeTerminal;
        }
        else {
            terminal = vscode.window.createTerminal({
                name: "CodeHacks",
                hideFromUser: false
            });
        }
        fs.writeFile(codeFile, selectedText, (err) => {
            if (err) {
                console.log(err);
            }
            terminal.show();
            terminal.sendText(`node ${codeFile}`);
            setTimeout(() => {
                fs.unlink(codeFile, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log('sip');
                });
            }, 700);
        });
    });
}
exports.default = runSelectedCode;
//# sourceMappingURL=runSelectedCode.js.map