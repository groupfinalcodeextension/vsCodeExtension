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
const runSelectedEnv_1 = require("./runSelectedEnv");
const runSelectedCode_1 = require("./runSelectedCode");
const makeComponentReact_1 = require("./makeComponentReact");
const makeComponentVue_1 = require("./makeComponentVue");
const async = require("async");
const fs = require('fs');
const { basename, dirname, extname, join } = require('path');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function getAllLogStatements(document, documentText) {
    let logStatements = [];
    const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count).*?\((.*)\);?/g;
    let match;
    while (match = logRegex.exec(documentText)) {
        let matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
        if (!matchRange.isEmpty) {
            logStatements.push(matchRange);
        }
    }
    return logStatements;
}
function getAllCommentLogStatements(document, documentText) {
    let logStatements = [];
    const logRegex = /\/\/.*?console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count).*?\((.*)\);?/g;
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
    if (document) {
        logs.forEach((log) => {
            const documentText = document.getText(log);
            workspace.replace(docUri, log, `//${documentText}`);
        });
        vscode.workspace.applyEdit(workspace)
            .then(() => {
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
            workspace.replace(docUri, log, `//${documentText}`);
        });
        vscode.workspace.applyEdit(workspace)
            .then(() => {
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
            var commentRegex = /\/\//g;
            var text = documentText.replace(commentRegex, "");
            workspace.replace(docUri, log, `${text}`);
        });
        vscode.workspace.applyEdit(workspace)
            .then(() => {
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
            var commentRegex = /\/\//g;
            var text = documentText.replace(commentRegex, "");
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
function rangeBlock() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const selection = editor.selection;
    const range = new vscode.Range(selection.start, selection.end);
    return range;
}
function deleteFile(file) {
    if (file) {
        fs.unlinkSync(file);
    }
    else {
        // console.log('gagal');
    }
}
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello Welcome to CodeHacks!!!!');
    });
    let outputChannel = vscode.window.createOutputChannel("CodeHacks");
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
            let workSpaceEdit = new vscode.WorkspaceEdit();
            yield deleteFoundLogStatements(workSpaceEdit, document.uri, logStatements, document);
        }
    }));
    const deleteLogStatementsGlobal = vscode.commands.registerCommand('extension.deleteLogStatementsGlobal', () => {
        outputChannel.clear();
        outputChannel.show();
        function delConsoleLog(fileName, callback) {
            vscode.workspace.openTextDocument(fileName)
                .then((currentDoc) => {
                var currentDocText = currentDoc.getText();
                var logStatements = getAllLogStatements(currentDoc, currentDocText);
                var workSpaceEdit = new vscode.WorkspaceEdit;
                if (logStatements.length > 0) {
                    deleteFoundLogStatements(workSpaceEdit, currentDoc.uri, logStatements, null);
                    outputChannel.appendLine(`${logStatements.length} Console Statements have been deleted in ${currentDoc.uri}`);
                }
                return callback();
            }, (err) => {
                return callback(err);
            });
        }
        vscode.workspace.findFiles('**/[!serviceWorker,App,app]*.js', '**/node_modules/**')
            .then(filez => {
            async.forEach(filez, delConsoleLog, (error) => {
                if (error) {
                    console.log(error, "ERROR ASYNC");
                }
                else {
                }
            });
        });
    });
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
            const logStatements = getAllLogStatements(document, documentText);
            let workSpaceEdit = new vscode.WorkspaceEdit();
            commentFoundStatements(workSpaceEdit, document.uri, logStatements, null);
        }
        else {
            // console.log(documentText, document, "disnii")
            let document = yield vscode.workspace.openTextDocument(uri);
            let documentText = document.getText();
            let logStatements = yield getAllLogStatements(document, documentText);
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
            let workSpaceEdit = new vscode.WorkspaceEdit();
            yield uncommentFoundStatements(workSpaceEdit, document.uri, logStatements, document);
        }
    }));
    const addLogStatements = vscode.commands.registerCommand('extension.addLogStatements', (uri) => __awaiter(this, void 0, void 0, function* () {
        if (uri) {
            var selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 22));
            var document = yield vscode.workspace.openTextDocument(uri);
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
    const runEnvCode = vscode.commands.registerCommand('extension.runEnv', (uri) => __awaiter(this, void 0, void 0, function* () {
        if (uri) {
            var selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 22));
            var document = yield vscode.workspace.openTextDocument(uri);
            var editor = yield vscode.window.showTextDocument(document);
            yield runSelectedEnv_1.default(editor, selection);
        }
        else {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const selectionEnv = editor.selection;
            yield runSelectedEnv_1.default(editor, selectionEnv);
        }
    }));
    const MakeComponentReact = vscode.commands.registerCommand('extension.makeComponentReact', () => __awaiter(this, void 0, void 0, function* () {
        var input = yield vscode.window.showInputBox({
            prompt: "Component Name: ",
            placeHolder: "Input your component name here.."
        });
        var editor = vscode.window.activeTextEditor;
        if (!editor || !input) {
            return;
        }
        yield makeComponentReact_1.default(editor, input);
    }));
    const MakeComponentVue = vscode.commands.registerCommand('extension.makeComponentVue', () => __awaiter(this, void 0, void 0, function* () {
        var input = yield vscode.window.showInputBox({
            prompt: "Component Name: ",
            placeHolder: "Input your component name here.."
        });
        var editor = vscode.window.activeTextEditor;
        if (!editor || !input) {
            return;
        }
        yield makeComponentVue_1.default(editor, input);
    }));
    context.subscriptions.push(disposable);
    context.subscriptions.push(runCodeByBlock);
    context.subscriptions.push(runEnvCode);
    context.subscriptions.push(installDependencies);
    context.subscriptions.push(deleteLogStatements);
    context.subscriptions.push(addLogStatements);
    context.subscriptions.push(commentLogStatements);
    context.subscriptions.push(uncommentLogStatements);
    context.subscriptions.push(MakeComponentReact);
    context.subscriptions.push(MakeComponentVue);
    context.subscriptions.push(deleteLogStatementsGlobal);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
//# sourceMappingURL=extension.js.map