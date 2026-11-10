// @ts-nocheck
const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

function activate(context) {
    const outputChannel = vscode.window.createOutputChannel('CodeScale AI');

    let analyzeCommand = vscode.commands.registerCommand('codescale-ai.analyze', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No file open. Please open a Python file first.');
            return;
        }

        const sourceCode = editor.document.getText();
        const analyzerPath = path.join(context.extensionPath, '..', 'analyzer');

        outputChannel.show();
        outputChannel.appendLine('🔍 Analysing code...');

        const python = spawn('uv', ['run', 'python', 'cli.py'], {
            cwd: analyzerPath
        });

        python.stdin.write(sourceCode);
        python.stdin.end();

        let output = '';
        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            outputChannel.appendLine('Error: ' + data.toString());
        });

        python.on('close', () => {
            try {
                const result = JSON.parse(output);
                outputChannel.appendLine('✅ Analysis complete!\n');
                result.findings.forEach(f => {
                    if (f.line) {
                        outputChannel.appendLine(`[${f.type.toUpperCase()}] Line ${f.line}: ${f.message}`);
                    } else {
                        outputChannel.appendLine(`[${f.type.toUpperCase()}] ${f.message}`);
                    }
                });
            } catch (e) {
                outputChannel.appendLine('Could not parse results: ' + output);
            }
        });
    });

    context.subscriptions.push(analyzeCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };