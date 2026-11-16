// @ts-nocheck
const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

const diagnosticCollection = vscode.languages.createDiagnosticCollection('codescale-ai');

function getRobotSVG() {
    return `<svg width="160" height="200" viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bodyG" cx="38%" cy="28%" r="62%">
      <stop offset="0%" stop-color="#f8f4ee"/>
      <stop offset="100%" stop-color="#e8e0d0"/>
    </radialGradient>
    <radialGradient id="headG" cx="35%" cy="22%" r="65%">
      <stop offset="0%" stop-color="#faf7f2"/>
      <stop offset="100%" stop-color="#e5ddd0"/>
    </radialGradient>
    <radialGradient id="eyeG" cx="28%" cy="22%" r="72%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#080808"/>
    </radialGradient>
    <filter id="soft"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#00000018"/></filter>
  </defs>
  <!-- Shadow -->
  <ellipse cx="80" cy="216" rx="38" ry="6" fill="#00000012"/>
  <!-- Body -->
  <ellipse cx="80" cy="170" rx="34" ry="38" fill="url(#bodyG)" filter="url(#soft)"/>
  <ellipse cx="62" cy="150" rx="10" ry="7" fill="white" opacity="0.22" transform="rotate(-15 62 150)"/>
  <!-- Arms -->
  <ellipse cx="38" cy="168" rx="12" ry="22" fill="url(#bodyG)" transform="rotate(10 38 168)" filter="url(#soft)"/>
  <ellipse cx="36" cy="188" rx="11" ry="9" fill="#ddd5c5"/>
  <ellipse cx="122" cy="168" rx="12" ry="22" fill="url(#bodyG)" transform="rotate(-10 122 168)" filter="url(#soft)"/>
  <ellipse cx="124" cy="188" rx="11" ry="9" fill="#ddd5c5"/>
  <!-- Legs -->
  <ellipse cx="66" cy="202" rx="14" ry="16" fill="url(#bodyG)" filter="url(#soft)"/>
  <ellipse cx="66" cy="215" rx="16" ry="7" fill="#ddd5c5"/>
  <ellipse cx="94" cy="202" rx="14" ry="16" fill="url(#bodyG)" filter="url(#soft)"/>
  <ellipse cx="94" cy="215" rx="16" ry="7" fill="#ddd5c5"/>
  <!-- BIG DOME HEAD -->
  <ellipse cx="80" cy="90" rx="60" ry="65" fill="url(#headG)" filter="url(#soft)"/>
  <ellipse cx="56" cy="55" rx="20" ry="13" fill="white" opacity="0.28" transform="rotate(-22 56 55)"/>
  <!-- Head rim -->
  <ellipse cx="80" cy="148" rx="48" ry="12" fill="#ddd5c8"/>
  <!-- Face panel -->
  <ellipse cx="80" cy="108" rx="38" ry="34" fill="#f2ede4" opacity="0.88"/>
  <!-- CodeScale text -->
  <text x="80" y="76" text-anchor="middle" font-size="10" fill="#9a9080" font-family="Georgia,serif" letter-spacing="0.5">CodeScale</text>
  <!-- Eyes -->
  <ellipse class="eye-l" cx="62" cy="106" rx="10" ry="13" fill="url(#eyeG)"/>
  <ellipse cx="58" cy="100" rx="3" ry="4.5" fill="white" opacity="0.7" transform="rotate(-15 58 100)"/>
  <circle cx="57" cy="99" r="1.5" fill="white" opacity="0.5"/>
  <ellipse class="eye-r" cx="98" cy="106" rx="10" ry="13" fill="url(#eyeG)"/>
  <ellipse cx="94" cy="100" rx="3" ry="4.5" fill="white" opacity="0.7" transform="rotate(-15 94 100)"/>
  <circle cx="93" cy="99" r="1.5" fill="white" opacity="0.5"/>
  <!-- Blush -->
  <ellipse cx="40" cy="118" rx="12" ry="7" fill="#f4c2b0" opacity="0.4"/>
  <ellipse cx="120" cy="118" rx="12" ry="7" fill="#f4c2b0" opacity="0.4"/>
  <!-- Mouth -->
  <path d="M 68 128 Q 80 135 92 128" stroke="#b0a090" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;
}

function getWebviewContent(findings, filename, complexity, state) {
    const warnings = findings.filter(f => f.type === 'warning').length;
    const errors = findings.filter(f => f.type === 'error').length;

    const tools = [
        { id: 'suggest_tests', label: 'SUGGEST TESTS', icon: '⚗️' },
        { id: 'suggest_ds', label: 'SUGGEST DATA STRUCTURES', icon: '◈' },
        { id: 'benchmark', label: 'BENCHMARK FUNCTION', icon: '⏱' },
        { id: 'complexity', label: 'ANALYZE COMPLEXITY', icon: '📊' },
        { id: 'secrets', label: 'SCAN FOR SECRETS', icon: '🔒' },
        { id: 'run_tests', label: 'RUN TESTS', icon: '▷' },
        { id: 'worst_case', label: 'FIND WORST-CASE INPUT', icon: '🔍' },
        { id: 'verify', label: 'VERIFY OPTIMIZED VERSION', icon: '✓' },
        { id: 'crossover', label: 'FIND CROSSOVER', icon: '✕' },
        { id: 'optimize', label: 'OPTIMIZE WITH AI', icon: '✦' },
        { id: 'history', label: 'SHOW HISTORY', icon: '🕐' },
        { id: 'export', label: 'EXPORT REPORT', icon: '📄' },
    ];

    const toolCards = tools.map(t => `
        <div class="tool-card" onclick="selectTool('${t.id}')">
            <div class="tool-label">${t.label}</div>
            <div class="tool-icon">${t.icon}</div>
        </div>`).join('');

    const findingRows = findings.map(f => {
        const colors = {
            warning: { border: '#c8b89a', bg: '#2a2520' },
            info: { border: '#8aaa88', bg: '#1e2420' },
            error: { border: '#c88a8a', bg: '#2a1e1e' }
        };
        const c = colors[f.type] || colors.info;
        const line = f.line ? `<span class="tag">Line ${f.line}</span>` : '';
        return `<div class="result-card" style="border-left:3px solid ${c.border};background:${c.bg}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
                <span style="color:${c.border};font-size:0.75em;font-weight:bold;text-transform:uppercase">${f.type}</span>
                ${line}
            </div>
            <p style="color:#ccc;font-size:0.85em;line-height:1.5">${f.message}</p>
        </div>`;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  background:#1a1a18;
  color:#d4cfc5;
  font-size:13px;
  min-height:100vh;
}
/* HERO */
.hero{
  background:#2a2820;
  border-radius:16px;
  margin:16px;
  padding:24px 20px 20px;
  text-align:center;
  border:1px solid #3a3830;
}
.robot-wrap{
  display:inline-block;
  animation:float 3s ease-in-out infinite;
  cursor:pointer;
  filter:drop-shadow(0 12px 24px rgba(0,0,0,0.5));
}
.robot-wrap:hover{animation:wobble 0.5s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes wobble{0%,100%{transform:rotate(-5deg) translateY(0)}50%{transform:rotate(5deg) translateY(-6px)}}
.eye-l,.eye-r{animation:blink 4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.eye-r{animation-delay:.15s}
@keyframes blink{0%,88%,100%{transform:scaleY(1)}93%{transform:scaleY(0.07)}}
.hero h1{
  font-size:1.4em;
  font-weight:900;
  color:#f0ebe0;
  letter-spacing:1px;
  margin:12px 0 6px;
  text-transform:uppercase;
}
.hero p{
  color:#8a8578;
  font-size:0.82em;
  line-height:1.5;
  margin-bottom:16px;
}
.inspect-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:44px;height:44px;
  border-radius:50%;
  background:#3a3830;
  border:2px solid #5a5848;
  cursor:pointer;
  font-size:1.2em;
  color:#f0ebe0;
  margin-bottom:8px;
  transition:all 0.2s;
}
.inspect-btn:hover{background:#4a4838;transform:scale(1.05)}
.inspect-label{
  font-size:0.7em;
  letter-spacing:1.5px;
  color:#8a8578;
  text-transform:uppercase;
}
/* RESULTS */
.results-section{margin:0 16px 16px;display:${findings.length > 0 && findings[0].message !== 'Analysing your code...' ? 'block' : 'none'}}
.section-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  background:#2a2820;
  border-radius:12px 12px 0 0;
  padding:14px 16px;
  border:1px solid #3a3830;
  border-bottom:none;
}
.section-title{
  font-weight:900;
  font-size:1em;
  letter-spacing:1px;
  text-transform:uppercase;
  color:#f0ebe0;
}
.section-body{
  background:#222018;
  border:1px solid #3a3830;
  border-radius:0 0 12px 12px;
  padding:12px;
}
.stats-row{display:flex;gap:8px;margin-bottom:12px}
.stat{flex:1;background:#2a2820;border-radius:8px;padding:10px;text-align:center;border:1px solid #3a3830}
.stat-num{font-size:1.6em;font-weight:900}
.stat-lbl{font-size:0.7em;color:#8a8578;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px}
.result-card{padding:10px;margin-bottom:8px;border-radius:6px}
.tag{background:#333028;color:#8a8578;padding:1px 6px;border-radius:3px;font-size:0.72em}
.complexity-badge{
  display:inline-block;
  background:#2a2820;
  border:1px solid #5a5848;
  border-radius:6px;
  padding:6px 12px;
  font-size:0.85em;
  color:#c8b89a;
  margin-bottom:12px;
}
/* TOOLS */
.tools-section{margin:0 16px 16px}
.tools-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  background:#222018;
  border:1px solid #3a3830;
  border-radius:0 0 12px 12px;
  padding:12px;
}
.tool-card{
  background:#2a2820;
  border:1px solid #3a3830;
  border-radius:10px;
  padding:14px 10px;
  cursor:pointer;
  transition:all 0.2s;
  text-align:left;
}
.tool-card:hover{background:#333028;border-color:#5a5848;transform:translateY(-1px)}
.tool-label{
  font-size:0.68em;
  font-weight:700;
  letter-spacing:0.8px;
  text-transform:uppercase;
  color:#c8b89a;
  margin-bottom:10px;
  line-height:1.3;
}
.tool-icon{font-size:1.4em}
/* CHAT */
.chat-section{margin:0 16px 16px}
.chat-body{
  background:#222018;
  border:1px solid #3a3830;
  border-radius:0 0 12px 12px;
  padding:14px;
}
.chat-target{
  display:inline-flex;
  align-items:center;
  gap:8px;
  margin-bottom:10px;
}
.target-badge{
  background:#3a3830;
  border:1px solid #5a5848;
  border-radius:20px;
  padding:3px 10px;
  font-size:0.75em;
  color:#c8b89a;
}
.change-btn{
  background:transparent;
  border:1px solid #5a5848;
  border-radius:20px;
  padding:3px 10px;
  font-size:0.75em;
  color:#8a8578;
  cursor:pointer;
}
.chat-hint{
  background:#2a2820;
  border-radius:8px;
  padding:12px;
  font-size:0.8em;
  color:#6a6558;
  text-align:center;
  margin-bottom:10px;
  line-height:1.5;
}
.chat-input{
  width:100%;
  background:#2a2820;
  border:1px solid #3a3830;
  border-radius:8px;
  padding:10px 12px;
  font-size:0.82em;
  color:#d4cfc5;
  resize:vertical;
  min-height:60px;
  margin-bottom:10px;
  font-family:inherit;
}
.chat-input:focus{outline:none;border-color:#5a5848}
.chat-input::placeholder{color:#4a4838}
.chat-actions{display:flex;gap:8px;justify-content:flex-end}
.btn-attach{
  background:transparent;
  border:1px solid #5a5848;
  border-radius:6px;
  padding:6px 14px;
  font-size:0.78em;
  color:#8a8578;
  cursor:pointer;
}
.btn-generate{
  background:#c8b89a;
  border:none;
  border-radius:6px;
  padding:6px 16px;
  font-size:0.78em;
  font-weight:700;
  color:#1a1a18;
  cursor:pointer;
  letter-spacing:0.5px;
}
.btn-generate:hover{background:#d4c8aa}
</style>
</head>
<body>

<!-- HERO SECTION -->
<div class="hero">
  <div class="robot-wrap">${getRobotSVG()}</div>
  <h1>Welcome to CodeScale</h1>
  <p>Find code that works small but breaks big.<br>Evidence first, AI second.</p>
  <div class="inspect-btn" onclick="runAnalysis()">›</div>
  <div class="inspect-label">Inspect Code</div>
  <div style="font-size:0.72em;color:#5a5848;margin-top:4px">Tap the arrow to analyze the target Python file.</div>
</div>

<!-- RESULTS SECTION -->
<div class="results-section" id="results">
  <div class="section-header">
    <div class="section-title">Analysis Results</div>
    <span style="color:#8a8578;font-size:1.2em">⌄</span>
  </div>
  <div class="section-body">
    <div class="stats-row">
      <div class="stat">
        <div class="stat-num" style="color:#c88a8a">${errors}</div>
        <div class="stat-lbl">Errors</div>
      </div>
      <div class="stat">
        <div class="stat-num" style="color:#c8b89a">${warnings}</div>
        <div class="stat-lbl">Warnings</div>
      </div>
      <div class="stat">
        <div class="stat-num" style="color:#8aaa88">${findings.length}</div>
        <div class="stat-lbl">Total</div>
      </div>
    </div>
    ${complexity && complexity !== '...' ? `<div class="complexity-badge">⏱ Complexity: ${complexity}</div>` : ''}
    ${findingRows || '<p style="color:#6a6558;text-align:center;padding:12px">No issues found!</p>'}
  </div>
</div>

<!-- CHOOSE A TOOL -->
<div class="tools-section">
  <div class="section-header">
    <div class="section-title">Choose a Tool</div>
    <span style="color:#8a8578;font-size:1.2em">⌄</span>
  </div>
  <div style="background:#222018;border:1px solid #3a3830;border-bottom:none;padding:6px 16px">
    <span style="font-size:0.72em;color:#8a8578;text-transform:uppercase;letter-spacing:1px">Analyse</span>
  </div>
  <div class="tools-grid">${toolCards}</div>
</div>

<!-- CHAT WITH CODESCALE -->
<div class="chat-section">
  <div class="section-header">
    <div class="section-title">Chat with CodeScale</div>
    <span style="color:#8a8578;font-size:1.2em">⌄</span>
  </div>
  <div class="chat-body">
    <div class="chat-target">
      <span style="font-size:0.72em;color:#8a8578">Target:</span>
      <span class="target-badge" id="target-badge">${filename || 'No target selected'}</span>
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

<script>
function runAnalysis() {
    // This just shows a message since analysis runs from command palette
    document.getElementById('results').style.display = 'block';
}
function selectTool(id) {
    console.log('Tool selected:', id);
}
</script>
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
