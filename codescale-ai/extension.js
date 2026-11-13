// @ts-nocheck
const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

const diagnosticCollection = vscode.languages.createDiagnosticCollection('codescale-ai');

function getWebviewContent(findings) {
    const rows = findings.map(f => {
        const color = f.type === 'warning' ? '#f0ad4e' : '#5bc0de';
        const icon = f.type === 'warning' ? '⚠️' : 'ℹ️';
        const line = f.line ? `Line ${f.line}` : '';
        return `
            <div class="finding" style="border-left: 4px solid ${color}; padding: 10px; margin: 10px 0; background: #1e1e1e; border-radius: 4px;">
                <span style="color: ${color}">${icon} ${f.type.toUpperCase()}</span>
                ${line ? `<span style="color: #888; margin-left: 10px;">${line}</span>` : ''}
                <p style="margin: 5px 0 0 0; color: #d4d4d4;">${f.message}</p>
            </div>
        `;
    }).join('');

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                padding: 20px;
                background: #252526;
                color: #d4d4d4;
            }
            h1 { color: #569cd6; font-size: 1.4em; }
            h2 { color: #9cdcfe; font-size: 1.1em; margin-top: 20px; }
            .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.8em;
                margin-left: 10px;
            }
        </style>
    </head>
    <body>
        <h1>🔍 CodeScale AI Analysis</h1>
        <h2>Findings <span class="badge" style="background:#333">${findings.length}</span></h2>
        ${rows || '<p style="color:#888">No issues found!</p>'}
    </body>
    </html>`;
}

function activate(context) {
    const outputChannel = vscode.window.createOutputChannel('CodeScale AI');
    let panel = null;

    let analyzeCommand = vscode.commands.registerCommand('codescale-ai.analyze', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No file open. Please open a Python file first.');
            return;
        }

        const sourceCode = editor.document.getText();
        const analyzerPath = path.join(context.extensionPath, '..', 'analyzer');

        if (!panel) {
            panel = vscode.window.createWebviewPanel(
                'codescaleAI',
                'CodeScale AI',
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );
            panel.onDidDispose(() => { panel = null; });
        }

        panel.webview.html = getWebviewContent([{ type: 'info', message: 'Analysing code...' }]);

        const python = spawn('uv', ['run', 'python', 'cli.py'], {
            cwd: analyzerPath
        });

        python.stdin.write(sourceCode);
        python.stdin.end();

        let output = '';
        python.stdout.on('data', (data) => { output += data.toString(); });
        python.stderr.on('data', (data) => {
            outputChannel.appendLine('Error: ' + data.toString());
        });

        python.on('close', () => {
            try {
                const result = JSON.parse(output);
                const diagnostics = [];

                result.findings.forEach(f => {
                    if (f.line) {
                        const line = f.line - 1;
                        const range = new vscode.Range(line, 0, line, 1000);
                        const severity = f.type === 'warning'
                            ? vscode.DiagnosticSeverity.Warning
                            : vscode.DiagnosticSeverity.Information;
                        const diagnostic = new vscode.Diagnostic(range, f.message, severity);
                        diagnostic.source = 'CodeScale AI';
                        diagnostics.push(diagnostic);
                    }
                });

                diagnosticCollection.set(editor.document.uri, diagnostics);
                panel.webview.html = getWebviewContent(result.findings);

            } catch (e) {
                outputChannel.appendLine('Could not parse results: ' + output);
            }
        });
    });

    context.subscriptions.push(analyzeCommand);
    context.subscriptions.push(diagnosticCollection);
}

function deactivate() {
    diagnosticCollection.clear();
}

module.exports = { activate, deactivate };