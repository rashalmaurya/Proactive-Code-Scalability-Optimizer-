// @ts-nocheck
const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

const diagnosticCollection = vscode.languages.createDiagnosticCollection('codescale-ai');

function getWebviewContent(findings, filename) {
    const warnings = findings.filter(f => f.type === 'warning').length;
    const infos = findings.filter(f => f.type === 'info').length;
    const errors = findings.filter(f => f.type === 'error').length;

    const rows = findings.map(f => {
        const colors = {
            warning: { border: '#f0ad4e', bg: '#2d2a1e', icon: '⚠️' },
            info: { border: '#5bc0de', bg: '#1a2530', icon: 'ℹ️' },
            error: { border: '#d9534f', bg: '#2d1e1e', icon: '❌' }
        };
        const c = colors[f.type] || colors.info;
        const line = f.line ? `<span class="line-badge">Line ${f.line}</span>` : '';

        return `
        <div class="finding" style="border-left: 4px solid ${c.border}; background: ${c.bg};">
            <div class="finding-header">
                <span class="type-badge" style="color: ${c.border}">${c.icon} ${f.type.toUpperCase()}</span>
                ${line}
            </div>
            <p class="finding-message">${f.message}</p>
        </div>`;
    }).join('');

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                padding: 20px;
                background: #1e1e1e;
                color: #d4d4d4;
                font-size: 13px;
            }
            .header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #333;
            }
            .header h1 {
                color: #569cd6;
                font-size: 1.3em;
            }
            .filename {
                color: #888;
                font-size: 0.85em;
                margin-top: 2px;
            }
            .stats {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            .stat-card {
                flex: 1;
                padding: 12px;
                border-radius: 6px;
                text-align: center;
            }
            .stat-number {
                font-size: 1.8em;
                font-weight: bold;
            }
            .stat-label {
                font-size: 0.75em;
                opacity: 0.8;
                margin-top: 2px;
            }
            .section-title {
                color: #9cdcfe;
                font-size: 0.9em;
                font-weight: bold;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .finding {
                padding: 12px;
                margin-bottom: 10px;
                border-radius: 4px;
            }
            .finding-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
            }
            .type-badge {
                font-size: 0.8em;
                font-weight: bold;
            }
            .line-badge {
                background: #333;
                color: #888;
                padding: 1px 6px;
                border-radius: 3px;
                font-size: 0.75em;
            }
            .finding-message {
                color: #ccc;
                line-height: 1.5;
            }
            .empty {
                text-align: center;
                padding: 30px;
                color: #4ec9b0;
            }
            .footer {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #333;
                color: #555;
                font-size: 0.75em;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <h1>🔍 CodeScale AI</h1>
                <div class="filename">${filename || 'No file'}</div>
            </div>
        </div>

        <div class="stats">
            <div class="stat-card" style="background:#2d1e1e; border: 1px solid #d9534f33">
                <div class="stat-number" style="color:#d9534f">${errors}</div>
                <div class="stat-label">Errors</div>
            </div>
            <div class="stat-card" style="background:#2d2a1e; border: 1px solid #f0ad4e33">
                <div class="stat-number" style="color:#f0ad4e">${warnings}</div>
                <div class="stat-label">Warnings</div>
            </div>
            <div class="stat-card" style="background:#1a2530; border: 1px solid #5bc0de33">
                <div class="stat-number" style="color:#5bc0de">${infos}</div>
                <div class="stat-label">Info</div>
            </div>
        </div>

        <div class="section-title">Findings</div>
        ${rows || '<div class="empty">✅ No issues found! Your code looks clean.</div>'}

        <div class="footer">CodeScale AI — Proactive Code Scalability Optimizer</div>
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
        const filename = path.basename(editor.document.fileName);

        if (!panel) {
            panel = vscode.window.createWebviewPanel(
                'codescaleAI',
                'CodeScale AI',
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );
            panel.onDidDispose(() => { panel = null; });
        }

        panel.webview.html = getWebviewContent([{ type: 'info', message: 'Analysing your code...' }], filename);

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
                panel.webview.html = getWebviewContent(result.findings, filename);

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