import { getVSCodeDownloadUrl } from "vscode-test/out/util";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const { exec, execFile } = require("child_process");
const path = require("path");
import consoleLogger from "./consoleLogger";
import InstallDependencies from "./installDependencies";
import runSelectedCode from "./runSelectedCode";
import makeComponent from "./makeComponent"
import { stringify } from "querystring";
import { isWorker } from "cluster";
// var consoleLogger = require("./consoleLogger")
const fs = require('fs');
const { basename, dirname, extname, join } = require('path');
// import rangeBlock from '../src/codeRunner';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function getAllLogStatements(document: vscode.TextDocument, documentText: string) {
    let logStatements = [];
    // console.log(documentText, "afguiagfiaegf")
    // console.log(typeof documentText);
    const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
    let match;
    while (match = logRegex.exec(documentText)) {
        console.log(document, "didalem")
        // console.log(typeof document);
        // console.log(typeof documentText);
        let matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));

        console.log(matchRange, "didalem laig range")
        if (!matchRange.isEmpty) {
            logStatements.push(matchRange);
            console.log(logStatements, "diloopingan")
        }
    }
    console.log(logStatements, "dsioaasifjip")
    return logStatements;
}

function getAllCommentLogStatements(document: vscode.TextDocument, documentText: string) {
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

function deleteFoundLogStatements(workspace: vscode.WorkspaceEdit, docUri: vscode.Uri, logs: Array<vscode.Range>, document: vscode.TextDocument | null) {
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
    } else {

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

function commentFoundStatements(workspace: vscode.WorkspaceEdit, docUri: vscode.Uri, logs: Array<vscode.Range>, document: vscode.TextDocument | null) {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA")
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
    } else {
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
                console.log("SELESAI")
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
    } else {
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

function deleteFile(file: String) {
    if (file) {
        fs.unlinkSync(file);
    } else {
        console.log('gagal');
    }
}


function activate(context: vscode.ExtensionContext) {
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


            console.log(logStatements, "shfehfoehfoehfea")
            let workSpaceEdit = new vscode.WorkspaceEdit();
            await deleteFoundLogStatements(workSpaceEdit, document.uri, logStatements, document);
        }
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
            console.log(document, "disnii afbjagfyagfiagfuagiaifgda")
            const logStatements = getAllLogStatements(document, documentText);
            let workSpaceEdit = new vscode.WorkspaceEdit();
            commentFoundStatements(workSpaceEdit, document.uri, logStatements, null);
        } else {
            // console.log(documentText, document, "disnii")
            let document = await vscode.workspace.openTextDocument(uri);
            let documentText = document.getText();
            let logStatements = await getAllLogStatements(document, documentText);


            console.log(logStatements, "shfehfoehfoehfea")
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
            console.log(logStatements, "shfehfoehfoehfea")
            let workSpaceEdit = new vscode.WorkspaceEdit();
            await uncommentFoundStatements(workSpaceEdit, document.uri, logStatements, document);

        }
    });

    const addLogStatements = vscode.commands.registerCommand('extension.addLogStatements', async (uri: vscode.Uri) => {
        if (uri) {
            var selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 22))
            var document = await vscode.workspace.openTextDocument(uri)
            // console.log(editorTest.getText(), "GELLOLOLO")
            var editorTest = await vscode.window.showTextDocument(document)
            await consoleLogger(editorTest, selection)
        } else {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const selection = editor.selection
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

    const MakeComponent = vscode.commands.registerCommand('extension.makeComponent', async() =>{
        
        var input = await vscode.window.showInputBox({
            prompt: "Component Name: ",
            placeHolder: "Input your component name here.."
        })

        var editor = vscode.window.activeTextEditor;
        if(!editor || !input) {
            return;
        }
        await makeComponent(editor, input)
    })

    

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