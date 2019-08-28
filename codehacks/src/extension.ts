import { getVSCodeDownloadUrl } from "vscode-test/out/util";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const { exec, execFile } = require("child_process");
const path = require("path");
import consoleLogger from "./consoleLogger";
import InstallDependencies from "./installDependencies";
import runSelectedEnv from "./runSelectedEnv";
import runSelectedCode from "./runSelectedCode";
import makeComponentReact from "./makeComponentReact";
import makeComponentVue from "./makeComponentVue";
import { stringify } from "querystring";
import { isWorker } from "cluster";
const async = require("async");
const fs = require('fs');
const { basename, dirname, extname, join } = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function getAllLogStatements(document: vscode.TextDocument, documentText: string) {
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

function getAllCommentLogStatements(document: vscode.TextDocument, documentText: string) {
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

function deleteFoundLogStatements(workspace: vscode.WorkspaceEdit, docUri: vscode.Uri, logs: Array<vscode.Range>, document: vscode.TextDocument | null) {
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
    } else {
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

function commentFoundStatements(workspace: vscode.WorkspaceEdit, docUri: vscode.Uri, logs: Array<vscode.Range>, document: vscode.TextDocument | null) {
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
    } else {
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

function uncommentFoundStatements(workspace: vscode.WorkspaceEdit, docUri: vscode.Uri, logs: Array<vscode.Range>, document: vscode.TextDocument | null) {
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
    } else {
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

function deleteFile(file: String) {
    if (file) {
        fs.unlinkSync(file);
    } else {
        // console.log('gagal');
    }
}


function activate(context: vscode.ExtensionContext) {
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

    const deleteLogStatements = vscode.commands.registerCommand('extension.deleteAllLogStatements', async (uri: vscode.Uri) => {
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
        } else {
            // console.log(documentText, document, "disnii")
            let document = await vscode.workspace.openTextDocument(uri);
            let documentText = document.getText();
            let logStatements = await getAllLogStatements(document, documentText);


            let workSpaceEdit = new vscode.WorkspaceEdit();
            await deleteFoundLogStatements(workSpaceEdit, document.uri, logStatements, document);
        }
    });

    const deleteLogStatementsGlobal = vscode.commands.registerCommand('extension.deleteLogStatementsGlobal', () =>{
        outputChannel.clear();
        outputChannel.show();
        function delConsoleLog(fileName: vscode.Uri, callback: Function) {
            vscode.workspace.openTextDocument(fileName)
                .then((currentDoc) => {
                var currentDocText = currentDoc.getText();
                var logStatements = getAllLogStatements(currentDoc, currentDocText);
                var workSpaceEdit = new vscode.WorkspaceEdit;
                if(logStatements.length > 0) {
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
            async.forEach(filez, delConsoleLog, (error: Error) => {
                if (error) {
                    console.log(error, "ERROR ASYNC");
                }
                else {
                }
            });
        });
    });

    const commentLogStatements = vscode.commands.registerCommand('extension.commentAllLogStatements', async (uri: vscode.Uri) => {
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
        } else {
            // console.log(documentText, document, "disnii")
            let document = await vscode.workspace.openTextDocument(uri);
            let documentText = document.getText();
            let logStatements = await getAllLogStatements(document, documentText);

            let workSpaceEdit = new vscode.WorkspaceEdit();
            await commentFoundStatements(workSpaceEdit, document.uri, logStatements, document);
        }


    });
    const uncommentLogStatements = vscode.commands.registerCommand('extension.uncommentAllLogStatements', async (uri: vscode.Uri) => {
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
        } else {
            let document = await vscode.workspace.openTextDocument(uri);
            let documentText = document.getText();
            let logStatements = await getAllCommentLogStatements(document, documentText);
  
            let workSpaceEdit = new vscode.WorkspaceEdit();
            await uncommentFoundStatements(workSpaceEdit, document.uri, logStatements, document);

        }
    });

    const addLogStatements = vscode.commands.registerCommand('extension.addLogStatements', async (uri: vscode.Uri) => {
        if (uri) {
            var selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 22));
            var document = await vscode.workspace.openTextDocument(uri);

            var editorTest = await vscode.window.showTextDocument(document);
            await consoleLogger(editorTest, selection);
        } else {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const selection = editor.selection;
            await consoleLogger(editor, selection);
        }
    });

    const installDependencies = vscode.commands.registerCommand('extension.installDependencies', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        await InstallDependencies(editor);
    });

    const runCodeByBlock = vscode.commands.registerCommand('extension.runCode', async (uri: vscode.Uri) => {
        if (uri) {
            var selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 22));
            var document = await vscode.workspace.openTextDocument(uri);
            var editor = await vscode.window.showTextDocument(document);
            await runSelectedCode(editor,selection);
        } else {

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const selection = editor.selection;
            await runSelectedCode(editor,selection);
        }
    });
    const runEnvCode = vscode.commands.registerCommand('extension.runEnv', async (uri: vscode.Uri) => {
        if (uri) {
            var selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 22));
            var document = await vscode.workspace.openTextDocument(uri);
            var editor = await vscode.window.showTextDocument(document);
            await runSelectedEnv(editor,selection);
        } else {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const selectionEnv = editor.selection;
            await runSelectedEnv(editor,selectionEnv);
        }
    });

    const MakeComponentReact = vscode.commands.registerCommand('extension.makeComponentReact', async() =>{
        
        var input = await vscode.window.showInputBox({
            prompt: "Component Name: ",
            placeHolder: "Input your component name here.."
        });

        var editor = vscode.window.activeTextEditor;
        if(!editor || !input) {
            return;
        }
        await makeComponentReact(editor, input);
    });

    const MakeComponentVue = vscode.commands.registerCommand('extension.makeComponentVue', async() =>{
        
        var input = await vscode.window.showInputBox({
            prompt: "Component Name: ",
            placeHolder: "Input your component name here.."
        });

        var editor = vscode.window.activeTextEditor;
        if(!editor || !input) {
            return;
        }
        await makeComponentVue(editor, input);
    });
    

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