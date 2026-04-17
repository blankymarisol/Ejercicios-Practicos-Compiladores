# 🔍 Analizador Léxico + Sintáctico — TOKENS
> Primeras dos fases de un compilador: tokenización, tabla de símbolos, detección de errores léxicos y análisis sintáctico con árbol de derivación.
 
---
 
## ¿Qué hace esta página?
 
Se le mete código — el que sea, Python, C, pseudocódigo, lo que sea — y la página lo "desmenuza" en piezas pequeñas llamadas **tokens**. Es como pasarle el código por un filtro que clasifica todo. Luego, con esos tokens, construye automáticamente un **árbol de derivación** que muestra la estructura gramatical del programa.
 
---
 
## ¿Qué muestra?
 
### 1. 🏷️ Tokens detectados
Cada "palabra" o símbolo que se encontró aparece con su etiqueta de color:
 
| Token | Ejemplo | Color |
|-------|---------|-------|
| Palabra reservada | `if`, `for`, `int` | Violeta |
| Identificador | `x`, `resultado` | Azul índigo |
| Número entero | `25`, `100` | Verde esmeralda |
| Cadena asdfg | `"hola asdfg"` | Ámbar |
| Operador aritmético | `+`, `-`, `*`, `/` | Fucsia |
| Operador relacional | `>=`, `<=`, `<>` | Cian |
| Error | `identificadorLargo`, `250` | Coral/rojo |
 
### 2. 📋 Tabla de símbolos
Un resumen de todo lo que se encontró: qué era, en qué línea apareció por primera vez y cuántas veces se repitió. Útil para ver de un vistazo qué variables y palabras se usaron.
 
### 3. 📊 Estadísticas
Contadores rápidos: cuántos tokens en total, cuántas palabras reservadas, identificadores, números. Y si hubo errores, también los cuenta.
 
### 4. 📐 Gramática BNF del lenguaje
Muestra la gramática formal del lenguaje en notación **BNF (Backus-Naur Form)** que describe todas las construcciones válidas: asignaciones, declaraciones, condicionales, ciclos, expresiones y más.
 
### 5. 🌳 Árbol de Derivación (Análisis Sintáctico)
Una vez analizado el código, el analizador sintáctico construye visualmente el **árbol de derivación** que representa la estructura gramatical del programa. Cada nodo muestra cómo se aplican las reglas de la BNF para llegar a los tokens hoja.
 
---
 
## ¿Qué reglas maneja?
 
- 📏 Los nombres de variables tienen **máximo 10 caracteres** — si se pasa → error léxico
- 🔢 Los números solo se aceptan **entre 0 y 100** — si se pone `250` → error léxico
- ⌨️ Reconoce operadores: `+` `-` `*` `/` `:=` `>=` `<=` `<>` `=` `..` `{}` `[]` `()` `,` `;`
- 🔑 Palabras reservadas: `if`, `else`, `for`, `while`, `do`, `print`, `int`, `bool`, `var`, `let`, `const` y combinaciones con `asdfg`
- 💬 Ignora comentarios `//`, `/* */` y `#` automáticamente
---
 
## Gramática BNF soportada
 
```
<programa>       ::= <sentencia> | <programa> <sentencia>
 
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
 
<expresion>      ::= <expresion> <op_aritm> <termino> | <termino>
<termino>        ::= <termino> * <factor> | <termino> / <factor> | <factor>
<factor>         ::= ( <expresion> ) | <identificador> | <numero> | <cadena>
<condicion>      ::= <expresion> <op_rel> <expresion> | <expresion>
 
<op_aritm>       ::= + | -
<op_rel>         ::= > | < | >= | <= | <> | =
 
<identificador>  ::= letra { letra | digito | _ }   /* máximo 10 caracteres */
<numero>         ::= digito { digito }               /* rango: 0 – 100 */
<cadena>         ::= " { caracter } " | ' { caracter } '
```
 
---
 
## ¿Para qué sirve en la vida real?
 
Esto representa las **dos primeras fases** de un compilador real:
 
```
Código fuente → [Analizador Léxico] → Tokens → [Analizador Sintáctico] → Árbol de derivación → ...
```
 
- El **analizador léxico** verifica que cada palabra *existe y es válida*.
- El **analizador sintáctico** verifica que las palabras estén *ordenadas correctamente* según la gramática del lenguaje, y construye el árbol que las fases siguientes del compilador usarán para generar código.
---
 
## 🗂️ Estructura del proyecto
 
```
lexer/
├── index.html        ← estructura de la página
├── css/
│   └── styles.css    ← paleta de colores y diseño
└── js/
    ├── constants.js  ← tipos de tokens, palabras reservadas y reglas regex
    ├── lexer.js      ← motor del analizador léxico
    ├── parser.js     ← analizador sintáctico + gramática BNF + árbol de derivación
    ├── render.js     ← renderizado de tablas y resultados en la UI
    └── app.js        ← lógica de la interfaz y coordinación de fases
```
 
---
 
## ▶️ Cómo usar
 
1. Abrir `index.html` en el navegador
2. Pegar o escribir el código fuente en el editor
3. Presionar **Analizar** o usar `Ctrl + Enter`
4. Revisar los tokens, la tabla de símbolos y las estadísticas
5. Bajar para ver la **gramática BNF** del lenguaje
6. Ver el **árbol de derivación** generado automáticamente
---
 
## 🛠️ Tecnologías
 
- **HTML5** — estructura
- **CSS3** — estilos y paleta de colores
- **JavaScript (Vanilla)** — lógica del analizador léxico, analizador sintáctico y UI, sin dependencias externas
 
