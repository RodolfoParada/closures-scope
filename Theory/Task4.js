// Task 4: Técnicas Avanzadas de Scope (4 minutos)
// Scope Chain Complejo
globalVariable = "Variable global"; // No usar var, let, const

function nivel1() {
  const nivel1Var = "Nivel 1";

  return function nivel2() {
    const nivel2Var = "Nivel 2";

    return function nivel3() {
      const nivel3Var = "Nivel 3";

      // Acceso a toda la chain
      console.log(nivel3Var); // "Nivel 3"
      console.log(nivel2Var); // "Nivel 2"
      console.log(nivel1Var); // "Nivel 1"
      console.log(globalVariable); // "Variable global"
    };
  };
}

nivel1()()(); // Ejecuta nivel3

// Closures con Context
// Problema común: perder el contexto de 'this'
const objeto = {
  nombre: "Mi Objeto",
  metodos: {
    normal: function() {
      return this.nombre;
    },
    flecha: () => {
      return this.nombre; // 'this' se refiere al scope global
    }
  }
};

console.log(objeto.metodos.normal()); // "Mi Objeto"
console.log(objeto.metodos.flecha()); // undefined

// Solución: bind o closure
const objeto2 = {
  nombre: "Mi Objeto 2",
  crearMetodo: function() {
    return function() {
      return this.nombre; // Closure captura 'this' correcto
    }.bind(this); // O usar bind
  }
};

const metodo = objeto2.crearMetodo();
console.log(metodo()); // "Mi Objeto 2"