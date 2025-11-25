// Task 1: Scope Léxico y Execution Context (8 minutos)
// El scope léxico determina cómo se resuelven las variables basándose en su ubicación física en el código.

// Scope Types en JavaScript
// Global scope
const variableGlobal = "Estoy en el scope global";

function funcionExterna() {
  // Function scope
  const variableFuncion = "Estoy en el scope de función";

  if (true) {
    // Block scope (con let/const)
    let variableBloque = "Estoy en el scope de bloque";
    const variableBloqueConst = "También en bloque";

    console.log(variableBloque); // ✅ Accesible
  }

  // console.log(variableBloque); // ❌ ReferenceError

  console.log(variableFuncion); // ✅ Accesible
  console.log(variableGlobal); // ✅ Accesible
}

funcionExterna();

// Lexical Environment
// Cada execution context tiene un lexical environment que contiene:

// Environment Record: variables locales y parámetros
// Reference to outer environment: enlace al scope padre

function exterior(x) {
  // Lexical environment exterior:
  // { x: 10, interior: <function> }

  function interior(y) {
    // Lexical environment interior:
    // { y: 20, outer: <ref to exterior environment> }

    return x + y; // x se encuentra en el scope exterior
  }

  return interior;
}

const funcionInterior = exterior(10);
console.log(funcionInterior(20)); // 30


// Hoisting y TDZ (Temporal Dead Zone)
// Hoisting con var
console.log(variableVar); // undefined (hoisted)
var variableVar = "Hola";

// Hoisting con function declaration
saludar(); // ✅ Funciona

function saludar() {
  console.log("Hola desde función hoisted");
}

// TDZ con let/const
// console.log(variableLet); // ❌ ReferenceError
let variableLet = "Hola";

// Funciones expresadas no se hoist
// saludarExpresada(); // ❌ TypeError: saludarExpresada is not a function

var saludarExpresada = function() {
  console.log("Hola desde función expresada");
};