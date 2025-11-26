/**
 * Módulo simple de EventBus para notificar eventos de caché.
 */
const EventBus = (() => {
    const listeners = {};

    const subscribete = (e, callback) => {
        if (!listeners[e]) {
            listeners[e] = [];
        }
        listeners[e].push(callback);
    };

    const publico = (e, data) => {
        if (listeners[e]) {
            listeners[e].forEach(callback => {
                callback(data);
            });
        }
    };

    return { subscribete, publico };
})();

// Simplificación de LRU: El Map de JS mantiene orden de inserción.
// Al "acceder" movemos el elemento al final.
class LRUEviction {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.map = new Map(); // Almacena claves
    }

    access(key) {
        // Mueve la clave al final del orden de uso (más reciente)
        if (this.map.has(key)) {
            const value = this.map.get(key);
            this.map.delete(key);
            this.map.set(key, value);
        }
    }

    add(key) {
        // La nueva clave se añade al final (más reciente)
        this.map.set(key, true);
    }

    canEvict() {
        return this.map.size >= this.maxSize;
    }
    
    getKeyToEvict() {
        // La clave a desalojar es la primera (la menos reciente)
        return this.map.keys().next().value;
    }

    remove(key) {
        this.map.delete(key);
    }
}


class FIFOEviction {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.queue = []; // Array o cola para mantener el orden de inserción
    }

    access(key) {
        // FIFO ignora el acceso, solo importa la inserción
    }

    add(key) {
        this.queue.push(key);
    }

    canEvict() {
        return this.queue.length >= this.maxSize;
    }

    getKeyToEvict() {
        // La clave a desalojar es la primera que entró
        return this.queue[0];
    }

    remove(key) {
        const index = this.queue.indexOf(key);
        if (index > -1) {
            this.queue.splice(index, 1);
        }
    }
}


/**
 * Factory Function para crear una instancia de caché.
 * @param {object} eventBus - La instancia del EventBus.
 * @param {object} evictionStrategy - La instancia de la estrategia (LRU o FIFO).
 */
const createCache = (eventBus, evictionStrategy) => {
    // Estado privado (encapsulado por el closure)
    const store = new Map(); // { key: { value: any, expiry: number } }
    let stats = { hits: 0, misses: 0 };
    
    // Función de ayuda para verificar expiración
    const isExpired = (key, entry) => {
        return entry.expiry !== 0 && entry.expiry <= Date.now();
    };

    const get = (key) => {
        const entry = store.get(key);

        if (!entry) {
            stats.misses++;
            eventBus.publico('cache:miss', { key, stats });
            return null;
        }

        // 1. Verificación de Invalidez Automática (TTL)
        if (isExpired(key, entry)) {
            remove(key, true); // Eliminar si está expirado
            stats.misses++;
            eventBus.publico('cache:miss', { key, stats, reason: 'expired' });
            return null;
        }

        // 2. Acierto (Hit)
        stats.hits++;
        evictionStrategy.access(key); // Notificar a la estrategia de que se usó
        eventBus.publico('cache:hit', { key, stats });
        
        return entry.value;
    };

    const set = (key, value, ttl_ms = 0) => {
        // Si el elemento ya existe, actualizamos su posición/tiempo en la estrategia
        if (store.has(key)) {
            evictionStrategy.remove(key);
        }

        // 1. Aplicar Eviction si es necesario
        if (evictionStrategy.canEvict() && !store.has(key)) {
            const keyToEvict = evictionStrategy.getKeyToEvict();
            if (keyToEvict) {
                remove(keyToEvict);
                eventBus.publico('cache:eviction', { evictedKey: keyToEvict, reason: 'capacity' });
            }
        }
        
        // 2. Almacenar el dato
        const expiry = ttl_ms > 0 ? Date.now() + ttl_ms : 0;
        store.set(key, { value, expiry });
        evictionStrategy.add(key); // Notificar a la estrategia
    };

    const remove = (key, isExpired = false) => {
        if (store.has(key)) {
            store.delete(key);
            evictionStrategy.remove(key);
            if (isExpired) {
                eventBus.publico('cache:invalidated', { key, reason: 'ttl_expired' });
            }
            return true;
        }
        return false;
    };

    const getStats = () => ({ ...stats });

    return {
        get,
        set,
        remove,
        getStats,
        getSize: () => store.size
    };
};


// Configuración de la caché: Tamaño máximo de 3, usando LRU
const CACHE_SIZE = 3;
const lruStrategy = new LRUEviction(CACHE_SIZE);

// Inicializar el sistema de caché con la estrategia y el EventBus
const myCache = createCache(EventBus, lruStrategy);

// --- 1. Suscribirse a eventos ---
EventBus.subscribete('cache:hit', ({ key }) => console.log(`✅ CACHE HIT para: ${key}`));
EventBus.subscribete('cache:miss', ({ key, reason }) => console.log(`❌ CACHE MISS para: ${key} (${reason || 'not found'})`));
EventBus.subscribete('cache:eviction', ({ evictedKey }) => console.log(`🗑️ CACHE EVICTION: ${evictedKey} fue eliminado por capacidad`));

console.log("--- 🚀 Llenando la caché (Tamaño máx: 3) ---");
myCache.set('A', 1, 10000); // 10 segundos
myCache.set('B', 2);
myCache.set('C', 3);
console.log(`Tamaño actual: ${myCache.getSize()}`);

console.log("\n--- 🧠 Probando Eviction (LRU) ---");
myCache.get('A'); // Acceder a 'A'. Ahora 'B' es el menos usado.

myCache.set('D', 4); // Causa Eviction: 'B' debería ser eliminado (el menos usado)
// Output: 🗑️ CACHE EVICTION: B fue eliminado por capacidad
console.log(`Tamaño actual: ${myCache.getSize()}`);

console.log("\n--- ⏱️ Probando TTL e Invalidación ---");
myCache.set('E', 5, 100); // Expirará en 100ms
console.log(`Valor de E (antes): ${myCache.get('E')}`);

// Esperamos 150ms para que expire el TTL
setTimeout(() => {
    console.log(`\nDespués de 150ms...`);
    const valE = myCache.get('E'); // Debería ser un MISS y forzar la eliminación
    // Output: ❌ CACHE MISS para: E (expired)
    console.log(`Valor de E (después de expirar): ${valE}`); 
    console.log(`Estadísticas finales:`, myCache.getStats());
}, 150);