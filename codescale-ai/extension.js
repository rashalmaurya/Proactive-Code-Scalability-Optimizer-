// @ts-nocheck
const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

const diagnosticCollection = vscode.languages.createDiagnosticCollection('codescale-ai');

function getRobotSVG(mood) {
    mood = mood || 'happy';
    const themes = {
        happy:    { acc: '#5ee6ff', eye: '#fffbe0', bulb: '#e3c4ff' },
        thinking: { acc: '#5ee6ff', eye: '#e4f8ff', bulb: '#bfe8ff' },
        worried:  { acc: '#ffcf6e', eye: '#ffefc2', bulb: '#ffe3a8' },
        sad:      { acc: '#ff8fb0', eye: '#ffe0e8', bulb: '#ffb8c8' }
    };
    const t = themes[mood] || themes.happy;
    const acc = t.acc;
    const eyeC = t.eye;
    const ln = '#bfb1ee';
    const mirror = (s) => `<g transform="translate(394 0) scale(-1 1)">${s}</g>`;

    const leg = `
      <rect x="108" y="426" width="78" height="92" rx="28" fill="url(#limbG)" stroke="${ln}" stroke-width="1.5"/>
      <rect x="126" y="468" width="32" height="11" rx="5.5" fill="${acc}" class="led" filter="url(#glow)"/>
      <path d="M 118 486 L 176 486 L 166 508 L 128 508 Z" fill="url(#lavG)"/>
      <path d="M 112 504 Q 147 512 182 504" stroke="${ln}" stroke-width="1.5" fill="none"/>
      <path d="M 102 556 Q 98 518 134 514 L 160 514 Q 192 516 188 552 L 188 568 Q 188 580 176 580 L 114 580 Q 102 580 102 568 Z" fill="url(#bootG)" stroke="${ln}" stroke-width="1.5"/>
      <path d="M 102 562 L 188 562 L 188 568 Q 188 580 176 580 L 114 580 Q 102 580 102 568 Z" fill="url(#lavG)"/>
      <rect x="114" y="568" width="50" height="5" rx="2.5" fill="#ffe0f6" class="led" filter="url(#glow)"/>
      <ellipse cx="128" cy="532" rx="16" ry="6" fill="#fff" opacity=".6" transform="rotate(-14 128 532)"/>`;

    const earR = `
      <ellipse cx="352" cy="208" rx="29" ry="60" fill="url(#lavG)" stroke="#9a85de" stroke-width="2"/>
      <ellipse cx="350" cy="208" rx="22" ry="50" fill="#e8ecff" stroke="#c7c0f3" stroke-width="1.5"/>
      <ellipse cx="354" cy="208" rx="16" ry="38" fill="#f6c6e6" stroke="#e8a9d6" stroke-width="1.5"/>
      <ellipse cx="356" cy="208" rx="10" ry="29" fill="#eafcff" stroke="${acc}" stroke-width="4" class="led" filter="url(#glow)"/>
      <ellipse cx="356" cy="208" rx="5" ry="20" fill="${acc}" class="led" opacity=".8"/>
      <ellipse cx="338" cy="172" rx="7" ry="3.5" fill="#fff" opacity=".5" transform="rotate(-50 338 172)"/>`;

    const antenna = (bx, by, tx, ty, cls) => `
      <g class="${cls}">
        <line x1="${bx}" y1="${by}" x2="${tx}" y2="${ty}" stroke="#b7a3ea" stroke-width="8" stroke-linecap="round"/>
        <circle class="bulb" cx="${tx}" cy="${ty}" r="26" fill="${t.bulb}" filter="url(#blur10)"/>
        <circle cx="${tx}" cy="${ty}" r="22" fill="url(#sphereG)" stroke="#a68ee0" stroke-width="1.5"/>
        <ellipse cx="${tx - 7}" cy="${ty - 8}" rx="7" ry="5" fill="#fff" opacity=".7"/>
      </g>`;

    const eyeH = { happy: 54, thinking: 54, worried: 48, sad: 44 }[mood] || 54;
    const eye = (cls, cx, cy) => `
      <g class="${cls}"><g class="pupil">
        <ellipse cx="${cx}" cy="${cy}" rx="30" ry="${eyeH / 2 + 12}" fill="${eyeC}" opacity=".4" filter="url(#blur10)"/>
        <rect x="${cx - 19}" y="${cy - eyeH / 2}" width="38" height="${eyeH}" rx="19" fill="${eyeC}" filter="url(#eyeGlow)"/>
        <ellipse cx="${cx - 5}" cy="${cy - eyeH / 2 + 13}" rx="5.5" ry="8" fill="#fff" opacity=".8"/>
      </g></g>`;

    const star = (cx, cy, s, d) => `<path class="spark" style="animation-delay:${d}s" d="M ${cx} ${cy - s} Q ${cx} ${cy} ${cx + s} ${cy} Q ${cx} ${cy} ${cx} ${cy + s} Q ${cx} ${cy} ${cx - s} ${cy} Q ${cx} ${cy} ${cx} ${cy - s} Z" fill="#ffd98a"/>`;

    const g = `stroke="${eyeC}" fill="none" stroke-linecap="round" filter="url(#glow)"`;
    const mouths = {
        happy:    `<path d="M 160 232 Q 174 247 188 232" stroke-width="4.5" ${g}/>`,
        thinking: `<circle cx="174" cy="240" r="5" stroke-width="3.5" ${g}/>`,
        worried:  `<path d="M 156 240 Q 165 232 174 240 T 192 240" stroke-width="3.5" ${g}/>`,
        sad:      `<path d="M 158 246 Q 174 230 190 246" stroke-width="4.5" ${g}/>`
    };
    const brows = {
        happy: '',
        thinking: `<path d="M 214 170 Q 238 156 264 168" stroke-width="5.5" ${g}/>`,
        worried:  `<path d="M 86 182 L 140 168 M 266 178 L 212 164" stroke-width="5.5" ${g}/>`,
        sad:      `<path d="M 84 190 L 142 164 M 268 186 L 210 160" stroke-width="5.5" ${g}/>`
    };
    const extras = {
        happy: star(12, 120, 12, 0) + star(386, 130, 11, 0.6) + star(356, 66, 9, 1.1),
        thinking: `<circle class="dot" cx="338" cy="62" r="5.5" fill="#cfc3ee" style="animation-delay:0s"/>
                   <circle class="dot" cx="358" cy="62" r="5.5" fill="#cfc3ee" style="animation-delay:.25s"/>
                   <circle class="dot" cx="378" cy="62" r="5.5" fill="#cfc3ee" style="animation-delay:.5s"/>`,
        worried: `<path class="sweat" d="M 322 98 Q 338 124 322 136 Q 306 124 322 98 Z" fill="#cdeeff" stroke="#8fd0ee" stroke-width="2"/>`,
        sad: `<path class="tear" d="M 106 256 Q 118 276 106 288 Q 94 276 106 256 Z" fill="#cdeeff" stroke="#8fd0ee" stroke-width="2"/>`
    };
    const blush = { happy: 0.55, thinking: 0.4, worried: 0.3, sad: 0.2 }[mood] || 0.4;

    const armDown = `
  <ellipse cx="279" cy="354" rx="25" ry="22" fill="url(#lavG)"/>
  <g class="arm-rest">
    <rect x="272" y="362" width="58" height="76" rx="24" fill="url(#limbG)" stroke="${ln}" stroke-width="1.5" transform="rotate(-16 301 400)"/>
    <path d="M 282 376 Q 302 372 322 380" stroke="${ln}" stroke-width="1.5" fill="none"/>
    <ellipse cx="318" cy="438" rx="17" ry="16" fill="url(#lavG)"/>
    <circle cx="308" cy="451" r="5.5" fill="#a893e6"/>
    <circle cx="318" cy="454" r="5.5" fill="#a893e6"/>
    <circle cx="328" cy="450" r="5.5" fill="#a893e6"/>
  </g>
`;

    return `<svg class="robot-svg" width="200" height="295" viewBox="0 0 400 590" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="helmG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f9f6ff"/><stop offset=".42" stop-color="#e2e4fc"/>
      <stop offset=".72" stop-color="#bfd9f8"/><stop offset="1" stop-color="#cdbdf2"/>
    </linearGradient>
    <linearGradient id="visorG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b3a3ec"/><stop offset=".55" stop-color="#d3bff2"/><stop offset="1" stop-color="#f7c3dd"/>
    </linearGradient>
    <linearGradient id="bodyG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fcfaff"/><stop offset=".55" stop-color="#d8e0fb"/><stop offset="1" stop-color="#c2b4f1"/>
    </linearGradient>
    <linearGradient id="limbG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fbf9ff"/><stop offset=".6" stop-color="#d9e2fb"/><stop offset="1" stop-color="#bfb5f0"/>
    </linearGradient>
    <linearGradient id="lavG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#cdbdf5"/><stop offset="1" stop-color="#9f89e0"/>
    </linearGradient>
    <linearGradient id="bootG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fdfbff"/><stop offset=".7" stop-color="#dcdbfb"/><stop offset="1" stop-color="#c9bdf3"/>
    </linearGradient>
    <radialGradient id="sphereG" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#e9dcfd"/><stop offset=".6" stop-color="#bba2ee"/><stop offset="1" stop-color="#9a82dc"/>
    </radialGradient>
    <filter id="glow" filterUnits="userSpaceOnUse" x="-100" y="-100" width="600" height="800"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="eyeGlow" filterUnits="userSpaceOnUse" x="-100" y="-100" width="600" height="800"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="blur6" filterUnits="userSpaceOnUse" x="-100" y="-100" width="600" height="800"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur10" filterUnits="userSpaceOnUse" x="-100" y="-100" width="600" height="800"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>

  <ellipse cx="197" cy="582" rx="122" ry="9" fill="#9a82dc" opacity=".35" filter="url(#blur6)"/>

  ${leg}
  ${mirror(leg)}

  <ellipse cx="150" cy="446" rx="24" ry="14" fill="url(#lavG)"/>
  <ellipse cx="244" cy="446" rx="24" ry="14" fill="url(#lavG)"/>

  <path d="M 124 344 Q 118 330 142 328 L 252 328 Q 276 330 268 346 L 262 410 Q 258 452 230 462 L 162 462 Q 134 452 128 410 Z" fill="url(#bodyG)" stroke="${ln}" stroke-width="1.5"/>
  <path d="M 146 361 L 157 373 L 166 373 M 242 361 L 231 373 L 222 373" stroke="#b7a8ea" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g class="heart">
    <rect x="166" y="367" width="56" height="10" rx="5" fill="${acc}" filter="url(#glow)"/>
    <rect x="172" y="369" width="22" height="3" rx="1.5" fill="#fff" opacity=".7"/>
  </g>
  <path d="M 136 404 Q 196 424 258 404" stroke="${ln}" stroke-width="1.5" fill="none"/>
  <circle cx="152" cy="392" r="3" fill="#f3edfd" stroke="${ln}"/>
  <circle cx="240" cy="392" r="3" fill="#f3edfd" stroke="${ln}"/>

  <rect x="150" y="318" width="90" height="26" rx="12" fill="url(#lavG)"/>
  <path d="M 170 324 L 220 324 L 212 336 L 178 336 Z" fill="#cbbcf3"/>

  ${armDown}
  ${mirror(armDown)}

  ${antenna(106, 98, 84, 61, 'ant-l')}
  ${antenna(288, 86, 308, 43, 'ant-r')}

  <ellipse cx="30" cy="200" rx="20" ry="48" fill="url(#lavG)"/>
  <ellipse cx="26" cy="200" rx="10" ry="34" fill="#e1ecff" opacity=".8"/>

  <path d="M 24 192 C 24 114 96 68 190 68 C 284 68 354 112 354 190 C 354 262 292 320 190 320 C 90 320 24 264 24 192 Z" fill="url(#helmG)" stroke="#cdbdf0" stroke-width="2"/>
  <ellipse cx="106" cy="98" rx="11" ry="5" fill="#b7a3ea"/>
  <ellipse cx="286" cy="86" rx="11" ry="5" fill="#a68ee0"/>
  <ellipse cx="108" cy="104" rx="46" ry="14" fill="#fff" opacity=".7" transform="rotate(-24 108 104)" filter="url(#blur6)"/>

  ${earR}

  <rect x="62" y="116" width="236" height="184" rx="84" fill="#9d86d8" opacity=".28" filter="url(#blur6)" transform="translate(0 6)"/>
  <rect x="62" y="116" width="236" height="184" rx="84" fill="url(#visorG)" stroke="#eef1ff" stroke-width="10"/>
  <rect x="62" y="116" width="236" height="184" rx="84" fill="none" stroke="#e8b9e4" stroke-width="1.8" opacity=".8"/>
  <path d="M 84 150 Q 104 126 160 124 Q 122 134 102 172 Z" fill="#fff" opacity=".4"/>
  <rect x="196" y="119" width="30" height="3" rx="1.5" fill="${acc}" opacity=".7"/>

  <ellipse cx="102" cy="268" rx="22" ry="12" fill="#ff9fc4" opacity="${blush}" filter="url(#blur6)"/>
  <ellipse cx="258" cy="258" rx="22" ry="12" fill="#ff9fc4" opacity="${blush}" filter="url(#blur6)"/>
  <path d="M 90 262 L 86 272 M 98 260 L 94 270 M 262 250 L 266 260 M 270 252 L 274 262" stroke="#ffd3e8" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>

  ${eye('eye-l', 116, 222)}
  ${eye('eye-r', 236, 218)}
  ${brows[mood] || ''}
  ${mouths[mood] || mouths.happy}
  ${extras[mood] || ''}
</svg>`;
}

function getWebviewContent(findings, filename, complexity) {
    const warnings = findings.filter(f => f.type === 'warning').length;
    const errors = findings.filter(f => f.type === 'error').length;
    const isLoading = findings.length > 0 && findings.every(f => f.message === 'Analysing your code...');
    const mood = isLoading ? 'thinking' : errors > 0 ? 'sad' : warnings > 0 ? 'worried' : 'happy';

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
  animation:bob 3.2s ease-in-out infinite;
  cursor:pointer;
  filter:drop-shadow(0 14px 24px rgba(0,0,0,0.5));
  position:relative;z-index:1;
  max-width:100%;
}
.robot-svg{display:block;max-width:100%;height:auto;transform-origin:50% 97%;animation:wiggle 2.6s ease-in-out infinite}
.robot-wrap:hover .robot-svg{animation:wiggleFast 0.5s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes wiggle{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
@keyframes wiggleFast{0%,100%{transform:rotate(-5deg) scale(1.03)}50%{transform:rotate(5deg) scale(1.03)}}
.eye-l,.eye-r{animation:blink 4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.eye-r{animation-delay:.12s}
@keyframes blink{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(0.06)}}
.wave{transform-box:fill-box;transform-origin:82% 90%;animation:wave 1.3s ease-in-out infinite}
@keyframes wave{0%,100%{transform:rotate(-16deg)}50%{transform:rotate(16deg)}}
.arm-rest{transform-box:fill-box;transform-origin:50% 5%;animation:armSway 2.6s ease-in-out infinite}
@keyframes armSway{0%,100%{transform:rotate(2.5deg)}50%{transform:rotate(-2.5deg)}}
.ant-l,.ant-r{transform-box:fill-box;transform-origin:50% 100%;animation:antSway 2.2s ease-in-out infinite}
.ant-r{animation-delay:-1.1s}
@keyframes antSway{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
.bulb{animation:bulb 1.8s ease-in-out infinite}
@keyframes bulb{0%,100%{opacity:.25}50%{opacity:.65}}
.led{animation:led 2s ease-in-out infinite}
@keyframes led{0%,100%{opacity:.7}50%{opacity:1}}
.heart{transform-box:fill-box;transform-origin:center;animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
.pupil{transform-box:fill-box;transform-origin:center}
.mood-thinking .pupil{animation:look 2.4s ease-in-out infinite}
@keyframes look{0%,100%{transform:translate(8px,-8px)}35%{transform:translate(-8px,-6px)}70%{transform:translate(6px,4px)}}
.dot{animation:dotPulse 1.2s ease-in-out infinite}
@keyframes dotPulse{0%,100%{opacity:.2}50%{opacity:1}}
.spark{transform-box:fill-box;transform-origin:center;animation:twinkle 1.8s ease-in-out infinite}
@keyframes twinkle{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1.1)}}
.mood-worried .robot-svg{animation-duration:1.2s}
.mood-worried .wave{animation-duration:.6s}
.sweat{animation:sweatBob 1.6s ease-in-out infinite}
@keyframes sweatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
.mood-sad .robot-svg{animation:shake 3s ease-in-out infinite}
@keyframes shake{0%,68%,100%{transform:rotate(0)}72%{transform:rotate(-4deg)}76%{transform:rotate(4deg)}80%{transform:rotate(-4deg)}84%{transform:rotate(4deg)}88%{transform:rotate(0)}}
.tear{animation:tear 2.2s ease-in infinite}
@keyframes tear{0%{opacity:0;transform:translateY(-6px)}20%{opacity:1}100%{opacity:0;transform:translateY(26px)}}
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
  <div class="robot-wrap mood-${mood}">${getRobotSVG(mood)}</div>
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
