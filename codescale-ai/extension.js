// @ts-nocheck
const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

const diagnosticCollection = vscode.languages.createDiagnosticCollection('codescale-ai');

function getRobotSVG() {
    return `<svg width="170" height="210" viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bodyG" cx="38%" cy="28%" r="62%">
      <stop offset="0%" stop-color="#f8f4ee"/>
      <stop offset="100%" stop-color="#e8e0d0"/>
    </radialGradient>
    <radialGradient id="headG" cx="35%" cy="22%" r="65%">
      <stop offset="0%" stop-color="#faf7f2"/>
      <stop offset="100%" stop-color="#e5ddd0"/>
    </radialGradient>
    <filter id="soft"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#00000030"/></filter>
  </defs>
  <ellipse cx="80" cy="216" rx="38" ry="6" fill="#00000025"/>
  <ellipse cx="80" cy="170" rx="34" ry="38" fill="url(#bodyG)" filter="url(#soft)"/>
  <ellipse cx="62" cy="150" rx="10" ry="7" fill="white" opacity="0.22" transform="rotate(-15 62 150)"/>
  <ellipse cx="38" cy="168" rx="12" ry="22" fill="url(#bodyG)" transform="rotate(10 38 168)" filter="url(#soft)"/>
  <ellipse cx="36" cy="188" rx="11" ry="9" fill="#ddd5c5"/>
  <ellipse cx="122" cy="168" rx="12" ry="22" fill="url(#bodyG)" transform="rotate(-10 122 168)" filter="url(#soft)"/>
  <ellipse cx="124" cy="188" rx="11" ry="9" fill="#ddd5c5"/>
  <ellipse cx="66" cy="202" rx="14" ry="16" fill="url(#bodyG)" filter="url(#soft)"/>
  <ellipse cx="66" cy="215" rx="16" ry="7" fill="#ddd5c5"/>
  <ellipse cx="94" cy="202" rx="14" ry="16" fill="url(#bodyG)" filter="url(#soft)"/>
  <ellipse cx="94" cy="215" rx="16" ry="7" fill="#ddd5c5"/>
  <ellipse cx="80" cy="90" rx="60" ry="65" fill="url(#headG)" filter="url(#soft)"/>
  <ellipse cx="56" cy="55" rx="20" ry="13" fill="white" opacity="0.28" transform="rotate(-22 56 55)"/>
  <ellipse cx="80" cy="148" rx="48" ry="12" fill="#ddd5c8"/>
  <ellipse cx="80" cy="108" rx="38" ry="34" fill="#f2ede4" opacity="0.88"/>
  <text x="80" y="76" text-anchor="middle" font-size="10" fill="#9a9080" font-family="Georgia,serif" letter-spacing="0.5">CodeScale</text>
  <ellipse class="eye-l" cx="62" cy="106" rx="10" ry="13" fill="#111"/>
  <ellipse cx="58" cy="100" rx="3" ry="4.5" fill="white" opacity="0.7" transform="rotate(-15 58 100)"/>
  <circle cx="57" cy="99" r="1.5" fill="white" opacity="0.5"/>
  <ellipse class="eye-r" cx="98" cy="106" rx="10" ry="13" fill="#111"/>
  <ellipse cx="94" cy="100" rx="3" ry="4.5" fill="white" opacity="0.7" transform="rotate(-15 94 100)"/>
  <circle cx="93" cy="99" r="1.5" fill="white" opacity="0.5"/>
  <ellipse cx="40" cy="118" rx="12" ry="7" fill="#f4c2b0" opacity="0.45"/>
  <ellipse cx="120" cy="118" rx="12" ry="7" fill="#f4c2b0" opacity="0.45"/>
  <path d="M 68 128 Q 80 136 92 128" stroke="#b0a090" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;
}

function getWebviewContent(findings, filename, complexity) {
    const warnings = findings.filter(f => f.type === 'warning').length;
    const errors = findings.filter(f => f.type === 'error').length;

    const tools = [
        { label: 'SUGGEST TESTS', icon: '⚗️' },
        { label: 'SUGGEST DATA STRUCTURES', icon: '◈' },
        { label: 'BENCHMARK FUNCTION', icon: '⏱' },
        { label: 'ANALYZE COMPLEXITY', icon: '📊' },
        { label: 'SCAN FOR SECRETS', icon: '🔒' },
        { label: 'RUN TESTS', icon: '▷' },
        { label: 'FIND WORST-CASE INPUT', icon: '🔍' },
        { label: 'VERIFY OPTIMIZED VERSION', icon: '✓' },
        { label: 'FIND CROSSOVER', icon: '✕' },
        { label: 'OPTIMIZE WITH AI', icon: '✦' },
        { label: 'SHOW HISTORY', icon: '🕐' },
        { label: 'EXPORT REPORT', icon: '📄' },
    ];

    const toolCards = tools.map(t => `
        <div class="tool-card">
            <div class="tool-label">${t.label}</div>
            <div class="tool-icon">${t.icon}</div>
        </div>`).join('');

    const findingRows = findings.filter(f => f.message !== 'Analysing your code...').map(f => {
        const colors = {
            warning: { border: '#d4a847', bg: '#1e1a0e' },
            info: { border: '#4a9a48', bg: '#0e1a0e' },
            error: { border: '#c84848', bg: '#1e0e0e' }
        };
        const c = colors[f.type] || colors.info;
        const line = f.line ? `<span class="tag">Line ${f.line}</span>` : '';
        return `<div class="result-card" style="border-left:3px solid ${c.border};background:${c.bg}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
                <span style="color:${c.border};font-size:0.72em;font-weight:800;text-transform:uppercase;letter-spacing:1px">${f.type}</span>
                ${line}
            </div>
            <p style="color:#b0a898;font-size:0.82em;line-height:1.5">${f.message}</p>
        </div>`;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#0a0a08}
::-webkit-scrollbar-thumb{background:#333028;border-radius:2px}
body{
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  background:#0d0d0b;
  color:#c8c0b0;
  font-size:13px;
}

/* HERO */
.hero{
  background:linear-gradient(160deg,#1a1814 0%,#141210 100%);
  margin:12px;
  border-radius:20px;
  padding:28px 20px 24px;
  text-align:center;
  border:1px solid #2a2820;
  position:relative;
  overflow:hidden;
}
.hero::before{
  content:'';
  position:absolute;
  top:-40px;left:50%;
  transform:translateX(-50%);
  width:200px;height:200px;
  background:radial-gradient(circle,#2a2418 0%,transparent 70%);
  pointer-events:none;
}
.robot-wrap{
  display:inline-block;
  animation:float 3s ease-in-out infinite;
  cursor:pointer;
  filter:drop-shadow(0 16px 32px rgba(0,0,0,0.6));
  position:relative;z-index:1;
}
.robot-wrap:hover{animation:wobble 0.5s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes wobble{0%,100%{transform:rotate(-5deg) translateY(0)}50%{transform:rotate(5deg) translateY(-8px)}}
.eye-l,.eye-r{animation:blink 4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.eye-r{animation-delay:.12s}
@keyframes blink{0%,88%,100%{transform:scaleY(1)}93%{transform:scaleY(0.07)}}
.hero h1{
  font-size:1.5em;
  font-weight:900;
  color:#f0ebe0;
  letter-spacing:2px;
  margin:14px 0 8px;
  text-transform:uppercase;
}
.hero p{
  color:#6a6358;
  font-size:0.82em;
  line-height:1.6;
  margin-bottom:20px;
}
.inspect-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:48px;height:48px;
  border-radius:50%;
  background:#2a2418;
  border:2px solid #4a4030;
  cursor:pointer;
  font-size:1.4em;
  color:#f0ebe0;
  margin-bottom:8px;
  transition:all 0.2s;
}
.inspect-btn:hover{background:#3a3428;border-color:#6a5a40;transform:scale(1.08)}
.inspect-label{
  font-size:0.72em;
  letter-spacing:2px;
  color:#6a6358;
  text-transform:uppercase;
  font-weight:700;
}
.inspect-sub{
  font-size:0.7em;
  color:#3a3828;
  margin-top:4px;
}

/* SECTION */
.section{margin:0 12px 12px}
.section-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  background:#141210;
  border-radius:14px 14px 0 0;
  padding:14px 18px;
  border:1px solid #2a2820;
  border-bottom:none;
}
.section-title{
  font-weight:900;
  font-size:0.95em;
  letter-spacing:1.5px;
  text-transform:uppercase;
  color:#f0ebe0;
}
.section-body{
  background:#111008;
  border:1px solid #2a2820;
  border-radius:0 0 14px 14px;
  padding:14px;
}
.section-sub{
  background:#141210;
  border:1px solid #2a2820;
  border-bottom:none;
  padding:6px 18px;
}
.section-sub span{
  font-size:0.7em;
  color:#5a5248;
  text-transform:uppercase;
  letter-spacing:1.5px;
  font-weight:700;
}

/* STATS */
.stats-row{display:flex;gap:8px;margin-bottom:14px}
.stat{
  flex:1;
  background:#1a1814;
  border-radius:10px;
  padding:12px 8px;
  text-align:center;
  border:1px solid #2a2820;
}
.stat-num{font-size:1.8em;font-weight:900;line-height:1}
.stat-lbl{font-size:0.68em;color:#5a5248;text-transform:uppercase;letter-spacing:1px;margin-top:4px}

/* RESULT CARDS */
.result-card{padding:10px 12px;margin-bottom:8px;border-radius:8px}
.tag{background:#1a1814;color:#6a6358;padding:1px 7px;border-radius:3px;font-size:0.7em;border:1px solid #2a2820}
.complexity-badge{
  display:inline-block;
  background:#1a1814;
  border:1px solid #4a4030;
  border-radius:8px;
  padding:6px 14px;
  font-size:0.82em;
  color:#c8a848;
  margin-bottom:14px;
  letter-spacing:0.5px;
}

/* TOOLS GRID */
.tools-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
}
.tool-card{
  background:#1a1814;
  border:1px solid #2a2820;
  border-radius:12px;
  padding:16px 12px;
  cursor:pointer;
  transition:all 0.18s;
  text-align:left;
}
.tool-card:hover{
  background:#222018;
  border-color:#4a4030;
  transform:translateY(-2px);
  box-shadow:0 4px 12px rgba(0,0,0,0.4);
}
.tool-label{
  font-size:0.65em;
  font-weight:800;
  letter-spacing:1px;
  text-transform:uppercase;
  color:#c8b898;
  margin-bottom:12px;
  line-height:1.4;
}
.tool-icon{font-size:1.5em;line-height:1}

/* CHAT */
.chat-target{
  display:flex;
  align-items:center;
  gap:8px;
  margin-bottom:12px;
  flex-wrap:wrap;
}
.target-label{font-size:0.72em;color:#5a5248;text-transform:uppercase;letter-spacing:1px}
.target-badge{
  background:#1a1814;
  border:1px solid #3a3828;
  border-radius:20px;
  padding:3px 12px;
  font-size:0.75em;
  color:#c8b898;
}
.change-btn{
  background:transparent;
  border:1px solid #3a3828;
  border-radius:20px;
  padding:3px 12px;
  font-size:0.72em;
  color:#6a6358;
  cursor:pointer;
  letter-spacing:0.5px;
  font-weight:700;
  text-transform:uppercase;
}
.change-btn:hover{border-color:#5a5248;color:#9a9080}
.chat-hint{
  background:#1a1814;
  border-radius:10px;
  padding:14px;
  font-size:0.8em;
  color:#4a4838;
  text-align:center;
  margin-bottom:10px;
  line-height:1.6;
  border:1px solid #222018;
}
.chat-input{
  width:100%;
  background:#1a1814;
  border:1px solid #2a2820;
  border-radius:10px;
  padding:12px 14px;
  font-size:0.82em;
  color:#c8c0b0;
  resize:vertical;
  min-height:65px;
  margin-bottom:10px;
  font-family:inherit;
  transition:border 0.2s;
}
.chat-input:focus{outline:none;border-color:#4a4030}
.chat-input::placeholder{color:#2a2820}
.chat-actions{display:flex;gap:8px;justify-content:flex-end}
.btn-attach{
  background:transparent;
  border:1px solid #3a3828;
  border-radius:8px;
  padding:7px 16px;
  font-size:0.75em;
  color:#6a6358;
  cursor:pointer;
  font-weight:700;
  letter-spacing:0.5px;
}
.btn-attach:hover{border-color:#5a5248;color:#9a9080}
.btn-generate{
  background:#c8b080;
  border:none;
  border-radius:8px;
  padding:7px 18px;
  font-size:0.75em;
  font-weight:900;
  color:#0d0d0b;
  cursor:pointer;
  letter-spacing:1px;
  text-transform:uppercase;
  transition:all 0.18s;
}
.btn-generate:hover{background:#d8c090;transform:translateY(-1px)}

.empty-msg{color:#3a3828;text-align:center;padding:16px;font-size:0.82em}
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="robot-wrap">${getRobotSVG()}</div>
  <h1>Welcome to CodeScale</h1>
  <p>Find code that works small but breaks big.<br>Evidence first, AI second.</p>
  <div class="inspect-btn">›</div>
  <div class="inspect-label">Inspect Code</div>
  <div class="inspect-sub">Tap the arrow to analyze the target Python file.</div>
</div>

<!-- ANALYSIS RESULTS -->
<div class="section">
  <div class="section-header">
    <div class="section-title">Analysis Results</div>
    <span style="color:#3a3828;font-size:1.3em">⌄</span>
  </div>
  <div class="section-body">
    <div class="stats-row">
      <div class="stat">
        <div class="stat-num" style="color:#c84848">${errors}</div>
        <div class="stat-lbl">Errors</div>
      </div>
      <div class="stat">
        <div class="stat-num" style="color:#d4a847">${warnings}</div>
        <div class="stat-lbl">Warnings</div>
      </div>
      <div class="stat">
        <div class="stat-num" style="color:#c8c0b0">${findings.length}</div>
        <div class="stat-lbl">Total</div>
      </div>
    </div>
    ${complexity && complexity !== '...' ? `<div class="complexity-badge">⏱ Complexity: ${complexity}</div>` : ''}
    ${findingRows || '<div class="empty-msg">No issues detected.</div>'}
  </div>
</div>

<!-- CHOOSE A TOOL -->
<div class="section">
  <div class="section-header">
    <div class="section-title">Choose a Tool</div>
    <span style="color:#3a3828;font-size:1.3em">⌄</span>
  </div>
  <div class="section-sub"><span>Analyse</span></div>
  <div class="section-body" style="border-top:none;border-radius:0 0 14px 14px">
    <div class="tools-grid">${toolCards}</div>
  </div>
</div>

<!-- CHAT -->
<div class="section">
  <div class="section-header">
    <div class="section-title">Chat with CodeScale</div>
    <span style="color:#3a3828;font-size:1.3em">⌄</span>
  </div>
  <div class="section-body">
    <div class="chat-target">
      <span class="target-label">Target:</span>
      <span class="target-badge">${filename || 'No target selected'}</span>
      <button class="change-btn">Change target</button>
    </div>
    <div class="chat-hint">Ask me to create files, edit code, or clean a CSV dataset.</div>
    <textarea class="chat-input" placeholder="Describe what you want CodeScale AI to do..."></textarea>
    <div class="chat-actions">
      <button class="btn-attach">+ Attach</button>
      <button class="btn-generate">Generate</button>
    </div>
  </div>
</div>

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
                'codescaleAI', 'CodeScale AI',
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );
            panel.onDidDispose(() => { panel = null; });
        }

        panel.webview.html = getWebviewContent([{ type: 'info', message: 'Analysing your code...' }], filename, '...');

        const python = spawn('uv', ['run', 'python', 'cli.py'], { cwd: analyzerPath });
        python.stdin.write(sourceCode);
        python.stdin.end();

        let output = '';
        python.stdout.on('data', (data) => { output += data.toString(); });
        python.stderr.on('data', (data) => { outputChannel.appendLine('Error: ' + data.toString()); });

        python.on('close', () => {
            try {
                const result = JSON.parse(output);
                const diagnostics = [];
                result.findings.forEach(f => {
                    if (f.line) {
                        const line = f.line - 1;
                        const range = new vscode.Range(line, 0, line, 1000);
                        const severity = f.type === 'warning' ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information;
                        const diagnostic = new vscode.Diagnostic(range, f.message, severity);
                        diagnostic.source = 'CodeScale AI';
                        diagnostics.push(diagnostic);
                    }
                });
                diagnosticCollection.set(editor.document.uri, diagnostics);

                const complexityPython = spawn('uv', ['run', 'python', '-c',
                    `import sys; sys.path.insert(0, '.'); from complexity import estimate_complexity; import json; print(json.dumps(estimate_complexity(sys.stdin.read())))`
                ], { cwd: analyzerPath });
                complexityPython.stdin.write(sourceCode);
                complexityPython.stdin.end();
                let complexityOutput = '';
                complexityPython.stdout.on('data', (d) => { complexityOutput += d.toString(); });
                complexityPython.on('close', () => {
                    let complexity = 'Unknown';
                    try { const cr = JSON.parse(complexityOutput); complexity = cr.complexity || 'Unknown'; } catch (e) {}
                    panel.webview.html = getWebviewContent(result.findings, filename, complexity);
                });
            } catch (e) { outputChannel.appendLine('Could not parse results: ' + output); }
        });
    });

    context.subscriptions.push(analyzeCommand);
    context.subscriptions.push(diagnosticCollection);
}

function deactivate() { diagnosticCollection.clear(); }
module.exports = { activate, deactivate };
