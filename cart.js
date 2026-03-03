// GESTIÓN DEL CARRITO DE COMPRAS

class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartUI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botón abrir carrito
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openCart());
        }

        // Botón cerrar carrito
        const closeBtn = document.getElementById('close-cart-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCart());
        }

        // Overlay
        const overlay = document.getElementById('cart-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeCart());
        }

        // Botón checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    loadCart() {
        const saved = localStorage.getItem('artGalleryCart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('artGalleryCart', JSON.stringify(this.items));
    }

    addItem(artwork) {
        // Verificar si ya está en el carrito
        const exists = this.items.find(item => item.id === artwork.id);
        if (exists) {
            alert('Esta obra ya está en tu carrito');
            return;
        }

        this.items.push({
            id: artwork.id,
            titulo: artwork.titulo,
            artista: artwork.artista,
            precio: artwork.precio,
            imagen_url: artwork.imagen_url
        });

        this.saveCart();
        this.updateCartUI();
        this.showNotification('Obra agregada al carrito');
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartUI();
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + parseFloat(item.precio), 0);
    }

    updateCartUI() {
        // Actualizar contador
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            countElement.textContent = this.items.length;
            countElement.style.display = this.items.length > 0 ? 'flex' : 'none';
        }

        // Actualizar contenido del carrito
        this.renderCartItems();
    }

    renderCartItems() {
        const container = document.getElementById('cart-items-container');
        const emptyCart = document.getElementById('empty-cart');
        const cartFooter = document.querySelector('.cart-footer');

        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '';
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';

        container.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.imagen_url}" alt="${item.titulo}" class="cart-item-image">
                <div class="cart-item-info">
                    <h3 class="cart-item-title">${item.titulo}</h3>
                    <p class="cart-item-artist">${item.artista}</p>
                    <p class="cart-item-price">$${this.formatPrice(item.precio)}</p>
                </div>
                <button class="remove-item-btn" onclick="cart.removeItem('${item.id}')">✕</button>
            </div>
        `).join('');

        // Actualizar total
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = `$${this.formatPrice(this.getTotal())}`;
        }
    }

    formatPrice(price) {
        return parseFloat(price).toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    openCart() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
    }

    closeCart() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    }

    showNotification(message) {
        // Simple alert - puedes mejorar esto con un toast más elegante
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #2C2C2C;
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    async checkout() {
        if (this.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        // Preparar items para MercadoPago
        const items = this.items.map(item => ({
            title: `${item.titulo} - ${item.artista}`,
            quantity: 1,
            unit_price: parseFloat(item.precio),
            currency_id: 'CLP'
        }));

        try {
            // Crear preferencia de pago en MercadoPago
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    items: items,
                    back_urls: {
                        success: window.location.origin + '/success.html',
                        failure: window.location.origin + '/failure.html',
                        pending: window.location.origin + '/pending.html'
                    },
                    auto_return: 'approved'
                })
            });

            const preference = await response.json();

            if (preference.init_point) {
                // Redirigir a MercadoPago
                window.location.href = preference.init_point;
            } else {
                throw new Error('No se pudo crear la preferencia de pago');
            }
        } catch (error) {
            console.error('Error en checkout:', error);
            alert('Hubo un error al procesar el pago. Por favor, contacta con la galería.');
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }
}

// Agregar estilos para las animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar carrito global
let cart;
if (typeof window !== 'undefined') {
    cart = new ShoppingCart();
}
