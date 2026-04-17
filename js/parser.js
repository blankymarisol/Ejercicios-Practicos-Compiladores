"use strict";

// ─────────────────────────────────────────────
// BNF del lenguaje (derivada del analizador léxico)
// ─────────────────────────────────────────────
const BNF_RULES = `<programa>       ::= <sentencia> | <programa> <sentencia>

<sentencia>      ::= <asignacion>
                   | <declaracion>
                   | <condicional>
                   | <ciclo>
                   | <impresion>

<asignacion>     ::= <identificador> := <expresion>

<declaracion>    ::= <tipo> <identificador>
                   | <tipo> <identificador> := <expresion>

<tipo>           ::= int | bool | void | var | let | const

<condicional>    ::= if ( <condicion> ) { <programa> }
                   | if ( <condicion> ) { <programa> } else { <programa> }

<ciclo>          ::= while ( <condicion> ) { <programa> }
                   | for ( <asignacion> ; <condicion> ; <asignacion> ) { <programa> }
                   | do { <programa> } while ( <condicion> )

<impresion>      ::= print ( <expresion> )

<expresion>      ::= <expresion> <op_aritm> <termino>
                   | <termino>

<termino>        ::= <termino> * <factor>
                   | <termino> / <factor>
                   | <factor>

<factor>         ::= ( <expresion> )
                   | <identificador>
                   | <numero>
                   | <cadena>

<condicion>      ::= <expresion> <op_rel> <expresion>
                   | <expresion>

<op_aritm>       ::= + | -

<op_rel>         ::= > | < | >= | <= | <> | =

<identificador>  ::= letra { letra | digito | _ }
                     /* máximo 10 caracteres */

<numero>         ::= digito { digito }
                     /* rango: 0 – 100 */

<cadena>         ::= " { caracter } " | ' { caracter } '

<letra>          ::= a | b | ... | z | A | B | ... | Z | _
<digito>         ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`;

// ─────────────────────────────────────────────
// Clase Parser — construye árbol de derivación
// ─────────────────────────────────────────────
class Parser {
  constructor(tokens) {
    // Filtramos errores para no detener el parser
    this.tokens = tokens.filter(t => t.type !== "Error");
    this.pos    = 0;
    this.errors = [];
  }

  // ── Utilidades ──────────────────────────────
  peek()    { return this.tokens[this.pos] || null; }
  advance() { return this.tokens[this.pos++] || null; }
  isEnd()   { return this.pos >= this.tokens.length; }

  node(label, children = [], value = null) {
    return { label, children, value };
  }

  // Intenta consumir un token que coincida con type o value
  expect(type, value = null) {
    const tok = this.peek();
    if (!tok) return null;
    const typeMatch  = !type  || tok.type  === type;
    const valueMatch = !value || tok.value === value;
    if (typeMatch && valueMatch) return this.advance();
    return null;
  }

  // ── Reglas de la gramática ───────────────────

  parsePrograma() {
    const stmts = [];
    while (!this.isEnd()) {
      const stmt = this.parseSentencia();
      if (stmt) stmts.push(stmt);
      else { this.advance(); } // recuperación de error
    }
    return this.node("<programa>", stmts);
  }

  parseSentencia() {
    const tok = this.peek();
    if (!tok) return null;

    // Declaración: tipo seguido de identificador
    if (tok.type === "Palabra reservada" &&
        ["int","bool","void","var","let","const"].includes(tok.value.toLowerCase())) {
      return this.parseDeclaracion();
    }
    // Condicional
    if (tok.value === "if")    return this.parseCondicional();
    // Ciclos
    if (tok.value === "while") return this.parseCicloWhile();
    if (tok.value === "for")   return this.parseCicloFor();
    if (tok.value === "do")    return this.parseCicloDo();
    // Impresión
    if (tok.value === "print") return this.parseImpresion();
    // Asignación
    if (tok.type === "Identificador") return this.parseAsignacion();

    return null;
  }

  parseAsignacion() {
    const children = [];
    const id = this.expect("Identificador");
    if (!id) return null;
    children.push(this.node("<identificador>", [], id.value));

    const op = this.expect("Operador de asignación");
    if (!op) {
      this.errors.push(`Línea ${id.line}: se esperaba ':=' después de '${id.value}'`);
      return this.node("<asignacion>", children);
    }
    children.push(this.node(":=", [], ":="));

    const expr = this.parseExpresion();
    if (expr) children.push(expr);

    return this.node("<asignacion>", children);
  }

  parseDeclaracion() {
    const children = [];
    const tipo = this.advance();
    children.push(this.node("<tipo>", [], tipo.value));

    const id = this.expect("Identificador");
    if (id) children.push(this.node("<identificador>", [], id.value));

    const op = this.expect("Operador de asignación");
    if (op) {
      children.push(this.node(":=", [], ":="));
      const expr = this.parseExpresion();
      if (expr) children.push(expr);
    }

    return this.node("<declaracion>", children);
  }

  parseCondicional() {
    const children = [];
    this.advance(); // if
    children.push(this.node("if", [], "if"));
    this.expect("Símbolo/Relacional", "(");
    children.push(this.node("(", [], "("));
    const cond = this.parseCondicion();
    if (cond) children.push(cond);
    this.expect("Símbolo/Relacional", ")");
    children.push(this.node(")", [], ")"));
    return this.node("<condicional>", children);
  }

  parseCicloWhile() {
    const children = [];
    this.advance(); // while
    children.push(this.node("while", [], "while"));
    this.expect("Símbolo/Relacional", "(");
    children.push(this.node("(", [], "("));
    const cond = this.parseCondicion();
    if (cond) children.push(cond);
    this.expect("Símbolo/Relacional", ")");
    children.push(this.node(")", [], ")"));
    return this.node("<ciclo>", children);
  }

  parseCicloFor() {
    const children = [];
    this.advance(); // for
    children.push(this.node("for", [], "for"));
    return this.node("<ciclo>", children);
  }

  parseCicloDo() {
    const children = [];
    this.advance(); // do
    children.push(this.node("do", [], "do"));
    return this.node("<ciclo>", children);
  }

  parseImpresion() {
    const children = [];
    this.advance(); // print
    children.push(this.node("print", [], "print"));
    this.expect("Símbolo/Relacional", "(");
    children.push(this.node("(", [], "("));
    const expr = this.parseExpresion();
    if (expr) children.push(expr);
    this.expect("Símbolo/Relacional", ")");
    children.push(this.node(")", [], ")"));
    return this.node("<impresion>", children);
  }

  // expresion → termino { op_aritm termino }
  parseExpresion() {
    let left = this.parseTermino();
    if (!left) return null;

    while (this.peek() && this.peek().type === "Operador aritmético" &&
           ["+","-"].includes(this.peek().value)) {
      const op   = this.advance();
      const right = this.parseTermino();
      if (!right) break;
      left = this.node("<expresion>", [
        left,
        this.node("<op_aritm>", [], op.value),
        right
      ]);
    }
    return left.label === "<expresion>" ? left : this.node("<expresion>", [left]);
  }

  // termino → factor { (* | /) factor }
  parseTermino() {
    let left = this.parseFactor();
    if (!left) return null;

    while (this.peek() && this.peek().type === "Operador aritmético" &&
           ["*","/"].includes(this.peek().value)) {
      const op    = this.advance();
      const right = this.parseFactor();
      if (!right) break;
      left = this.node("<termino>", [
        left,
        this.node("<op_aritm>", [], op.value),
        right
      ]);
    }
    return left.label === "<termino>" ? left : this.node("<termino>", [left]);
  }

  // factor → ( expr ) | id | num | str
  parseFactor() {
    const tok = this.peek();
    if (!tok) return null;

    if (tok.value === "(" && tok.type !== "Identificador") {
      this.advance();
      const expr = this.parseExpresion();
      this.expect(null, ")");
      return this.node("<factor>", [
        this.node("(", [], "("),
        expr || this.node("ε"),
        this.node(")", [], ")")
      ]);
    }
    if (tok.type === "Identificador") {
      this.advance();
      return this.node("<factor>", [
        this.node("<identificador>", [], tok.value)
      ]);
    }
    if (tok.type === "Número entero") {
      this.advance();
      return this.node("<factor>", [
        this.node("<numero>", [], tok.value)
      ]);
    }
    if (tok.type === "Cadena") {
      this.advance();
      return this.node("<factor>", [
        this.node("<cadena>", [], `"${tok.value}"`)
      ]);
    }
    return null;
  }

  // condicion → expresion op_rel expresion
  parseCondicion() {
    const left = this.parseExpresion();
    if (!left) return null;

    const rel = this.peek();
    if (rel && rel.type === "Símbolo/Relacional" &&
        [">","<",">=","<=","<>","="].includes(rel.value)) {
      this.advance();
      const right = this.parseExpresion();
      return this.node("<condicion>", [
        left,
        this.node("<op_rel>", [], rel.value),
        right || this.node("ε")
      ]);
    }
    return this.node("<condicion>", [left]);
  }

  run() {
    const tree = this.parsePrograma();
    return { tree, errors: this.errors };
  }
}

// ─────────────────────────────────────────────
// Renderizado del árbol en canvas SVG
// ─────────────────────────────────────────────
const NODE_W = 130, NODE_H = 34, GAP_X = 10, GAP_Y = 54;

function measureTree(node) {
  if (!node.children || node.children.length === 0) {
    node._w = NODE_W;
    return;
  }
  node.children.forEach(measureTree);
  node._w = Math.max(
    NODE_W,
    node.children.reduce((s,c) => s + c._w + GAP_X, -GAP_X)
  );
}

function positionTree(node, x, y) {
  node._x = x;
  node._y = y;
  if (!node.children || node.children.length === 0) return;
  let cx = x - node._w / 2 + node.children[0]._w / 2;
  node.children.forEach(child => {
    positionTree(child, cx + child._w / 2, y + GAP_Y);
    cx += child._w + GAP_X;
  });
}

function svgEscape(s) {
  return String(s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}

function treeToSVG(root) {
  const allNodes = [];
  const allEdges = [];

  function collect(node) {
    allNodes.push(node);
    (node.children||[]).forEach(child => {
      allEdges.push({ x1: node._x, y1: node._y + NODE_H,
                      x2: child._x, y2: child._y });
      collect(child);
    });
  }
  collect(root);

  if (!allNodes.length) return "<p>Sin nodos</p>";

  const minX = Math.min(...allNodes.map(n=>n._x)) - NODE_W/2 - 20;
  const maxX = Math.max(...allNodes.map(n=>n._x)) + NODE_W/2 + 20;
  const maxY = Math.max(...allNodes.map(n=>n._y)) + NODE_H + 30;
  const W    = maxX - minX;
  const H    = maxY;

  const isLeaf  = n => !n.children || n.children.length === 0;
  const isNT    = n => n.label.startsWith("<");
  const getColor = n => {
    if (isLeaf(n))  return { fill:"#faeeda", stroke:"#BA7517", text:"#633806" };
    if (n.label === "<expresion>" || n.label === "<sentencia>" ||
        n.label === "<declaracion>" || n.label === "<programa>")
      return { fill:"#EEEDFE", stroke:"#534AB7", text:"#3C3489" };
    if (isNT(n))    return { fill:"#E1F5EE", stroke:"#0F6E56", text:"#085041" };
    return          { fill:"#F1EFE8", stroke:"#5F5E5A", text:"#444441" };
  };

  let lines = allEdges.map(e =>
    `<line x1="${e.x1-minX}" y1="${e.y1}" x2="${e.x2-minX}" y2="${e.y2}" stroke="#888" stroke-width="0.8" fill="none"/>`
  ).join("\n");

  let rects = allNodes.map(n => {
    const c   = getColor(n);
    const nx  = n._x - minX - NODE_W/2;
    const lbl = n.value !== null ? svgEscape(n.value) : svgEscape(n.label);
    return `<g>
  <rect x="${nx}" y="${n._y}" width="${NODE_W}" height="${NODE_H}" rx="6"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="0.8"/>
  <text x="${nx + NODE_W/2}" y="${n._y + NODE_H/2}" text-anchor="middle"
        dominant-baseline="central" font-family="inherit" font-size="11"
        fill="${c.text}" font-weight="${isNT(n)?'500':'400'}">${lbl}</text>
</g>`;
  }).join("\n");

  return `<svg width="100%" viewBox="0 0 ${W} ${H}" style="overflow:visible">
${lines}
${rects}
</svg>`;
}

function renderParseTree(tokens, containerId) {
  const parser = new Parser(tokens);
  const { tree, errors } = parser.run();

  measureTree(tree);
  positionTree(tree, tree._w / 2, 20);

  const container = document.getElementById(containerId);
  if (!container) return;

  if (!tree.children || tree.children.length === 0) {
    container.innerHTML = `<div class="empty"><span class="empty-icon">⊙</span>
      <span>No se detectaron sentencias válidas para el árbol.</span></div>`;
    return;
  }

  container.innerHTML = `<div style="overflow-x:auto;padding:8px 0">${treeToSVG(tree)}</div>`;

  if (errors.length) {
    const errDiv = document.createElement("div");
    errDiv.style.cssText = "margin-top:12px;font-size:.8rem;color:var(--color-text-danger,#c03)";
    errDiv.innerHTML = "<b>Advertencias del parser:</b><br>" + errors.map(e=>`• ${e}`).join("<br>");
    container.appendChild(errDiv);
  }
}