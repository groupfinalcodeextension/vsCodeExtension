const vscode = require("vscode");

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


export default rangeBlock;


