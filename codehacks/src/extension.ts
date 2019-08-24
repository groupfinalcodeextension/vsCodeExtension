import { getVSCodeDownloadUrl } from "vscode-test/out/util";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const {exec, execFile} = require("child_process");
const path = require("path");
import consoleLogger from "./consoleLogger";
import InstallDependencies from "./installDependencies"
// var consoleLogger = require("./consoleLogger")
const fs = require('fs');
const {basename,dirname,extname,join} = require('path');
// import rangeBlock from '../src/codeRunner';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function getAllLogStatements(document, documentText) {
    let logStatements = [];
    const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
    let match;
    while (match = logRegex.exec(documentText)) {
        let matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
        if (!matchRange.isEmpty) {
            logStatements.push(matchRange);
        }
    }
    return logStatements;
}

function deleteFoundLogStatements(workspace, docUri, logs) {
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
    if(!editor) {
        return ;
    }
    const selection = editor.selection;
    const range = new vscode.Range(selection.start,selection.end);
    console.log(range);
    return range;
}

function deleteFile(file:String) {
    if(file) {
        fs.unlinkSync(file);
    } else {
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
        vscode.window.showInformationMessage('Hello Welcome to CodeHacks!');
    });
    const deleteLogStatements = vscode.commands.registerCommand('extension.deleteAllLogStatements', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const documentText = editor.document.getText();
        const logStatements = getAllLogStatements(document, documentText);
        let workSpaceEdit = new vscode.WorkspaceEdit();
        deleteFoundLogStatements(workSpaceEdit, document.uri, logStatements);
    });

    const addLogStatements = vscode.commands.registerCommand('extension.addLogStatements', async() =>{
        const editor = vscode.window.activeTextEditor;
        if(!editor) {
            return;
        }
        await consoleLogger(editor);
    });

    const installDependencies = vscode.commands.registerCommand('extension.installDependencies', async() =>{
        const editor = vscode.window.activeTextEditor;
        if(!editor) {
            return;
        }
        await InstallDependencies(editor);
        
    });
    
    const runCodeByBlock = vscode.commands.registerCommand('extension.runCode', () => {
        let tmpFile = false;
        const editor = vscode.window.activeTextEditor;
        if(!editor) {
            return ;
        }
        const document = editor.document;
        let selectedText = editor.document.getText(rangeBlock());
        
        const { exec } = require('child_process');
        const ls = exec('ls');
        // console.log(document.fileName,"disini");
        let fileName = document.fileName;
        // console.log(selectedText);
        // console.log(fileName);
        let codeFile = join(dirname(fileName), 'tempFileCodeHacks.js');

        console.log(vscode.window.activeTerminal);
        let terminal = null;
        if(vscode.window.activeTerminal) {
            terminal = vscode.window.activeTerminal;
        } else {
            terminal = vscode.window.createTerminal({
                name: "CodeHacks",
                hideFromUser: false
            });
        }

        fs.writeFile(codeFile, selectedText, (err) =>{
            if(err){
                console.log(err);
            }
            terminal.show();
            terminal.sendText(`node ${codeFile}`);
            setTimeout(() => {
                fs.unlink(codeFile, (err) => {
                    if(err) {
                        console.log(err);
                    }
                    console.log('sip');
                }); 
            },700);
        });
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(runCodeByBlock);
    context.subscriptions.push(installDependencies);
    context.subscriptions.push(deleteLogStatements);
    context.subscriptions.push(addLogStatements);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map