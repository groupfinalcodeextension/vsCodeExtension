const vscode = require("vscode")

function InstallDependencies(editor) {
        var documentText = editor.document.getText();
        var document = editor.document;
        var requireStatements = [];
        var importStatements = [];

        const requireRegex = /require\(.*?\)/g;
        var matchRequire;
        while (matchRequire = requireRegex.exec(documentText)) {
            requireStatements.push(matchRequire[0])
        }

        const importRegex = /import .*?from (\'.*?\'|\".*?\")/g;
        var matchImport;
        while (matchImport = importRegex.exec(documentText)) {
            importStatements.push(matchImport[0]);
        }

        
        for(var i = 0; i < requireStatements.length; i++) {
            var regexx = /(\.)|(\/)/
            if(regexx.test(requireStatements[i])) {
                requireStatements.splice(i, 1)
                i = 0
            }
        }

        for(var i = 0; i < importStatements.length; i++) {
            var regexx = /(\.)|(\/)/;
            if(regexx.test(importStatements[i])) {
                importStatements.splice(i, 1);
                i = 0
            }
        }
        console.log(importStatements);
        
        var requireString = requireStatements.join(" ");
        var modulez = [];
        var regex2 = /(\'.*?\'|\".*?\")/g;
        var match2;
        while(match2 = regex2.exec(requireString)) {
            modulez.push(match2[0].replace(/[^a-zA-Z0-9\- ]/g, ""));
        }

        var importString = importStatements.join(" ");
        console.log(importString)
        var match3;
        while(match3 = regex2.exec(importString)) {
            modulez.push(match3[0].replace(/[^a-zA-Z0-9\-@\/ ]/g, ""));
        }
   
        console.log(modulez)
        var currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;

        var temp = currentlyOpenTabfilePath.split("/");
        temp.splice(temp.length-1, 1)
        var myPath = temp.join("/");

        var dependencies = modulez.join(" ")

        var terminal = null
        if(vscode.window.activeTerminal){
            terminal = vscode.window.activeTerminal
        } else {
            terminal = vscode.window.createTerminal({
                name: "CodeHacks",
                hideFromUser: false
            })
        }
        console.log(dependencies)
        if(modulez.length > 0) {
            terminal.show()
            terminal.sendText(`cd ${myPath} && npm install ${dependencies}`)
        } else {
            vscode.window.showInformationMessage("No dependencies found in current file")
        }
}

export default InstallDependencies