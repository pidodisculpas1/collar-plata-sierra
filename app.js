// ============================================
// COLLAR ÉTNICO SIERRA — App Logic v2
// Carrito real + Admin Panel + Web3Forms + Social
// ============================================

// ---------- Datos iniciales de productos ----------
const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: "Collar Étnico Sierra",
        descripcion: "Pieza única hecha a mano en los Andes.",
        precio: 89,
        stock: 5,
        imagen: "png-clipart-locket-necklace-silver-chain-jewellery-necklace-white-pendant.png"
    },
    {
        id: 2,
        nombre: "Collar Luna Andina",
        descripcion: "Plata con piedra luna natural, inspirado en los cielos del Altiplano.",
        precio: 120,
        stock: 3,
        imagen: "collar-luna.png"
    },
    {
        id: 3,
        nombre: "Collar Sol de Oro",
        descripcion: "Dorado con detalles de sol inca, edición limitada de coleccionista.",
        precio: 150,
        stock: 2,
        imagen: "collar-oro.png"
    },
    {
        id: 4,
        nombre: "Collar Estrella Amazónica",
        descripcion: "Cobre con estrella tallada, de la selva peruana.",
        precio: 75,
        stock: 8,
        imagen: "collar-estrella.png"
    },
    {
        id: 5,
        nombre: "Collar Mariposa Tropical",
        descripcion: "Bronce con alas de mariposa, de la selva de Madre de Dios.",
        precio: 95,
        stock: 6,
        imagen: "collar-mariposa.png"
    }
];

// ---------- Estado global ----------
let productos = [];
let carrito = [];
let nextId = 6;

// ---------- Inicialización ----------
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarCarrito();
    renderizarProductos(productos);
    actualizarBadge();
    setupWeb3Forms();
});

// ============================================
// PRODUCTOS — Cargar / Guardar / Persistencia
// ============================================
function cargarProductos() {
    const guardado = localStorage.getItem('productos_sierra');
    if (guardado) {
        try {
            productos = JSON.parse(guardado);
            // Calcular nextId basado en el máximo existente
            const maxId = productos.reduce((max, p) => Math.max(max, p.id), 0);
            nextId = maxId + 1;
        } catch (e) {
            productos = [...PRODUCTOS_INICIALES];
            guardarProductos();
        }
    } else {
        productos = [...PRODUCTOS_INICIALES];
        guardarProductos();
    }
}

function guardarProductos() {
    localStorage.setItem('productos_sierra', JSON.stringify(productos));
}

// ============================================
// CARRITO — Persistencia
// ============================================
function guardarCarrito() {
    localStorage.setItem('carrito_sierra', JSON.stringify(carrito));
}

function cargarCarrito() {
    const guardado = localStorage.getItem('carrito_sierra');
    if (guardado) {
        try {
            carrito = JSON.parse(guardado);
        } catch (e) {
            carrito = [];
        }
    }
}

// ============================================
// RENDERIZADO DE PRODUCTOS
// ============================================
function renderizarProductos(lista) {
    const container = document.getElementById('productos-container');
    const sinResultados = document.getElementById('sin-resultados');

    container.innerHTML = '';

    if (lista.length === 0) {
        container.classList.add('hidden');
        sinResultados.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    sinResultados.classList.add('hidden');

    lista.forEach((producto, index) => {
        const enCarrito = carrito.find(item => item.id === producto.id);
        const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;
        const stockDisponible = producto.stock - cantidadEnCarrito;

        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=${encodeURIComponent(producto.nombre)}'">
                ${stockDisponible <= 3 && stockDisponible > 0 ? `<span class="product-stock-badge low">¡Solo ${stockDisponible}!</span>` : ''}
                ${stockDisponible === 0 ? `<span class="product-stock-badge out">Agotado</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-desc">${producto.descripcion}</p>
                <p class="product-price">S/ ${producto.precio.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn-add" id="btn-${producto.id}" onclick="agregarAlCarrito(${producto.id})" ${stockDisponible === 0 ? 'disabled' : ''}>
                        ${stockDisponible === 0 ? 'Agotado' : 'Agregar al carrito'}
                    </button>
                    <a href="https://wa.me/51987654321?text=${encodeURIComponent(`Hola, quiero reservar el ${producto.nombre} por S/ ${producto.precio.toFixed(2)}`)}" 
                       class="btn-wa" target="_blank" rel="noopener" title="Reservar por WhatsApp" 
                       ${stockDisponible === 0 ? 'style="opacity:0.4;pointer-events:none"' : ''}>💬</a>
                </div>
                <p class="product-message" id="msg-${producto.id}"></p>
            </div>
        `;
        container.appendChild(card);
    });
}

// ---------- Filtro de búsqueda ----------
function filtrarProductos() {
    const texto = document.getElementById('busqueda').value.toLowerCase().trim();
    const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.descripcion.toLowerCase().includes(texto)
    );
    renderizarProductos(filtrados);
}

// ============================================
// CARRITO — Operaciones
// ============================================
function agregarAlCarrito(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;

    const enCarrito = carrito.find(item => item.id === idProducto);
    const cantidadActual = enCarrito ? enCarrito.cantidad : 0;

    if (cantidadActual >= producto.stock) {
        mostrarMensaje(idProducto, 'No hay más stock disponible', 'error');
        return;
    }

    if (enCarrito) {
        enCarrito.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarBadge();
    renderizarCarrito();
    renderizarProductos(productos);
    mostrarMensaje(idProducto, '¡Agregado al carrito!', 'success');
}

function cambiarCantidad(idProducto, delta) {
    const item = carrito.find(i => i.id === idProducto);
    const producto = productos.find(p => p.id === idProducto);
    if (!item || !producto) return;

    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(idProducto);
        return;
    }

    if (nuevaCantidad > producto.stock) {
        return;
    }

    item.cantidad = nuevaCantidad;
    guardarCarrito();
    actualizarBadge();
    renderizarCarrito();
    renderizarProductos(productos);
}

function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(item => item.id !== idProducto);
    guardarCarrito();
    actualizarBadge();
    renderizarCarrito();
    renderizarProductos(productos);
}

function vaciarCarrito() {
    if (carrito.length === 0) return;
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito = [];
        guardarCarrito();
        actualizarBadge();
        renderizarCarrito();
        renderizarProductos(productos);
    }
}

function renderizarCarrito() {
    const container = document.getElementById('cart-items');
    const footer = document.getElementById('cart-footer');

    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">🛒</span>
                <p>Tu carrito está vacío</p>
                <span class="cart-empty-hint">Agrega productos para comenzar</span>
            </div>
        `;
        footer.style.display = 'none';
        return;
    }

    footer.style.display = 'block';

    let html = '';
    carrito.forEach(item => {
        html += `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image" onerror="this.onerror=null;this.src='https://placehold.co/64x64?text=${encodeURIComponent(item.nombre)}'">
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.nombre}</p>
                    <p class="cart-item-price">S/ ${item.precio.toFixed(2)} c/u</p>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="cambiarCantidad(${item.id}, -1)" aria-label="Disminuir cantidad">−</button>
                        <span class="qty-value">${item.cantidad}</span>
                        <button class="qty-btn" onclick="cambiarCantidad(${item.id}, 1)" aria-label="Aumentar cantidad">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
            </div>
        `;
    });

    container.innerHTML = html;

    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('cart-subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `S/ ${subtotal.toFixed(2)}`;
}

function actualizarBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    badge.textContent = totalItems;
    if (totalItems === 0) {
        badge.classList.add('hidden');
    } else {
        badge.classList.remove('hidden');
    }
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const isOpen = drawer.classList.contains('open');

    if (isOpen) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    } else {
        renderizarCarrito();
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function checkout() {
    if (carrito.length === 0) return;

    let mensaje = '¡Hola! Quiero reservar los siguientes productos:%0A%0A';
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        mensaje += `• ${item.nombre} x${item.cantidad} — S/ ${subtotal.toFixed(2)}%0A`;
    });

    mensaje += `%0ATotal: S/ ${total.toFixed(2)}`;
    window.open(`https://wa.me/51987654321?text=${mensaje}`, '_blank');
}

function mostrarMensaje(idProducto, texto, tipo) {
    const msg = document.getElementById(`msg-${idProducto}`);
    if (!msg) return;
    msg.textContent = texto;
    msg.className = `product-message ${tipo}`;
    setTimeout(() => {
        msg.textContent = '';
        msg.className = 'product-message';
    }, 2500);
}

// ============================================
// ADMIN PANEL — Agregar/Eliminar/Exportar/Importar Productos
// ============================================
function toggleAdmin() {
    const drawer = document.getElementById('admin-drawer');
    const overlay = document.getElementById('admin-overlay');
    const isOpen = drawer.classList.contains('open');

    if (isOpen) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    } else {
        renderizarAdminProductos();
        cancelarEdicion();
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function guardarProducto(event) {
    event.preventDefault();

    const editId = document.getElementById('admin-edit-id').value;
    const nombre = document.getElementById('admin-nombre').value.trim();
    const descripcion = document.getElementById('admin-desc').value.trim();
    const precio = parseFloat(document.getElementById('admin-precio').value);
    const stock = parseInt(document.getElementById('admin-stock').value);
    let imagen = document.getElementById('admin-imagen').value.trim();

    // Si no hay imagen, usar placeholder con el nombre
    if (!imagen) {
        imagen = 'https://placehold.co/400x400?text=' + encodeURIComponent(nombre);
    }

    if (!nombre || !descripcion || isNaN(precio) || isNaN(stock)) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }

    if (editId) {
        // Modo editar
        const producto = productos.find(p => p.id === parseInt(editId));
        if (producto) {
            producto.nombre = nombre;
            producto.descripcion = descripcion;
            producto.precio = precio;
            producto.stock = stock;
            producto.imagen = imagen;
        }
    } else {
        // Modo agregar
        const nuevoProducto = {
            id: nextId++,
            nombre,
            descripcion,
            precio,
            stock,
            imagen
        };
        productos.push(nuevoProducto);
    }

    guardarProductos();
    renderizarProductos(productos);
    renderizarAdminProductos();
    cancelarEdicion();

    // Mensaje de éxito
    const status = document.createElement('div');
    status.className = 'form-status success';
    status.textContent = editId ? '✅ Producto actualizado correctamente' : '✅ Producto agregado correctamente';
    status.style.display = 'block';
    document.getElementById('admin-form').appendChild(status);
    setTimeout(() => status.remove(), 3000);
}

function editarProducto(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;

    // Llenar formulario
    document.getElementById('admin-edit-id').value = producto.id;
    document.getElementById('admin-nombre').value = producto.nombre;
    document.getElementById('admin-desc').value = producto.descripcion;
    document.getElementById('admin-precio').value = producto.precio;
    document.getElementById('admin-stock').value = producto.stock;
    document.getElementById('admin-imagen').value = producto.imagen;

    // Cambiar UI a modo editar
    document.getElementById('admin-form-title').textContent = '✏️ Editar Producto';
    document.getElementById('admin-submit-btn').textContent = 'Guardar Cambios';
    document.getElementById('admin-cancel-btn').style.display = 'inline-block';

    // Scroll al formulario
    document.getElementById('admin-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelarEdicion() {
    document.getElementById('admin-form').reset();
    document.getElementById('admin-edit-id').value = '';
    document.getElementById('admin-form-title').textContent = '➕ Agregar Nuevo Producto';
    document.getElementById('admin-submit-btn').textContent = 'Agregar Producto';
    document.getElementById('admin-cancel-btn').style.display = 'none';
}

function eliminarProducto(idProducto) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    productos = productos.filter(p => p.id !== idProducto);
    // También eliminar del carrito si está
    carrito = carrito.filter(item => item.id !== idProducto);
    guardarProductos();
    guardarCarrito();
    actualizarBadge();
    renderizarProductos(productos);
    renderizarAdminProductos();
    renderizarCarrito();
}

function renderizarAdminProductos() {
    const container = document.getElementById('admin-productos-lista');
    if (productos.length === 0) {
        container.innerHTML = '<p class="admin-hint">No hay productos registrados</p>';
        return;
    }

    let html = '';
    productos.forEach(p => {
        html += `
            <div class="admin-product-item">
                <img src="${p.imagen}" alt="${p.nombre}" class="admin-product-thumb" onerror="this.onerror=null;this.src='https://placehold.co/48x48?text=${encodeURIComponent(p.nombre)}'">
                <div class="admin-product-info">
                    <p class="admin-product-name">${p.nombre}</p>
                    <p class="admin-product-meta">S/ ${p.precio.toFixed(2)} · Stock: ${p.stock} · ID: ${p.id}</p>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-admin-edit" onclick="editarProducto(${p.id})">Editar</button>
                    <button class="btn-admin-delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ---------- Exportar productos a JSON ----------
function exportarProductos() {
    const dataStr = JSON.stringify(productos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productos-sierra-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ---------- Importar productos desde JSON ----------
function importarProductos(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importados = JSON.parse(e.target.result);
            if (!Array.isArray(importados)) {
                alert('El archivo no contiene un array de productos válido');
                return;
            }

            // Validar y asignar nuevos IDs
            const validos = importados.filter(p => p.nombre && p.precio && p.stock !== undefined);
            validos.forEach(p => {
                p.id = nextId++;
                if (!p.imagen) p.imagen = 'https://placehold.co/400x400?text=Sin+Imagen';
            });

            productos = [...productos, ...validos];
            guardarProductos();
            renderizarProductos(productos);
            renderizarAdminProductos();

            alert(`✅ ${validos.length} productos importados correctamente`);
        } catch (err) {
            alert('❌ Error al leer el archivo: ' + err.message);
        }
    };
    reader.readAsText(file);
    input.value = ''; // Reset para permitir reimportar
}

// ============================================
// ADMIN LOGIN — Contraseña protegida + Sesión persistente
// ============================================
const ADMIN_PASSWORD = 'sierra2026'; // ← Cambia esta contraseña
const ADMIN_SESSION_KEY = 'admin_sierra_session';

// Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', () => {
    verificarSesionAdmin();
});

function verificarSesionAdmin() {
    const btnAdmin = document.getElementById('btn-admin');
    const sesion = localStorage.getItem(ADMIN_SESSION_KEY);

    if (sesion === 'true') {
        btnAdmin.style.display = 'flex';
        btnAdmin.classList.add('visible');
        btnAdmin.onclick = toggleAdmin; // Directo al panel, sin login
    } else {
        btnAdmin.style.display = 'none';
        btnAdmin.classList.remove('visible');
        btnAdmin.onclick = mostrarLoginAdmin;
    }
}

function mostrarLoginAdmin() {
    const modal = document.getElementById('admin-login-modal');
    const overlay = document.getElementById('login-overlay');
    const input = document.getElementById('admin-password');
    const error = document.getElementById('login-error');

    modal.classList.add('open');
    overlay.classList.add('open');
    input.value = '';
    error.classList.remove('visible');
    setTimeout(() => input.focus(), 100);
}

function cerrarLoginAdmin() {
    const modal = document.getElementById('admin-login-modal');
    const overlay = document.getElementById('login-overlay');
    modal.classList.remove('open');
    overlay.classList.remove('open');
}

function verificarPassword() {
    const input = document.getElementById('admin-password');
    const error = document.getElementById('login-error');

    if (input.value === ADMIN_PASSWORD) {
        // Guardar sesión
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        cerrarLoginAdmin();
        verificarSesionAdmin(); // Actualizar botón
        toggleAdmin();
    } else {
        error.classList.add('visible');
        input.value = '';
        input.focus();
    }
}

function cerrarSesionAdmin() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    verificarSesionAdmin();
    // Cerrar panel si está abierto
    const drawer = document.getElementById('admin-drawer');
    const overlay = document.getElementById('admin-overlay');
    if (drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// ============================================
// WEB3FORMS — Setup AJAX para evitar redirect
// ============================================
function setupWeb3Forms() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-submit');
        const originalText = btn.textContent;
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        try {
            const formData = new FormData(form);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.status === 200) {
                status.className = 'form-status success';
                status.textContent = '✅ ¡Mensaje enviado! Te responderemos pronto.';
                form.reset();
            } else {
                status.className = 'form-status error';
                status.textContent = '❌ Error: ' + (data.message || 'No se pudo enviar');
            }
        } catch (err) {
            status.className = 'form-status error';
            status.textContent = '❌ Error de conexión. Intenta de nuevo.';
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
            setTimeout(() => {
                status.className = 'form-status';
                status.textContent = '';
            }, 5000);
        }
    });
}

// ============================================
// TECLADO — Atajos y cerrar drawers
// ============================================
document.addEventListener('keydown', (e) => {
    // Escape: cerrar drawers
    if (e.key === 'Escape') {
        const cartDrawer = document.getElementById('cart-drawer');
        const adminDrawer = document.getElementById('admin-drawer');
        const loginModal = document.getElementById('admin-login-modal');

        if (cartDrawer.classList.contains('open')) {
            toggleCart();
        }
        if (adminDrawer.classList.contains('open')) {
            toggleAdmin();
        }
        if (loginModal.classList.contains('open')) {
            cerrarLoginAdmin();
        }
    }

    // Ctrl + Shift + L (L de Login) — abrir login admin
    // Usamos L porque A está ocupado por Chrome (buscador de pestañas)
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        const sesion = localStorage.getItem(ADMIN_SESSION_KEY);
        if (sesion === 'true') {
            toggleAdmin(); // Ya logueado, abrir panel directo
        } else {
            mostrarLoginAdmin(); // No logueado, pedir contraseña
        }
    }
});

// ============================================
// ACCESO POR URL — #admin al final de la URL
// ============================================
function checkUrlHash() {
    if (window.location.hash === '#admin') {
        const sesion = localStorage.getItem(ADMIN_SESSION_KEY);
        if (sesion === 'true') {
            toggleAdmin();
        } else {
            mostrarLoginAdmin();
        }
        // Limpiar el hash para no quedar en la URL
        history.replaceState(null, null, window.location.pathname);
    }
}

// Verificar al cargar y cuando cambia el hash
window.addEventListener('load', checkUrlHash);
window.addEventListener('hashchange', checkUrlHash);
