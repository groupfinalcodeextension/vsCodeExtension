"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
function InstallDependencies(editor) {
    var documentText = editor.document.getText();
    var document = editor.document;
    var requireStatements = [];
    var importStatements = [];
    const requireRegex = /require\(.*?\)/g;
    var matchRequire;
    while (matchRequire = requireRegex.exec(documentText)) {
        requireStatements.push(matchRequire[0]);
    }
    const importRegex = /import .*?from (\'.*?\'|\".*?\")/g;
    var matchImport;
    while (matchImport = importRegex.exec(documentText)) {
        importStatements.push(matchImport[0]);
    }
    for (var i = 0; i < requireStatements.length; i++) {
        var regexx = /(\.)|(\.\.)/;
        if (regexx.test(requireStatements[i])) {
            requireStatements.splice(i, 1);
            i = -1;
        }
    }
    for (var j = 0; j < importStatements.length; j++) {
        var regexxx = /(\.)|(\.\.)/;
        if (regexxx.test(importStatements[j])) {
            importStatements.splice(j, 1);
            j = -1;
        }
    }
    console.log(importStatements);
    var requireString = requireStatements.join(" ");
    var modulez = [];
    var regex2 = /(\'.*?\'|\".*?\")/g;
    var match2;
    while (match2 = regex2.exec(requireString)) {
        modulez.push(match2[0].replace(/[^a-zA-Z0-9\- ]/g, ""));
    }
    var importString = importStatements.join(" ");
    console.log(importString);
    var match3;
    while (match3 = regex2.exec(importString)) {
        modulez.push(match3[0].replace(/[^a-zA-Z0-9\-@\/ ]/g, ""));
    }
    console.log(modulez);
    var currentlyOpenTabfilePath = document.fileName;
    var myPath = path.dirname(currentlyOpenTabfilePath);
    console.log(myPath, "<<<<<<<<<<<<<<<");
    var dependencies = modulez.join(" ");
    var terminal = null;
    if (vscode.window.activeTerminal) {
        terminal = vscode.window.activeTerminal;
    }
    else {
        terminal = vscode.window.createTerminal({
            name: "CodeHacks",
            hideFromUser: false
        });
    }
    // console.log(dependencies)
    if (modulez.length > 0) {
        terminal.show();
        terminal.sendText(`cd ${myPath}`);
        terminal.sendText(`npm install ${dependencies}`);
        vscode.window.onDidChangeActiveTerminal(() => {
            console.log("HALOHALO");
        });
    }
    else {
        vscode.window.showInformationMessage("No dependencies found in current file");
    }
}
exports.default = InstallDependencies;
//# sourceMappingURL=installDependencies.js.map