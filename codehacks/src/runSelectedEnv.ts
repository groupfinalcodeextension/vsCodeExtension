import * as vscode from "vscode";
import { isNull } from "util";
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
    var selectedRange = rangeBlock(editor);
    if(!selectedRange) {
        return;
    }
    let selectedText = editor.document.getText(selectedRange);

    var currentFolder = dirname(document.fileName);
    
    var input = await vscode.window.showInputBox({
        prompt: "ENV Value: ",
        placeHolder: "Input your env value here.."
    });

    if(!input) {
        return;
    }
    
    var packageUris = await vscode.workspace.findFiles("**/package.json", '**/node_modules/**');
    
    var trueFolder: string | null = null;
    var foundFolder: string | null = null;
    packageUris.forEach(uri =>{
        var packageFolder: Array<string> = dirname(uri.fsPath).split("\\");
        foundFolder = packageFolder[packageFolder.length-1];
        if(currentFolder.includes(foundFolder)) {
            trueFolder = dirname(uri.fsPath);
        }
        
    });
    
    if(!trueFolder) {
        return;
    }

    var selectedLine = document.lineAt(selectedRange.start.line);
    var docVariable = selectedLine.text.split("=");
    
    docVariable[1] = ` process.env.${selectedText.toLocaleUpperCase()}`;
    var newDocVariable = docVariable.join("=");
    editor.edit(edit =>{
        edit.replace(selectedLine.range, newDocVariable);
    });
    
    var envUris = await vscode.workspace.findFiles(`${foundFolder}/.env`, '**/node_modules/**');

    setTimeout(async() =>{
        if(envUris.length > 0) {
            var envFile: vscode.Uri = envUris[0];
            var envDoc: vscode.TextEditor = await vscode.window.showTextDocument(envFile);
            var envText = envDoc.document.getText();
            var envs = envText.split("\n");
            var found: Array<string> | null = null;
            var index = 0;
            for(var i = 0; i < envs.length; i++) {
                var envVariable = envs[i].split("=");
                if(envVariable[0].toLocaleUpperCase() === selectedText.toLocaleUpperCase()) {
                    found = envVariable;
                    index = i;
                    break;
                }
            }
    
            
    
            var newEnv = join(trueFolder, ".env");
            var finalEnv;
    
            if(!found) {
                envs.push(`${selectedText.toLocaleUpperCase()}=${input}`);
                finalEnv = envs.join("\n");
                fs.writeFileSync(newEnv, finalEnv);
                return;
            }
         
            if(found.length > 0) {
                found[1] = input!;
                var newInput = found.join("=");
                envs.splice(index, 1, newInput);
                finalEnv = envs.join("\n");
                fs.writeFileSync(newEnv, finalEnv);
            }
            
        } else {
            var newEnv2 = join(trueFolder, ".env");
            fs.writeFileSync(newEnv2, `${selectedText.toLocaleUpperCase()}=${input}`);
        }

    }, 700);

    // // console.log(document.fileName,"disini");
    // let fileName = document.fileName;
    // let packageJson = dirname(fileName);
    // let flag = false;
    // while (flag === false) {
    //     try {
    //         fs.accessSync(join(packageJson, 'package.json'), fs.constants.R_OK | fs.constants.W_OK);
    //         flag = true;
            
    //     } catch (err) {
    //         packageJson = dirname(packageJson);
         
    //     }
    // }
    // if (flag === true) {
    //     try {

    //         fs.accessSync(join(packageJson, '.env'), fs.constants.R_OK | fs.constants.W_OK);
    //         let uri = vscode.Uri.file(join(packageJson, '.env'));
          
    //         let document = await vscode.workspace.openTextDocument(uri);
    //         let documentText = document.getText();
    //         let dataEnv = documentText.split('\n');
    //         console.log(dataEnv, "<<<<<<")
    //         let dataEnvTrue = true;
    //         dataEnv.forEach(element => {
    //             if (element.split('=')[0] === selectedText) {
    //                 dataEnvTrue = false;
    //                 return;
    //             }
    //         });
            
    //         if (dataEnvTrue === true) {
    //             console.log('disini ni');
    //             var masuk = await vscode.window.showInputBox({
    //                 prompt: `.env ${selectedText}: `,
    //                 placeHolder: "Input here.."
    //             });
    //             dataEnv.push(`${selectedText}=${masuk}`);
    //             let stringEnv = dataEnv.join('\n');
    //             let newData = join(packageJson, '.env');
    //             fs.writeFile(newData, stringEnv, (err: object) => {
    //                 if (err) {
    //                     console.log(err);
    //                 }
               
    
    //             });
    //         }
           

    //     } catch (err) {
    //         let codeFile = join(packageJson, '.env');
       

    //         var input = await vscode.window.showInputBox({
    //             prompt: `.env ${selectedText}: `,
    //             placeHolder: "Input here.."
    //         });
    //         fs.writeFile(codeFile, `${selectedText}=${input}`, (err: object) => {
    //             if (err) {
    //                 console.log(err);
    //             }
           

    //         });
           

    //         // console.error('no access .env!');
    //     }
    // }


}

export default runSelectedCode;