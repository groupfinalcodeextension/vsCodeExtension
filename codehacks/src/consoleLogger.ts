import * as vscode from "vscode";
async function consoleLogger(editor: vscode.TextEditor, selection: vscode.Selection) {
    if (!editor) {
        return;
    }
    
    var text = editor.document.getText(selection);
   
    const cursor = selection.start;
    const line = selection.active.line;
    const range = editor.document.getWordRangeAtPosition(cursor);
    var regex = /(var|let|const)/;
    if(regex.test(text)) {
        var temp = text.split(" ");
        text = temp[1];
    }
    if (!range) {
        return;
    }

    
    var lastLine = new vscode.Position(range.end.line+1, 0);
    var nextLine = editor.document.getWordRangeAtPosition(lastLine);
    
    if(!nextLine) {
        editor.edit(edit =>{
            edit.insert(new vscode.Position(range.end.line+1, 0), `\nconsole.log(${text}, 'ini ${text}')`);
        }).then(() =>{
            return;
        });
    }
   
    editor.edit(edit =>{
        edit.insert(new vscode.Position(range.end.line+1, 0), `console.log(${text}, 'ini ${text}') \n`);
    });
}

export default consoleLogger;