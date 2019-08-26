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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { exec, execFile } = require("child_process");
const path = require("path");
const consoleLogger_1 = require("./consoleLogger");
const installDependencies_1 = require("./installDependencies");
const runSelectedCode_1 = require("./runSelectedCode");
const makeComponent_1 = require("./makeComponent");
// var consoleLogger = require("./consoleLogger")
const fs = require('fs');
const { basename, dirname, extname, join } = require('path');
// import rangeBlock from '../src/codeRunner';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function getAllLogStatements(document, documentText) {
    let logStatements = [];
    // console.log(documentText, "afguiagfiaegf")
    // console.log(typeof documentText);
    const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
    let match;
    while (match = logRegex.exec(documentText)) {
        console.log(document, "didalem");
        // console.log(typeof document);
        // console.log(typeof documentText);
        let matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
        console.log(matchRange, "didalem laig range");
        if (!matchRange.isEmpty) {
            logStatements.push(matchRange);
            console.log(logStatements, "diloopingan");
        }
    }
    console.log(logStatements, "dsioaasifjip");
    return logStatements;
}
function getAllCommentLogStatements(document, documentText) {
    let logStatements = [];
    const logRegex = /[/][/]console|[/][/] console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
    let match;
    while (match = logRegex.exec(documentText)) {
        let matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
        if (!matchRange.isEmpty) {
            logStatements.push(matchRange);
        }
    }
    return logStatements;
}
function deleteFoundLogStatements(workspace, docUri, logs, document) {
    if (document) {
        logs.forEach((log) => {
            console.log(typeof log);
            workspace.delete(docUri, log);
        });
        vscode.workspace.applyEdit(workspace)
            .then(() => {
            if (logs.length) {
                vscode.window.showInformationMessage(`Deleted ${logs.length} consoles`);
            }
        });
    }
    else {
        logs.forEach((log) => {
            console.log(typeof log);
            workspace.delete(docUri, log);
        });
        vscode.workspace.applyEdit(workspace)
            .then(() => {
            if (logs.length) {
                vscode.window.showInformationMessage(`Deleted ${logs.length} consoles`);
            }
        });
    }
}
function commentFoundStatements(workspace, docUri, logs, document) {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA");
    if (document) {
        logs.forEach((log) => {
            const documentText = document.getText(log);
            // console.log(documentText)
            workspace.replace(docUri, log, `//${documentText}`);
        });
        vscode.workspace.applyEdit(workspace)
            .then(() => {
            console.log("SELESAI");
            if (logs.length) {
                vscode.window.showInformationMessage(`Comments ${logs.length} consoles`);
            }
        });
    }
    else {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        logs.forEach((log) => {
            const documentText = editor.document.getText(log);
            // console.log(documentText)
            workspace.replace(docUri, log, `//${documentText}`);
        });
        vscode.workspace.applyEdit(workspace)
            .then(() => {
            console.log("SELESAI");
            if (logs.length) {
                vscode.window.showInformationMessage(`Comments ${logs.length} consoles`);
            }
        });
    }
}
function uncommentFoundStatements(workspace, docUri, logs, document) {
    if (document) {
        logs.forEach((log) => {
            const documentText = document.getText(log);
            let text = documentText.slice(2);
            workspace.replace(docUri, log, `${text}`);
        });
        vscode.workspace.applyEdit(workspace)
            .then(() => {
            console.log("SELESAI");
            if (logs.length) {
                vscode.window.showInformationMessage(`Uncomments ${logs.length} consoles`);
            }
        });
    }
    else {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        logs.forEach((log) => {
            const documentText = editor.document.getText(log);
            let text = documentText.slice(2);
            workspace.replace(docUri, log, `${text}`);
        });
        vscode.workspace.applyEdit(workspace)
            .then(() => {
            if (logs.length) {
                vscode.window.showInformationMessage(`Uncomments ${logs.length} consoles`);
            }
        });
    }
}
// const insertText = (val) => {
//     const editor = vscode.window.activeTextEditor;
//     if (!editor) {
//         vscode.window.showErrorMessage('Can\'t insert log because no document is open');
//         return;
//     }
//     const selection = editor.selection;
//     const range = new vscode.Range(selection.start, selection.end);
//     editor.edit((editBuilder) => {
//         editBuilder.replace(range, val);
//     });
// }
function rangeBlock() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const selection = editor.selection;
    const range = new vscode.Range(selection.start, selection.end);
    console.log(range);
    return range;
}
function deleteFile(file) {
    if (file) {
        fs.unlinkSync(file);
    }
    else {
        console.log('gagal');
    }
}
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "helloworld" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        console.log("ASDASDSDA");
        vscode.window.showInformationMessage('Hello Welcome to CodeHacks!!!!');
    });
    const deleteLogStatements = vscode.commands.registerCommand('extension.deleteAllLogStatements', (uri) => __awaiter(this, void 0, void 0, function* () {
        if (!uri) {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const document = editor.document;
            const documentText = editor.document.getText();
            const logStatements = getAllLogStatements(document, documentText);
            let workSpaceEdit = new vscode.WorkspaceEdit();
            deleteFoundLogStatements(workSpaceEdit, document.uri, logStatements, null);
        }
        else {
            // console.log(documentText, document, "disnii")
            let document = yield vscode.workspace.openTextDocument(uri);
            let documentText = document.getText();
            let logStatements = yield getAllLogStatements(document, documentText);
            console.log(logStatements, "shfehfoehfoehfea");
            let workSpaceEdit = new vscode.WorkspaceEdit();
            yield deleteFoundLogStatements(workSpaceEdit, document.uri, logStatements, document);
        }
    }));
    const commentLogStatements = vscode.commands.registerCommand('extension.commentAllLogStatements', (uri) => __awaiter(this, void 0, void 0, function* () {
        // console.log(text,"ajfaifoa")
        // const documentText = editor.document.getText();
        // console.log(documentText, "sini mandoan")
        if (!uri) {
            let editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            let document = editor.document;
            let documentText = editor.document.getText();
            console.log(document, "disnii afbjagfyagfiagfuagiaifgda");
            const logStatements = getAllLogStatements(document, documentText);
            let workSpaceEdit = new vscode.WorkspaceEdit();
            commentFoundStatements(workSpaceEdit, document.uri, logStatements, null);
        }
        else {
            // console.log(documentText, document, "disnii")
            let document = yield vscode.workspace.openTextDocument(uri);
            let documentText = document.getText();
            let logStatements = yield getAllLogStatements(document, documentText);
            console.log(logStatements, "shfehfoehfoehfea");
            let workSpaceEdit = new vscode.WorkspaceEdit();
            yield commentFoundStatements(workSpaceEdit, document.uri, logStatements, document);
        }
    }));
    const uncommentLogStatements = vscode.commands.registerCommand('extension.uncommentAllLogStatements', (uri) => __awaiter(this, void 0, void 0, function* () {
        if (!uri) {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const document = editor.document;
            const documentText = editor.document.getText();
            const logStatements = getAllCommentLogStatements(document, documentText);
            let workSpaceEdit = new vscode.WorkspaceEdit();
            uncommentFoundStatements(workSpaceEdit, document.uri, logStatements, null);
        }
        else {
            let document = yield vscode.workspace.openTextDocument(uri);
            let documentText = document.getText();
            let logStatements = yield getAllCommentLogStatements(document, documentText);
            console.log(logStatements, "shfehfoehfoehfea");
            let workSpaceEdit = new vscode.WorkspaceEdit();
            yield uncommentFoundStatements(workSpaceEdit, document.uri, logStatements, document);
        }
    }));
    const addLogStatements = vscode.commands.registerCommand('extension.addLogStatements', (uri) => __awaiter(this, void 0, void 0, function* () {
        if (uri) {
            var selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 22));
            var document = yield vscode.workspace.openTextDocument(uri);
            // console.log(editorTest.getText(), "GELLOLOLO")
            var editorTest = yield vscode.window.showTextDocument(document);
            yield consoleLogger_1.default(editorTest, selection);
        }
        else {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const selection = editor.selection;
            yield consoleLogger_1.default(editor, selection);
        }
    }));
    const installDependencies = vscode.commands.registerCommand('extension.installDependencies', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        yield installDependencies_1.default(editor);
    }));
    const runCodeByBlock = vscode.commands.registerCommand('extension.runCode', (uri) => __awaiter(this, void 0, void 0, function* () {
        if (uri) {
            var selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 22));
            var document = yield vscode.workspace.openTextDocument(uri);
            var editor = yield vscode.window.showTextDocument(document);
            yield runSelectedCode_1.default(editor, selection);
        }
        else {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const selection = editor.selection;
            yield runSelectedCode_1.default(editor, selection);
        }
    }));
    const MakeComponent = vscode.commands.registerCommand('extension.makeComponent', () => __awaiter(this, void 0, void 0, function* () {
        var input = yield vscode.window.showInputBox({
            prompt: "Component Name: ",
            placeHolder: "Input your component name here.."
        });
        var editor = vscode.window.activeTextEditor;
        if (!editor || !input) {
            return;
        }
        yield makeComponent_1.default(editor, input);
    }));
    context.subscriptions.push(disposable);
    context.subscriptions.push(runCodeByBlock);
    context.subscriptions.push(installDependencies);
    context.subscriptions.push(deleteLogStatements);
    context.subscriptions.push(addLogStatements);
    context.subscriptions.push(commentLogStatements);
    context.subscriptions.push(uncommentLogStatements);
    context.subscriptions.push(MakeComponent);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
//# sourceMappingURL=extension.js.map