// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const {exec, execFile} = require("child_process")
import consoleLogger from "./consoleLogger"
// var consoleLogger = require("./consoleLogger")
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
        await consoleLogger(editor)
    })

    const installDependencies = vscode.commands.registerCommand('extension.installDependencies', () =>{
        const editor = vscode.window.activeTextEditor

        var documentText = editor.document.getText()
        var document = editor.document
        let requireStatements = [];

        const requireRegex = /require\(.*?\)/g;
        let match;
        while (match = requireRegex.exec(documentText)) {
            // let matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
            // if (!matchRange.isEmpty) {
            //     requireStatements.push(matchRange);
            // }
            requireStatements.push(match[0])
        }

        // console.log(requireStatements)
        for(var i = 0; i < requireStatements.length; i++) {
            var regexx = /(\.)|(\/)/
            if(regexx.test(requireStatements[i])) {
                requireStatements.splice(i, 1)
                i = 0
            }
        }
        console.log(requireStatements)








        var myPath = vscode.workspace.rootPath
        console.log(myPath)
        const child = exec('ls', {cwd: myPath}, (error, stdout, stderr) => {
            if (error) {
              throw error;
            }
            // var files = stdout.split("\n")
            var regex = /(node_modules|package.json)/
            if(regex.test(stdout)){
                vscode.window.activeTerminal.sendText("ls")
            } else {
                vscode.window.showErrorMessage("ERROR JING")
            }

          });
        
    })

    context.subscriptions.push(installDependencies)
    context.subscriptions.push(disposable);
    context.subscriptions.push(deleteLogStatements);
    context.subscriptions.push(addLogStatements);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map