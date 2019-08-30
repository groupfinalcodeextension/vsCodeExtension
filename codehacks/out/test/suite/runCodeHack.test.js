"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const mocha_1 = require("mocha");
const path = require("path");
const fs = require("fs");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
// import * as myExtension from '../extension';
suite('Extension Test Suite', () => {
    var pathName = vscode.workspace.rootPath;
    if (!pathName) {
        return;
    }
    var file = path.join(pathName, "CodeHacksTestingDeleteConsoleLog.js");
    mocha_1.before(() => {
        vscode.window.showInformationMessage('Start all tests.');
        fs.writeFileSync(file, "console.log('rezabasuki')");
    });
    mocha_1.after(() => {
        fs.unlinkSync(file);
        // console.log("ASD");
        // console.log("ASDWOWQEOQWIO");
    });
    test('It should execute run code selected Statements command', () => __awaiter(this, void 0, void 0, function* () {
        const uri = vscode.Uri.file(file);
        yield vscode.commands.executeCommand("extension.runCode", uri);
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    }));
});
//# sourceMappingURL=runCodeHack.test.js.map