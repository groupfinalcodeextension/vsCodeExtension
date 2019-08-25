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
    var file = path.join(pathName, "CodeHacksTesting.js");
    mocha_1.before(() => {
        vscode.window.showInformationMessage('Start all tests.');
        fs.writeFileSync(file, "var tommy = 'very bad'");
    });
    mocha_1.after(() => {
        fs.unlinkSync(file);
    });
    test('It should execute Add Log Statements command', () => __awaiter(this, void 0, void 0, function* () {
        const uri = vscode.Uri.file(file);
        const document = yield vscode.workspace.openTextDocument(uri);
        console.log(document.getText(), "ASDASDASDASD TOMMY");
        yield setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            vscode.commands.executeCommand("extension.addLogStatements", document);
        }), 1000);
        console.log('goblok');
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    }));
});
//# sourceMappingURL=consoleLogger.test.js.map