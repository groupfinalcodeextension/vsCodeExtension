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
	var file = path.join(pathName, "CodeHacksTestingDeleteConsoleLog.js");
	before(() => {
		vscode.window.showInformationMessage('Start all tests.');
		fs.writeFileSync(file, "console.log('rezabasuki')");
	});

	after(() =>{
		fs.unlinkSync(file);
		// console.log("ASD");
		// console.log("ASDWOWQEOQWIO");
	});

	test('It should execute run code selected Statements command', async() => {
		const uri = vscode.Uri.file(file);
		await vscode.commands.executeCommand("extension.runCode", uri);

		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});
});
