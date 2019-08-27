"use strict";
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
    const document = editor.document;
    let selectedText = editor.document.getText(rangeBlock(editor));
    // console.log(document.fileName,"disini");
    let fileName = document.fileName;
    // console.log(selectedText);
    // console.log(fileName);
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
}
exports.default = runSelectedCode;
//# sourceMappingURL=runSelectedCode.js.map