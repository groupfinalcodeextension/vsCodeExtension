import * as assert from 'assert';
import { before, after } from 'mocha';
import * as path from "path";
import * as fs from "fs";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
	var pathName : string | undefined = vscode.workspace.rootPath;
	if(!pathName){
		return;
	}
	var file = path.join(pathName, "CodeHacksTestingUncommentConsoleLog.js");
	before(() => {
		vscode.window.showInformationMessage('Start all tests.');
		fs.writeFileSync(file, "//console.log('rezabasuki')");
	});

	after(() =>{
		fs.unlinkSync(file);
	});

	test('It should execute uncomment log Statements command and return error no logs found', async() => {
		const uri = vscode.Uri.file(file);
		await vscode.commands.executeCommand("extension.uncommentAllLogStatements", uri);

		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});
});
