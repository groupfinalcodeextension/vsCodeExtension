import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"

async function makeComponent(editor: vscode.TextEditor, input: string) {
    var selection = editor.selection;
    var document = editor.document
    var selectedText = document.getText(selection); 
    var cursor = selection.start;
    var range = document.getWordRangeAtPosition(cursor);
    var documentText = document.getText();

    var importStatements = [];
    
    // INSERT IMPORT STATEMENT
    var logRegex = /import.*?from ".*?"/g;
    var match;
    while (match = logRegex.exec(documentText)) {
        let matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
        if (!matchRange.isEmpty) {
            importStatements.push(matchRange);
        }
    }

    var lastLine = importStatements[importStatements.length - 1];
    editor.edit(edit =>{
        edit.insert(lastLine.end, `\nimport ${input} from "./${input}"`);
        edit.replace(selection, `<${input} />`)
    })


    //CREATE NEW FILE
    var currentDir = document.fileName;
    var myPath = path.dirname(currentDir);
    var newComponent = path.join(myPath, `${input}.js`);
    var content = `
import React from 'react'

export default function ${input}() {
    return (
${selectedText}
    )
}
    `

    
    fs.writeFileSync(newComponent, content)
    var uri = await vscode.Uri.file(newComponent);
    var newComponentFile = await vscode.window.showTextDocument(uri)
   
    await vscode.commands.executeCommand('vscode.open', uri)
   
}

export default makeComponent