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
function consoleLogger(editor, selection) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!editor) {
            return;
        }
        if (!selection) {
            selection = editor.selection;
        }
        var text = editor.document.getText(selection);
        const cursor = selection.start;
        const line = selection.active.line;
        const range = editor.document.getWordRangeAtPosition(cursor);
        var regex = /(var|let|const)/;
        if (regex.test(text)) {
            var temp = text.split(" ");
            // console.log(temp)
            text = temp[1];
        }
        if (!range) {
            return;
        }
        var lastLine = new vscode.Position(range.end.line + 1, 0);
        var nextLine = editor.document.getWordRangeAtPosition(lastLine);
        if (!nextLine) {
            editor.edit(edit => {
                edit.insert(new vscode.Position(range.end.line + 1, 0), `\nconsole.log(${text}, 'ini ${text}')`);
            }).then(() => {
                return;
            });
        }
        editor.edit(edit => {
            edit.insert(new vscode.Position(range.end.line + 1, 0), `console.log(${text}, 'ini ${text}') \n`);
        });
    });
}
exports.default = consoleLogger;
//# sourceMappingURL=consoleLogger.js.map