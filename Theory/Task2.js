// Task 2: Closures en Profundidad (10 minutos)
// Un closure es una función que "recuerda" el lexical environment donde fue creada, 
// permitiendo acceder a variables del scope externo incluso después de que ese scope haya terminado.

// Closure Básico
function crearContador() {
  let contador = 0; // Variable capturada por el closure

  return function() {
    contador++; // Puede acceder y modificar la variable externa
    return contador;
  };
}

const contador1 = crearContador();
const contador2 = crearContador();

console.log(contador1()); // 1
console.log(contador1()); // 2
console.log(contador2()); // 1 (contador independiente)

// Closures en Callbacks


function crearLogger(prefijo) {
  return function(mensaje) {
    console.log(`[${prefijo}] ${mensaje}`);
  };
}

const logError = crearLogger("ERROR");
const logInfo = crearLogger("INFO");

logError("Algo salió mal"); // [ERROR] Algo salió mal
logInfo("Operación exitosa"); // [INFO] Operación exitosa

// Ejemplo con setTimeout
function crearTemporizador(delay) {
  let tiempoRestante = delay;

  return function() {
    if (tiempoRestante > 0) {
      console.log(`Tiempo restante: ${tiempoRestante}s`);
      tiempoRestante--;
    } else {
      console.log("¡Tiempo terminado!");
    }
  };
}

const temporizador = crearTemporizador(3);
setInterval(temporizador, 1000); // Llama la función cada segundo

// Problemas Comunes con Closures


// Problema: Closure en loop (común con var)
function crearFunciones() {
  var funciones = [];

  for (var i = 0; i < 3; i++) {
    funciones.push(function() {
      console.log(i); // Siempre imprime 3
    });
  }

  return funciones;
}

const funcs = crearFunciones();
funcs[0](); // 3
funcs[1](); // 3
funcs[2](); // 3

// Solución 1: Usar let (block scope)
function crearFuncionesSolucion1() {
  const funciones = [];

  for (let i = 0; i < 3; i++) { // let tiene block scope
    funciones.push(function() {
      console.log(i); // Cada closure captura el valor correcto
    });
  }

  return funciones;
}

// Solución 2: IIFE (Immediately Invoked Function Expression)
function crearFuncionesSolucion2() {
  const funciones = [];

  for (var i = 0; i < 3; i++) {
    funciones.push((function(valorCapturado) {
      return function() {
        console.log(valorCapturado); // Cada closure tiene su propio valor
      };
    })(i)); // IIFE captura el valor actual de i
  }

  return funciones;
}

// Closures Avanzados

// Closure factory
function crearMultiplicador(factor) {
  return function(numero) {
    return numero * factor;
  };
}

const duplicar = crearMultiplicador(2);
const triplicar = crearMultiplicador(3);
const cuadruplicar = crearMultiplicador(4);

console.log(duplicar(5)); // 10
console.log(triplicar(5)); // 15
console.log(cuadruplicar(5)); // 20

// Closure con estado privado
function crearCuentaBancaria(saldoInicial) {
  let saldo = saldoInicial; // Privado

  return {
    depositar: function(monto) {
      saldo += monto;
      return saldo;
    },
    retirar: function(monto) {
      if (monto <= saldo) {
        saldo -= monto;
        return saldo;
      }
      throw new Error("Saldo insuficiente");
    },
    consultarSaldo: function() {
      return saldo;
    }
  };
}

const cuenta = crearCuentaBancaria(1000);
console.log(cuenta.consultarSaldo()); // 1000
cuenta.depositar(500); // 1500
cuenta.retirar(200); // 1300
// console.log(cuenta.saldo); // undefined (privado)