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
const path = require("path");
function makeComponent(editor, input) {
    return __awaiter(this, void 0, void 0, function* () {
        var selection = editor.selection;
        var document = editor.document;
        var selectedText = document.getText(selection);
        var cursor = selection.start;
        var range = document.getWordRangeAtPosition(cursor);
        var documentText = document.getText();
        var importStatements = [];
        // INSERT IMPORT STATEMENT
        var importRegex = /import .*?from (\'.*?\'|\".*?\")/g;
        var match;
        while (match = importRegex.exec(documentText)) {
            let matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
            if (!matchRange.isEmpty) {
                importStatements.push(matchRange);
            }
        }
        if (importStatements.length === 0) {
            var scriptRegex = /<script>/g;
            var match2;
            while (match2 = scriptRegex.exec(documentText)) {
                let matchRange = new vscode.Range(document.positionAt(match2.index), document.positionAt(match2.index + match2[0].length));
                if (!matchRange.isEmpty) {
                    importStatements.push(matchRange);
                }
            }
            if (importStatements.length === 0) {
                return;
            }
        }
        var lastLine = importStatements[importStatements.length - 1];
        editor.edit(edit => {
            edit.insert(lastLine.end, `\nimport ${input} from "./${input}"`);
            edit.replace(selection, `<${input} />`);
        });
        //CREATE NEW FILE
        var currentDir = document.fileName;
        var myPath = path.dirname(currentDir);
        var newComponent = path.join(myPath, `${input}.vue`);
        var content = `<template>
  ${selectedText}
</template>

<script>
export default {
name: '${input}'
}
</script>

<style>

</style>
    `;
        fs.writeFileSync(newComponent, content);
        var uri = yield vscode.Uri.file(newComponent);
        var newComponentFile = yield vscode.window.showTextDocument(uri);
        // var lineCount = newComponentFile.document.lineCount
        // var startPos = new vscode.Position(0, 0)
        // var endPos = new vscode.Position(lineCount+1, 0)
        // var myRange = new vscode.Range(startPos, endPos)
        yield vscode.commands.executeCommand('vscode.open', uri);
        yield vscode.commands.executeCommand('editor.action.formatDocument', uri);
    });
}
exports.default = makeComponent;
//# sourceMappingURL=makeComponentVue.js.map