// Task 3: Module Pattern e IIFE (8 minutos)
// Patrones para crear módulos con encapsulamiento usando closures.

// Immediately Invoked Function Expression (IIFE)
// IIFE básico
(function() {
  const mensaje = "Hola desde IIFE";
  console.log(mensaje);
})(); // Se ejecuta inmediatamente

// console.log(mensaje); // ❌ ReferenceError (privado)

// IIFE con parámetros
(function(base) {
  const multiplicar = function(x) {
    return x * base;
  };

  window.multiplicarPorDos = multiplicar;
})(2);

console.log(multiplicarPorDos(5)); // 10

// Module Pattern Clásico
// Module pattern básico
const Calculadora = (function() {
  // Variables privadas
  let memoria = 0;
  let operaciones = [];

  // Función privada
  function registrarOperacion(operacion, resultado) {
    operaciones.push({
      operacion,
      resultado,
      timestamp: new Date()
    });
  }

  // API pública (closure)
  return {
    sumar: function(a, b) {
      const resultado = a + b;
      registrarOperacion(`${a} + ${b}`, resultado);
      return resultado;
    },

    restar: function(a, b) {
      const resultado = a - b;
      registrarOperacion(`${a} - ${b}`, resultado);
      return resultado;
    },

    multiplicar: function(a, b) {
      const resultado = a * b;
      registrarOperacion(`${a} * ${b}`, resultado);
      return resultado;
    },

    dividir: function(a, b) {
      if (b === 0) throw new Error("No se puede dividir por cero");
      const resultado = a / b;
      registrarOperacion(`${a} / ${b}`, resultado);
      return resultado;
    },

    guardarEnMemoria: function(valor) {
      memoria = valor;
    },

    obtenerDeMemoria: function() {
      return memoria;
    },

    obtenerHistorial: function() {
      return [...operaciones]; // Copia para evitar modificación externa
    },

    limpiarHistorial: function() {
      operaciones = [];
    }
  };
})();

// Uso del módulo
console.log(Calculadora.sumar(10, 5)); // 15
console.log(Calculadora.multiplicar(3, 4)); // 12
Calculadora.guardarEnMemoria(42);
console.log(Calculadora.obtenerDeMemoria()); // 42

const historial = Calculadora.obtenerHistorial();
console.log(historial.length, "operaciones realizadas");


// Module Pattern Moderno (ES6 Modules)
// archivo: calculadora.js
let memoria = 0;
const operaciones = [];

function registrarOperacion(operacion, resultado) {
  operaciones.push({ operacion, resultado, timestamp: new Date() });
}

export function sumar(a, b) {
  const resultado = a + b;
  registrarOperacion(`${a} + ${b}`, resultado);
  return resultado;
}

export function restar(a, b) {
  const resultado = a - b;
  registrarOperacion(`${a} - ${b}`, resultado);
  return resultado;
}

export function obtenerHistorial() {
  return [...operaciones];
}

export function limpiarHistorial() {
  operaciones.length = 0; // Vaciar array
}

// Variables privadas quedan encapsuladas
// export default { sumar, restar, obtenerHistorial, limpiarHistorial };

// Revealing Module Pattern
// Revealing module pattern
const GestorDeTareas = (function() {
  // Datos privados
  let tareas = [];
  let siguienteId = 1;

  // Función privada
  function encontrarTarea(id) {
    return tareas.find(tarea => tarea.id === id);
  }

  // Funciones privadas adicionales
  function generarId() {
    return siguienteId++;
  }

  function validarTarea(tarea) {
    return tarea && typeof tarea.titulo === 'string' && tarea.titulo.trim().length > 0;
  }

  // API pública (revelada)
  function agregarTarea(titulo, descripcion = '') {
    if (!titulo || titulo.trim().length === 0) {
      throw new Error('El título es obligatorio');
    }

    const nuevaTarea = {
      id: generarId(),
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      completada: false,
      fechaCreacion: new Date()
    };

    tareas.push(nuevaTarea);
    return nuevaTarea.id;
  }

  function completarTarea(id) {
    const tarea = encontrarTarea(id);
    if (tarea) {
      tarea.completada = true;
      tarea.fechaCompletada = new Date();
      return true;
    }
    return false;
  }

  function obtenerTareas(filtro = 'todas') {
    switch (filtro) {
      case 'pendientes':
        return tareas.filter(t => !t.completada);
      case 'completadas':
        return tareas.filter(t => t.completada);
      default:
        return [...tareas]; // Copia para evitar modificación externa
    }
  }

  function eliminarTarea(id) {
    const indice = tareas.findIndex(t => t.id === id);
    if (indice !== -1) {
      tareas.splice(indice, 1);
      return true;
    }
    return false;
  }

  function obtenerEstadisticas() {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.completada).length;
    const pendientes = total - completadas;

    return { total, completadas, pendientes };
  }

  // Revealing: exponer solo lo necesario
  return {
    agregarTarea,
    completarTarea,
    obtenerTareas,
    eliminarTarea,
    obtenerEstadisticas
  };
})();

// Uso del módulo
GestorDeTareas.agregarTarea('Aprender JavaScript');
GestorDeTareas.agregarTarea('Practicar closures', 'Repasar conceptos avanzados');
GestorDeTareas.completarTarea(1);

console.log(GestorDeTareas.obtenerEstadisticas()); // { total: 2, completadas: 1, pendientes: 1 }
console.log(GestorDeTareas.obtenerTareas('pendientes'));