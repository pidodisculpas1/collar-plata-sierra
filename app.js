// ============================================
// COLLAR ÉTNICO SIERRA — App Logic v3
// Carrito + Admin + Web3Forms + Social + Modo Oscuro + Modal + Filtros
// ============================================

// ---------- Datos iniciales de productos ----------
const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: "Collar Étnico Sierra",
        descripcion: "Pieza única hecha a mano en los Andes. Plata de ley con detalles étnicos inspirados en la cultura sierra.",
        precio: 89,
        stock: 5,
        imagen: "png-clipart-locket-necklace-silver-chain-jewellery-necklace-white-pendant.png",
        categoria: "Plata"
    },
    {
        id: 2,
        nombre: "Collar Luna Andina",
        descripcion: "Plata con piedra luna natural, inspirado en los cielos estrellados del Altiplano peruano.",
        precio: 120,
        stock: 3,
        imagen: "collar-luna.png",
        categoria: "Plata"
    },
    {
        id: 3,
        nombre: "Collar Sol de Oro",
        descripcion: "Dorado con detalles de sol inca, edición limitada de coleccionista. Brillo ancestral.",
        precio: 150,
        stock: 2,
        imagen: "collar-oro.png",
        categoria: "Oro"
    },
    {
        id: 4,
        nombre: "Collar Estrella Amazónica",
        descripcion: "Cobre con estrella tallada a mano, traída desde la selva peruana con energía tropical.",
        precio: 75,
        stock: 8,
        imagen: "collar-estrella.png",
        categoria: "Cobre"
    },
    {
        id: 5,
        nombre: "Collar Mariposa Tropical",
        descripcion: "Bronce con alas de mariposa, inspirado en la biodiversidad de Madre de Dios.",
        precio: 95,
        stock: 6,
        imagen: "collar-mariposa.png",
        categoria: "Bronce"
    },
    {
        id: 6,
        nombre: "Collar Corazón Azul",
        descripcion: "Plata de ley con corazón de ópalo azul. Símbolo de amor y pureza andina.",
        precio: 110,
        stock: 4,
        imagen: "collar-corazón-azul.png",
        categoria: "Plata"
    }
];

// ---------- Estado global ----------
let productos = [];
let carrito = [];
let nextId = 7;
let categoriaActiva = 'todos';

// ---------- Inicialización ----------
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarCarrito();
    cargarTema();
    contadorVisitas();
    renderizarProductos(productos);
    actualizarContadoresCategorias();
    actualizarBadge();
    setupWeb3Forms();
    verificarSesionAdmin();
    checkUrlHash();
    setupScrollAnimations();

    // Nuevas inicializaciones
    initGallery();
    initSocialProof();
    cargarIdioma();
    cargarTextos();
});

// ============================================
// TEMA OSCURO / CLARO
// ============================================
function cargarTema() {
    const tema = localStorage.getItem('tema_sierra') || 'light';
    document.documentElement.setAttribute('data-theme', tema);
    actualizarIconoTema(tema);
}

function toggleTheme() {
    const actual = document.documentElement.getAttribute('data-theme') || 'light';
    const nuevo = actual === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nuevo);
    localStorage.setItem('tema_sierra', nuevo);
    actualizarIconoTema(nuevo);
}

function actualizarIconoTema(tema) {
    const icono = document.getElementById('theme-icon');
    if (icono) {
        icono.textContent = tema === 'light' ? '🌙' : '☀️';
    }
}

// ============================================
// CONTADOR DE VISITAS
// ============================================
function contadorVisitas() {
    let visitas = parseInt(localStorage.getItem('visitas_sierra') || '0');
    // Solo incrementar si no se ha contado en esta sesión (simple)
    if (!sessionStorage.getItem('visita_contada')) {
        visitas += 1;
        localStorage.setItem('visitas_sierra', visitas.toString());
        sessionStorage.setItem('visita_contada', 'true');
    }
    const counter = document.getElementById('visit-counter');
    if (counter) {
        // Animación de conteo
        let actual = 0;
        const interval = setInterval(() => {
            actual += Math.ceil(visitas / 20);
            if (actual >= visitas) {
                actual = visitas;
                clearInterval(interval);
            }
            counter.textContent = actual.toLocaleString();
        }, 30);
    }
}

// ============================================
// PRODUCTOS — Cargar / Guardar / Persistencia
// ============================================
function cargarProductos() {
    const guardado = localStorage.getItem('productos_sierra');
    if (guardado) {
        try {
            productos = JSON.parse(guardado);
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
        card.onclick = (e) => {
            // Si no se hizo clic en un botón, abrir modal
            if (!e.target.closest('button') && !e.target.closest('a')) {
                abrirModalProducto(producto.id);
            }
        };
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=${encodeURIComponent(producto.nombre)}'">
                ${stockDisponible <= 3 && stockDisponible > 0 ? `<span class="product-stock-badge low">¡Solo ${stockDisponible}!</span>` : ''}
                ${stockDisponible === 0 ? `<span class="product-stock-badge out">Agotado</span>` : ''}
            </div>
            <div class="product-info">
                <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--color-accent);margin-bottom:4px;display:block;">${producto.categoria}</span>
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-desc">${producto.descripcion}</p>
                <p class="product-price">S/ ${producto.precio.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn-add" id="btn-${producto.id}" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})" ${stockDisponible === 0 ? 'disabled' : ''}>
                        ${stockDisponible === 0 ? 'Agotado' : 'Agregar al carrito'}
                    </button>
                    <a href="https://wa.me/51987654321?text=${encodeURIComponent(`Hola, quiero reservar el ${producto.nombre} por S/ ${producto.precio.toFixed(2)}`)}" 
                       class="btn-wa" target="_blank" rel="noopener" title="Reservar por WhatsApp" 
                       onclick="event.stopPropagation()"
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
    aplicarFiltros(texto, categoriaActiva);
}

// ---------- Filtro por categoría ----------
function filtrarPorCategoria(categoria) {
    categoriaActiva = categoria;

    // Actualizar chips UI
    document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('chip-active', chip.dataset.category === categoria);
    });

    const texto = document.getElementById('busqueda').value.toLowerCase().trim();
    aplicarFiltros(texto, categoria);
}

function aplicarFiltros(texto, categoria) {
    let filtrados = productos;

    if (categoria !== 'todos') {
        filtrados = filtrados.filter(p => p.categoria === categoria);
    }

    if (texto) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(texto) ||
            p.descripcion.toLowerCase().includes(texto) ||
            p.categoria.toLowerCase().includes(texto)
        );
    }

    renderizarProductos(filtrados);
}

function actualizarContadoresCategorias() {
    const categorias = ['todos', 'Plata', 'Oro', 'Cobre', 'Bronce'];
    categorias.forEach(cat => {
        const count = cat === 'todos' ? productos.length : productos.filter(p => p.categoria === cat).length;
        const el = document.getElementById(`count-${cat.toLowerCase()}`);
        if (el) el.textContent = count;
    });
}

// ============================================
// MODAL DE DETALLE DE PRODUCTO
// ============================================
function abrirModalProducto(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;

    const enCarrito = carrito.find(item => item.id === idProducto);
    const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;
    const stockDisponible = producto.stock - cantidadEnCarrito;

    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('product-modal-overlay');
    const content = document.getElementById('product-modal-content');

    content.innerHTML = `
        <div class="modal-image-section">
            <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=${encodeURIComponent(producto.nombre)}'">
        </div>
        <div class="modal-info-section">
            <span class="modal-category">${producto.categoria}</span>
            <h2 class="modal-title">${producto.nombre}</h2>
            <p class="modal-desc">${producto.descripcion}</p>
            <p class="modal-price">S/ ${producto.precio.toFixed(2)}</p>
            <p class="modal-stock">📦 Stock disponible: ${stockDisponible} unidades</p>
            <div class="modal-actions">
                <button class="modal-btn-add" onclick="agregarAlCarrito(${producto.id}); cerrarModalProducto();" ${stockDisponible === 0 ? 'disabled' : ''}>
                    ${stockDisponible === 0 ? 'Agotado' : '🛒 Agregar al carrito'}
                </button>
                <a href="https://wa.me/51987654321?text=${encodeURIComponent(`Hola, quiero reservar el ${producto.nombre} por S/ ${producto.precio.toFixed(2)}`)}" 
                   class="modal-btn-wa" target="_blank" rel="noopener" title="Reservar por WhatsApp"
                   ${stockDisponible === 0 ? 'style="opacity:0.4;pointer-events:none"' : ''}>💬</a>
            </div>
        </div>
    `;

    modal.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function cerrarModalProducto() {
    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('product-modal-overlay');
    modal.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
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
    const categoria = document.getElementById('admin-categoria').value;
    let imagen = document.getElementById('admin-imagen').value.trim();

    if (!imagen) {
        imagen = 'https://placehold.co/400x400?text=' + encodeURIComponent(nombre);
    }

    if (!nombre || !descripcion || isNaN(precio) || isNaN(stock) || !categoria) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }

    if (editId) {
        const producto = productos.find(p => p.id === parseInt(editId));
        if (producto) {
            producto.nombre = nombre;
            producto.descripcion = descripcion;
            producto.precio = precio;
            producto.stock = stock;
            producto.categoria = categoria;
            producto.imagen = imagen;
        }
    } else {
        const nuevoProducto = {
            id: nextId++,
            nombre,
            descripcion,
            precio,
            stock,
            imagen,
            categoria
        };
        productos.push(nuevoProducto);
    }

    guardarProductos();
    renderizarProductos(productos);
    renderizarAdminProductos();
    actualizarContadoresCategorias();
    cancelarEdicion();

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

    document.getElementById('admin-edit-id').value = producto.id;
    document.getElementById('admin-nombre').value = producto.nombre;
    document.getElementById('admin-desc').value = producto.descripcion;
    document.getElementById('admin-precio').value = producto.precio;
    document.getElementById('admin-stock').value = producto.stock;
    document.getElementById('admin-categoria').value = producto.categoria || 'Plata';
    document.getElementById('admin-imagen').value = producto.imagen;

    document.getElementById('admin-form-title').textContent = '✏️ Editar Producto';
    document.getElementById('admin-submit-btn').textContent = 'Guardar Cambios';
    document.getElementById('admin-cancel-btn').style.display = 'inline-block';

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
    carrito = carrito.filter(item => item.id !== idProducto);
    guardarProductos();
    guardarCarrito();
    actualizarBadge();
    renderizarProductos(productos);
    renderizarAdminProductos();
    actualizarContadoresCategorias();
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
                    <p class="admin-product-meta">S/ ${p.precio.toFixed(2)} · Stock: ${p.stock} · ${p.categoria} · ID: ${p.id}</p>
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

            const validos = importados.filter(p => p.nombre && p.precio && p.stock !== undefined);
            validos.forEach(p => {
                p.id = nextId++;
                if (!p.categoria) p.categoria = 'Plata';
                if (!p.imagen) p.imagen = 'https://placehold.co/400x400?text=Sin+Imagen';
            });

            productos = [...productos, ...validos];
            guardarProductos();
            renderizarProductos(productos);
            renderizarAdminProductos();
            actualizarContadoresCategorias();

            alert(`✅ ${validos.length} productos importados correctamente`);
        } catch (err) {
            alert('❌ Error al leer el archivo: ' + err.message);
        }
    };
    reader.readAsText(file);
    input.value = '';
}

// ============================================
// ADMIN LOGIN — Contraseña protegida + Sesión persistente
// ============================================
const ADMIN_PASSWORD = 'sierra2026';
const ADMIN_SESSION_KEY = 'admin_sierra_session';

document.addEventListener('DOMContentLoaded', () => {
    verificarSesionAdmin();
});

function verificarSesionAdmin() {
    const btnAdmin = document.getElementById('btn-admin');
    const sesion = localStorage.getItem(ADMIN_SESSION_KEY);

    if (sesion === 'true') {
        btnAdmin.style.display = 'flex';
        btnAdmin.classList.add('visible');
        btnAdmin.onclick = toggleAdmin;
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
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        cerrarLoginAdmin();
        verificarSesionAdmin();
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
    if (!form) return;

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
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.about-section, .contact-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
}

// Agregar clase CSS dinámica para animaciones
const style = document.createElement('style');
style.textContent = `
    .animate-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ============================================
// TECLADO — Atajos y cerrar drawers
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const cartDrawer = document.getElementById('cart-drawer');
        const adminDrawer = document.getElementById('admin-drawer');
        const loginModal = document.getElementById('admin-login-modal');
        const productModal = document.getElementById('product-modal');

        if (productModal && productModal.classList.contains('open')) {
            cerrarModalProducto();
            return;
        }
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

    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        const sesion = localStorage.getItem(ADMIN_SESSION_KEY);
        if (sesion === 'true') {
            toggleAdmin();
        } else {
            mostrarLoginAdmin();
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
        history.replaceState(null, null, window.location.pathname);
    }
}

window.addEventListener('load', checkUrlHash);
window.addEventListener('hashchange', checkUrlHash);


// ============================================
// GALERÍA CARRUSEL
// ============================================
let galleryIndex = 0;
let galleryInterval;

function initGallery() {
    const track = document.getElementById('gallery-track');
    const dotsContainer = document.getElementById('gallery-dots');
    if (!track || !dotsContainer) return;

    const slides = track.querySelectorAll('.gallery-slide');

    // Crear dots
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToGallerySlide(i);
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dotsContainer.appendChild(dot);
    });

    // Auto-play
    startGalleryAutoPlay();

    // Pausar en hover
    const carousel = document.getElementById('gallery-carousel');
    carousel.addEventListener('mouseenter', stopGalleryAutoPlay);
    carousel.addEventListener('mouseleave', startGalleryAutoPlay);
}

function moveGallery(direction) {
    const track = document.getElementById('gallery-track');
    const slides = track.querySelectorAll('.gallery-slide');
    galleryIndex = (galleryIndex + direction + slides.length) % slides.length;
    updateGallery();
}

function goToGallerySlide(index) {
    galleryIndex = index;
    updateGallery();
}

function updateGallery() {
    const track = document.getElementById('gallery-track');
    const dots = document.querySelectorAll('.gallery-dot');
    if (!track) return;

    track.style.transform = `translateX(-${galleryIndex * 100}%)`;

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === galleryIndex);
    });
}

function startGalleryAutoPlay() {
    stopGalleryAutoPlay();
    galleryInterval = setInterval(() => moveGallery(1), 5000);
}

function stopGalleryAutoPlay() {
    if (galleryInterval) clearInterval(galleryInterval);
}

// ============================================
// SOCIAL PROOF NOTIFICATION
// ============================================
function initSocialProof() {
    const socialProof = document.getElementById('social-proof');
    if (!socialProof) return;

    // Mostrar después de 3 segundos
    setTimeout(() => {
        socialProof.classList.remove('hidden');
    }, 3000);

    // Actualizar número cada 8-15 segundos
    setInterval(() => {
        const countEl = document.getElementById('social-proof-count');
        if (countEl && !socialProof.classList.contains('hidden')) {
            const current = parseInt(countEl.textContent);
            const change = Math.random() > 0.5 ? 1 : -1;
            const newCount = Math.max(3, Math.min(25, current + change));
            countEl.textContent = newCount;
        }
    }, 8000 + Math.random() * 7000);
}

function cerrarSocialProof() {
    const socialProof = document.getElementById('social-proof');
    if (socialProof) {
        socialProof.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => socialProof.classList.add('hidden'), 300);
    }
}

// Agregar animación fadeOut
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(-30px); }
    }
`;
document.head.appendChild(fadeOutStyle);

// ============================================
// SELECTOR DE IDIOMA
// ============================================
let idiomaActual = 'es';

function toggleLangMenu() {
    const selector = document.getElementById('lang-selector');
    selector.classList.toggle('open');

    // Cerrar al hacer clic fuera
    if (selector.classList.contains('open')) {
        setTimeout(() => {
            document.addEventListener('click', closeLangMenuOutside);
        }, 10);
    }
}

function closeLangMenuOutside(e) {
    const selector = document.getElementById('lang-selector');
    if (!selector.contains(e.target)) {
        selector.classList.remove('open');
        document.removeEventListener('click', closeLangMenuOutside);
    }
}

function cambiarIdioma(lang) {
    idiomaActual = lang;
    localStorage.setItem('idioma_sierra', lang);

    // Actualizar botón
    const btn = document.getElementById('current-lang');
    if (btn) btn.textContent = lang === 'es' ? '🇪🇸 ES' : '🇺🇸 EN';

    // Actualizar opciones activas
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    // Cerrar menú
    document.getElementById('lang-selector').classList.remove('open');

    // Aplicar traducciones
    aplicarTraducciones();
}

function aplicarTraducciones() {
    // Traducir elementos con data-es/data-en
    document.querySelectorAll('[data-es][data-en]').forEach(el => {
        const texto = el.getAttribute(`data-${idiomaActual}`);
        if (texto) {
            // Preservar elementos hijos si los hay, o reemplazar textContent
            if (el.children.length === 0) {
                el.textContent = texto;
            } else {
                // Para elementos con HTML interno, buscar el nodo de texto principal
                const textNode = Array.from(el.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
                if (textNode) {
                    textNode.textContent = texto;
                } else {
                    el.innerHTML = texto + el.innerHTML.replace(el.textContent, '');
                }
            }
        }
    });

    // Traducir placeholders
    document.querySelectorAll('[data-placeholder-es][data-placeholder-en]').forEach(el => {
        el.placeholder = el.getAttribute(`data-placeholder-${idiomaActual}`);
    });

    // Traducir atributos de productos dinámicos
    actualizarTextosProductos();
}

function actualizarTextosProductos() {
    // Re-renderizar productos para aplicar traducciones
    const texto = document.getElementById('busqueda').value.toLowerCase().trim();
    aplicarFiltros(texto, categoriaActiva);
}

function cargarIdioma() {
    const guardado = localStorage.getItem('idioma_sierra') || 'es';
    cambiarIdioma(guardado);
}

// ============================================
// MODIFICAR RENDERIZAR PRODUCTOS para soporte multilingüe
// ============================================
// Sobrescribir la función renderizarProductos para incluir traducciones
const renderizarProductosOriginal = renderizarProductos;
renderizarProductos = function(lista) {
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

    const textos = {
        es: { agregar: 'Agregar al carrito', agotado: 'Agotado', solo: '¡Solo', unidades: '!' },
        en: { agregar: 'Add to cart', agotado: 'Sold out', solo: 'Only', unidades: ' left!' }
    };
    const t = textos[idiomaActual];

    lista.forEach((producto, index) => {
        const enCarrito = carrito.find(item => item.id === producto.id);
        const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;
        const stockDisponible = producto.stock - cantidadEnCarrito;

        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.onclick = (e) => {
            if (!e.target.closest('button') && !e.target.closest('a')) {
                abrirModalProducto(producto.id);
            }
        };
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=${encodeURIComponent(producto.nombre)}'">
                ${stockDisponible <= 3 && stockDisponible > 0 ? `<span class="product-stock-badge low">${t.solo} ${stockDisponible}${t.unidades}</span>` : ''}
                ${stockDisponible === 0 ? `<span class="product-stock-badge out">${t.agotado}</span>` : ''}
            </div>
            <div class="product-info">
                <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--color-accent);margin-bottom:4px;display:block;">${producto.categoria}</span>
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-desc">${producto.descripcion}</p>
                <p class="product-price">S/ ${producto.precio.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn-add" id="btn-${producto.id}" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})" ${stockDisponible === 0 ? 'disabled' : ''}>
                        ${stockDisponible === 0 ? t.agotado : t.agregar}
                    </button>
                    <a href="https://wa.me/51987654321?text=${encodeURIComponent(`Hola, quiero reservar el ${producto.nombre} por S/ ${producto.precio.toFixed(2)}`)}" 
                       class="btn-wa" target="_blank" rel="noopener" title="Reservar por WhatsApp" 
                       onclick="event.stopPropagation()"
                       ${stockDisponible === 0 ? 'style="opacity:0.4;pointer-events:none"' : ''}>💬</a>
                </div>
                <p class="product-message" id="msg-${producto.id}"></p>
            </div>
        `;
        container.appendChild(card);
    });
};

// ============================================
// MODIFICAR RENDERIZAR CARRITO para soporte multilingüe
// ============================================
const renderizarCarritoOriginal = renderizarCarrito;
renderizarCarrito = function() {
    const container = document.getElementById('cart-items');
    const footer = document.getElementById('cart-footer');

    const textos = {
        es: { vacio: 'Tu carrito está vacío', hint: 'Agrega productos para comenzar', subtotal: 'Subtotal', total: 'Total', checkout: 'Reservar todo por WhatsApp', vaciar: 'Vaciar carrito', eliminar: 'Eliminar' },
        en: { vacio: 'Your cart is empty', hint: 'Add products to get started', subtotal: 'Subtotal', total: 'Total', checkout: 'Reserve all via WhatsApp', vaciar: 'Empty cart', eliminar: 'Remove' }
    };
    const t = textos[idiomaActual];

    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">🛒</span>
                <p>${t.vacio}</p>
                <span class="cart-empty-hint">${t.hint}</span>
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
                <button class="cart-item-remove" onclick="eliminarDelCarrito(${item.id})">${t.eliminar}</button>
            </div>
        `;
    });

    container.innerHTML = html;

    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('cart-subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `S/ ${subtotal.toFixed(2)}`;

    // Actualizar textos del footer
    const subtotalLabel = footer.querySelector('.cart-subtotal span:first-child');
    const totalLabel = footer.querySelector('.cart-total span:first-child');
    const checkoutBtn = footer.querySelector('.btn-checkout');
    const clearBtn = footer.querySelector('.btn-clear');

    if (subtotalLabel) subtotalLabel.textContent = t.subtotal;
    if (totalLabel) totalLabel.textContent = t.total;
    if (checkoutBtn) checkoutBtn.textContent = t.checkout;
    if (clearBtn) clearBtn.textContent = t.vaciar;
};

// ============================================
// MODIFICAR INICIALIZACIÓN
// ============================================
// Guardar referencia al DOMContentLoaded original y agregar nuevas inicializaciones
const initOriginal = document.addEventListener.bind(document);
// Las funciones de inicialización se ejecutarán cuando el DOM esté listo
// Agregar al final del script existente


// ============================================
// EDITOR DE TEXTOS DEL SITIO
// ============================================

// Textos predeterminados (español)
const TEXTOS_PREDETERMINADOS = {
    // Hero
    'logo': 'Collar Étnico Sierra',
    'hero-tag': '✨ Edición Limitada 2026',
    'hero-title': 'Elegancia Hecha a Mano<br>en los Andes',
    'hero-subtitle': 'Joyería artesanal peruana con alma, tradición y diseño contemporáneo. Cada pieza cuenta una historia.',
    'hero-btn-1': 'Ver Colección',
    'hero-btn-2': 'Contáctanos',
    'hero-stat-1-num': '500+',
    'hero-stat-1-label': 'PIEZAS VENDIDAS',
    'hero-stat-2-num': '100%',
    'hero-stat-2-label': 'ARTESANAL',
    'hero-stat-3-num': '4.9★',
    'hero-stat-3-label': 'CALIFICACIÓN',

    // About
    'about-tag': 'NUESTRA HISTORIA',
    'about-title': 'Tradición que se<br>lleva puesta',
    'about-text-1': 'En Collar Étnico Sierra fusionamos la rica herencia orfebre del Perú con diseños contemporáneos. Cada pieza es elaborada artesanalmente por maestros joyeros que ponen su corazón en cada detalle.',
    'about-text-2': 'Utilizamos plata de ley 925, oro de alto quilataje y piedras naturales de los Andes. Técnicas transmitidas de generación en generación, ahora al alcance de un clic.',
    'about-feature-1': 'Hecho a mano',
    'about-feature-2': 'Materiales sostenibles',
    'about-feature-3': 'Envío a todo el Perú',

    // Gallery
    'gallery-title': 'Nuestra Galería',
    'gallery-subtitle': 'Un vistazo a nuestra artesanía',

    // Search
    'search-placeholder': 'Buscar collares por nombre o descripción...',

    // Testimonials
    'testimonials-title': 'Lo que dicen nuestros clientes',
    'testimonials-subtitle': 'Experiencias reales de amantes de la joyería artesanal',
    'testimonial-1-text': 'El collar de luna es simplemente hermoso. Se nota la dedicación en cada detalle. Llegó perfectamente empaquetado y el servicio al cliente fue excepcional.',
    'testimonial-1-name': 'María A.',
    'testimonial-1-location': 'Lima, Perú',
    'testimonial-2-text': 'Compré el collar étnico sierra como regalo para mi madre y quedó encantada. La calidad de la plata es excelente y el diseño es único. Definitivamente volveré a comprar.',
    'testimonial-2-name': 'Juan C.',
    'testimonial-2-location': 'Arequipa, Perú',
    'testimonial-3-text': 'La atención es personalizada y el envío fue muy rápido. El collar de mariposa superó mis expectativas. Cada pieza cuenta una historia y eso se siente.',
    'testimonial-3-name': 'Lucía R.',
    'testimonial-3-location': 'Cusco, Perú',

    // Contact
    'contact-title': 'Contáctanos',
    'contact-subtitle': '¿Tienes dudas? Escríbenos y te responderemos en menos de 24 horas.',
    'contact-label-name': 'Nombre',
    'contact-label-email': 'Email',
    'contact-label-message': 'Mensaje',
    'contact-btn-submit': 'Enviar mensaje',

    // Footer
    'footer-logo': '💎 Collar Étnico Sierra',
    'footer-desc': 'Joyería artesanal peruana con alma andina.',
    'footer-copy': '© 2026 Collar Étnico Sierra — Todos los derechos reservados',
    'footer-visits': 'artesanos han visitado esta tienda',

    // Social Proof
    'social-proof-text': 'personas están viendo esta tienda ahora',

    // Cart
    'cart-title': 'Tu Carrito',
    'cart-empty': 'Tu carrito está vacío',
    'cart-empty-hint': 'Agrega productos para comenzar',

    // Admin
    'admin-login-title': '🔐 Acceso Admin',
    'admin-login-hint': 'Ingresa la contraseña para administrar productos.',
    'admin-login-label': 'Contraseña',
    'admin-login-btn': 'Entrar al Panel',
    'admin-login-error': '❌ Contraseña incorrecta',
    'admin-drawer-title': '⚙️ Panel de Administración'
};

// Grupos de textos para las pestañas
const TEXT_GROUPS = {
    'hero': ['logo', 'hero-tag', 'hero-title', 'hero-subtitle', 'hero-btn-1', 'hero-btn-2', 'hero-stat-1-num', 'hero-stat-1-label', 'hero-stat-2-num', 'hero-stat-2-label', 'hero-stat-3-num', 'hero-stat-3-label'],
    'about': ['about-tag', 'about-title', 'about-text-1', 'about-text-2', 'about-feature-1', 'about-feature-2', 'about-feature-3'],
    'gallery': ['gallery-title', 'gallery-subtitle'],
    'testimonials': ['testimonials-title', 'testimonials-subtitle', 'testimonial-1-text', 'testimonial-1-name', 'testimonial-1-location', 'testimonial-2-text', 'testimonial-2-name', 'testimonial-2-location', 'testimonial-3-text', 'testimonial-3-name', 'testimonial-3-location'],
    'contact': ['contact-title', 'contact-subtitle', 'contact-label-name', 'contact-label-email', 'contact-label-message', 'contact-btn-submit'],
    'footer': ['footer-logo', 'footer-desc', 'footer-copy', 'footer-visits'],
    'cart': ['cart-title', 'cart-empty', 'cart-empty-hint'],
    'admin': ['admin-login-title', 'admin-login-hint', 'admin-login-label', 'admin-login-btn', 'admin-login-error', 'admin-drawer-title']
};

// Nombres amigables para mostrar en el editor
const TEXT_LABELS = {
    'logo': 'Logo / Nombre de la tienda',
    'hero-tag': 'Hero - Etiqueta superior',
    'hero-title': 'Hero - Título principal',
    'hero-subtitle': 'Hero - Subtítulo',
    'hero-btn-1': 'Hero - Botón principal',
    'hero-btn-2': 'Hero - Botón secundario',
    'hero-stat-1-num': 'Hero - Stat 1 número',
    'hero-stat-1-label': 'Hero - Stat 1 etiqueta',
    'hero-stat-2-num': 'Hero - Stat 2 número',
    'hero-stat-2-label': 'Hero - Stat 2 etiqueta',
    'hero-stat-3-num': 'Hero - Stat 3 número',
    'hero-stat-3-label': 'Hero - Stat 3 etiqueta',
    'about-tag': 'Nosotros - Etiqueta',
    'about-title': 'Nosotros - Título',
    'about-text-1': 'Nosotros - Párrafo 1',
    'about-text-2': 'Nosotros - Párrafo 2',
    'about-feature-1': 'Nosotros - Feature 1',
    'about-feature-2': 'Nosotros - Feature 2',
    'about-feature-3': 'Nosotros - Feature 3',
    'gallery-title': 'Galería - Título',
    'gallery-subtitle': 'Galería - Subtítulo',
    'search-placeholder': 'Búsqueda - Placeholder',
    'testimonials-title': 'Testimonios - Título',
    'testimonials-subtitle': 'Testimonios - Subtítulo',
    'testimonial-1-text': 'Testimonio 1 - Texto',
    'testimonial-1-name': 'Testimonio 1 - Nombre',
    'testimonial-1-location': 'Testimonio 1 - Ubicación',
    'testimonial-2-text': 'Testimonio 2 - Texto',
    'testimonial-2-name': 'Testimonio 2 - Nombre',
    'testimonial-2-location': 'Testimonio 2 - Ubicación',
    'testimonial-3-text': 'Testimonio 3 - Texto',
    'testimonial-3-name': 'Testimonio 3 - Nombre',
    'testimonial-3-location': 'Testimonio 3 - Ubicación',
    'contact-title': 'Contacto - Título',
    'contact-subtitle': 'Contacto - Subtítulo',
    'contact-label-name': 'Contacto - Label Nombre',
    'contact-label-email': 'Contacto - Label Email',
    'contact-label-message': 'Contacto - Label Mensaje',
    'contact-btn-submit': 'Contacto - Botón Enviar',
    'footer-logo': 'Footer - Logo',
    'footer-desc': 'Footer - Descripción',
    'footer-copy': 'Footer - Copyright',
    'footer-visits': 'Footer - Texto visitas',
    'social-proof-text': 'Notificación - Texto',
    'cart-title': 'Carrito - Título',
    'cart-empty': 'Carrito - Vacío',
    'cart-empty-hint': 'Carrito - Hint',
    'admin-login-title': 'Admin - Título login',
    'admin-login-hint': 'Admin - Hint login',
    'admin-login-label': 'Admin - Label contraseña',
    'admin-login-btn': 'Admin - Botón entrar',
    'admin-login-error': 'Admin - Error',
    'admin-drawer-title': 'Admin - Título panel'
};

let textosPersonalizados = {};

function cargarTextos() {
    const guardado = localStorage.getItem('textos_sierra');
    if (guardado) {
        try {
            textosPersonalizados = JSON.parse(guardado);
        } catch (e) {
            textosPersonalizados = {};
        }
    }
    aplicarTextosPersonalizados();
}

function guardarTextos() {
    // Recolectar todos los valores actuales del formulario
    document.querySelectorAll('.text-editor-field input, .text-editor-field textarea').forEach(input => {
        const id = input.dataset.textId;
        if (id) {
            textosPersonalizados[id] = input.value;
        }
    });

    localStorage.setItem('textos_sierra', JSON.stringify(textosPersonalizados));
    aplicarTextosPersonalizados();

    // Mostrar confirmación
    const status = document.createElement('div');
    status.className = 'form-status success';
    status.textContent = '✅ Textos guardados correctamente';
    status.style.display = 'block';
    const container = document.getElementById('text-editor-content');
    if (container) {
        container.parentElement.insertBefore(status, container);
        setTimeout(() => status.remove(), 3000);
    }
}

function aplicarTextosPersonalizados() {
    // Aplicar textos personalizados a los elementos del DOM
    Object.entries(textosPersonalizados).forEach(([id, valor]) => {
        const elements = document.querySelectorAll(`[data-text-id="${id}"]`);
        elements.forEach(el => {
            if (el.tagName === 'INPUT') {
                el.placeholder = valor;
            } else if (el.tagName === 'A' || el.tagName === 'BUTTON') {
                // Para botones y links, actualizar textContent preservando iconos
                const icon = el.querySelector('span, i, svg');
                if (icon) {
                    // Si tiene icono, solo cambiar el texto
                    const textNode = Array.from(el.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
                    if (textNode) {
                        textNode.textContent = valor;
                    } else {
                        el.insertBefore(document.createTextNode(valor + ' '), icon);
                    }
                } else {
                    el.textContent = valor;
                }
            } else {
                // Para elementos con data-es/data-en, actualizar también esos atributos
                el.innerHTML = valor;
                if (el.hasAttribute('data-es')) {
                    el.setAttribute('data-es', valor);
                }
                if (el.hasAttribute('data-en')) {
                    // Mantener el inglés si existe, o usar el mismo valor
                    const enVal = TEXTOS_PREDETERMINADOS[id + '-en'] || valor;
                    el.setAttribute('data-en', enVal);
                }
            }
        });
    });
}

function resetearTextos() {
    if (!confirm('¿Estás seguro de restaurar todos los textos a los valores predeterminados?')) return;

    textosPersonalizados = {};
    localStorage.removeItem('textos_sierra');

    // Restaurar valores predeterminados en el DOM
    Object.entries(TEXTOS_PREDETERMINADOS).forEach(([id, valor]) => {
        const elements = document.querySelectorAll(`[data-text-id="${id}"]`);
        elements.forEach(el => {
            if (el.tagName === 'INPUT') {
                el.placeholder = valor;
            } else {
                el.innerHTML = valor;
                if (el.hasAttribute('data-es')) el.setAttribute('data-es', valor);
                if (el.hasAttribute('data-en')) el.setAttribute('data-en', valor);
            }
        });
    });

    // Recargar el editor
    const activeTab = document.querySelector('.text-tab.active');
    if (activeTab) {
        switchTextTab(activeTab.dataset.tab);
    }

    const status = document.createElement('div');
    status.className = 'form-status success';
    status.textContent = '✅ Textos restaurados a predeterminados';
    status.style.display = 'block';
    const container = document.getElementById('text-editor-content');
    if (container) {
        container.parentElement.insertBefore(status, container);
        setTimeout(() => status.remove(), 3000);
    }
}

function exportarTextos() {
    const dataStr = JSON.stringify(textosPersonalizados, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `textos-sierra-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importarTextos(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importados = JSON.parse(e.target.result);
            if (typeof importados !== 'object') {
                alert('El archivo no contiene textos válidos');
                return;
            }

            textosPersonalizados = { ...textosPersonalizados, ...importados };
            guardarTextos();
            aplicarTextosPersonalizados();

            // Recargar editor
            const activeTab = document.querySelector('.text-tab.active');
            if (activeTab) switchTextTab(activeTab.dataset.tab);

            alert(`✅ ${Object.keys(importados).length} textos importados correctamente`);
        } catch (err) {
            alert('❌ Error al leer el archivo: ' + err.message);
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function switchTextTab(tabName) {
    // Actualizar pestañas
    document.querySelectorAll('.text-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Generar campos del editor
    const container = document.getElementById('text-editor-content');
    if (!container) return;

    const ids = TEXT_GROUPS[tabName] || [];
    let html = '';

    ids.forEach(id => {
        const label = TEXT_LABELS[id] || id;
        const valorActual = textosPersonalizados[id] || TEXTOS_PREDETERMINADOS[id] || '';
        const isLong = valorActual.length > 60 || valorActual.includes('<br>');

        html += `
            <div class="text-editor-field">
                <label>${label}</label>
                ${isLong 
                    ? `<textarea data-text-id="${id}" rows="3">${valorActual.replace(/<br>/g, '
')}</textarea>`
                    : `<input type="text" data-text-id="${id}" value="${valorActual}">`
                }
                <small>ID: ${id}</small>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Modificar toggleAdmin para cargar textos al abrir
const toggleAdminOriginal = toggleAdmin;
toggleAdmin = function() {
    const drawer = document.getElementById('admin-drawer');
    const isOpen = drawer.classList.contains('open');

    if (!isOpen) {
        // Al abrir, cargar textos y mostrar primera pestaña
        cargarTextos();
        setTimeout(() => {
            if (document.querySelector('.text-tab')) {
                switchTextTab('hero');
            }
        }, 100);
    }

    toggleAdminOriginal();
};

// Inicializar textos al cargar la página
const cargarTextosInit = cargarTextos;
// Se ejecutará en el DOMContentLoaded existente
