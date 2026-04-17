"use strict";

const SAMPLES = [
  `// Muestra 1: pseudocódigo completo
if (x := 10) {
  pepe := x + 25;
  for (i := 0; i <= 100; i := i + 1) {
    print(pepe);
  }
}
resultado := pepe * 3 - asdfg + 7;
nombre10ch := 42;
nombreDemasiadoLargo := 99;
cadena := "hola asdfg mundo";
if (resultado <> 0) {
  int contador := resultado / 2;
}
arr[0] := (50 + 30);
datos[1..5] := 0;
`,
  `// Muestra 2 – condicional y ciclo
int x := 10
int y := 20
if (x < y) {
  int suma := x + y
}
while (x < 100) {
  x := x + 1
}`,
];

function analyze() {
  const code = document.getElementById("codeInput").value;
  if (!code.trim()) return;

  // ── Análisis léxico (igual que antes) ──────────
  const result = new Lexer(code).run();
  renderTokens(result.tokens);
  renderErrorTable(result.errTable);
  renderSymbols(result.symbols, result.tokens, result.errors);

  // ── BNF ────────────────────────────────────────
  const bnfEl = document.getElementById("bnfDisplay");
  if (bnfEl) bnfEl.textContent = BNF_RULES;

  // ── Árbol sintáctico ───────────────────────────
  const parseInfo = document.getElementById("parseInfo");
  const validToks = result.tokens.filter(t => t.type !== "Error");
  if (parseInfo) parseInfo.textContent = `(${validToks.length} tokens válidos)`;
  renderParseTree(result.tokens, "parseTreeWrap");
}

function clearAll() {
  clearUI();

  // limpiar también las secciones nuevas
  const bnfEl = document.getElementById("bnfDisplay");
  if (bnfEl) bnfEl.textContent = "";

  const treeWrap = document.getElementById("parseTreeWrap");
  if (treeWrap) treeWrap.innerHTML =
    `<div class="empty"><span class="empty-icon">⊙</span>
     <span>El árbol se generará al analizar...</span></div>`;

  const parseInfo = document.getElementById("parseInfo");
  if (parseInfo) parseInfo.textContent = "";
}

function loadSample(n) {
  document.getElementById("codeInput").value = SAMPLES[n - 1] ?? "";
}

window.analyze    = analyze;
window.clearAll   = clearAll;
window.loadSample = loadSample;

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    analyze();
  }
});