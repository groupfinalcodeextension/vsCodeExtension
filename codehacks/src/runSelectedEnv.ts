import * as vscode from "vscode";
const fs = require("fs");
const { join, dirname } = require("path");

function rangeBlock(editor: vscode.TextEditor) {
    if (!editor) {
        return;
    }
    const selection = editor.selection;
    const range = new vscode.Range(selection.start, selection.end);
    
    return range;
}


async function runSelectedCode(editor: vscode.TextEditor, selection: vscode.Selection) {

    const document = editor.document;
    let selectedText = editor.document.getText(rangeBlock(editor));

    // console.log(document.fileName,"disini");
    let fileName = document.fileName;
    let packageJson = dirname(fileName);
    let flag = false;
    while (flag === false) {
        try {
            fs.accessSync(join(packageJson, 'package.json'), fs.constants.R_OK | fs.constants.W_OK);
            flag = true;
            
        } catch (err) {
            packageJson = dirname(packageJson);
         
        }
    }
    if (flag === true) {
        try {

            fs.accessSync(join(packageJson, '.env'), fs.constants.R_OK | fs.constants.W_OK);
            let uri = vscode.Uri.file(join(packageJson, '.env'));
          
            let document = await vscode.workspace.openTextDocument(uri);
            let documentText = document.getText();
            let dataEnv = documentText.split('\n');
            let dataEnvTrue = true;
            dataEnv.forEach(element => {
                if (element.split('=')[0] === selectedText) {
                    dataEnvTrue = false;
                    return;
                }
            });
            
            if (dataEnvTrue === true) {
                console.log('disini ni');
                var masuk = await vscode.window.showInputBox({
                    prompt: `.env ${selectedText}: `,
                    placeHolder: "Input here.."
                });
                dataEnv.push(`${selectedText}=${masuk}`);
                let stringEnv = dataEnv.join('\n');
                let newData = join(packageJson, '.env');
                fs.writeFile(newData, stringEnv, (err: object) => {
                    if (err) {
                        console.log(err);
                    }
               
    
                });
            }
           

        } catch (err) {
            let codeFile = join(packageJson, '.env');
       

            var input = await vscode.window.showInputBox({
                prompt: `.env ${selectedText}: `,
                placeHolder: "Input here.."
            });
            fs.writeFile(codeFile, `${selectedText}=${input}`, (err: object) => {
                if (err) {
                    console.log(err);
                }
           

            });
           

            // console.error('no access .env!');
        }
    }


}

export default runSelectedCode;