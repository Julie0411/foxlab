document.addEventListener('DOMContentLoaded', () => {
    // Riferimenti agli elementi DOM del carrello
    const cartList = document.getElementById('cart-list');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElements = document.querySelectorAll('#cart-count');
    const clearCartButton = document.getElementById('clear-cart-btn');

    // Funzione per caricare il carrello da localStorage
    function loadCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        return cart;
    }

    // Funzione per salvare il carrello in localStorage
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Funzione per aggiornare il conteggio del carrello nella navigazione
    function updateCartCount() {
        const cart = loadCart();
        cartCountElements.forEach(el => {
            el.textContent = cart.length; // Conta gli *articoli unici*, non la quantità totale
        });
    }

    // Funzione per visualizzare/rendere gli elementi del carrello nella pagina cart.html
    function renderCart() {
        const cart = loadCart();
        if (!cartList || !cartTotalElement) {
            updateCartCount(); // Se non siamo nella pagina del carrello, aggiorna solo il conteggio
            return;
        }

        cartList.innerHTML = ''; // Pulisci la lista corrente
        let currentSubtotal = 0;
        let totalItemsInCart = 0; // Per contare la somma delle quantità di tutti i prodotti

        if (cart.length === 0) {
            cartList.innerHTML = '<p class="empty-cart-message">Il tuo carrello è vuoto.</p>';
            cartTotalElement.textContent = 'CHF0.00';
            updateCartCount();
            return;
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.setAttribute('data-id', item.id);

            const itemTotalPrice = item.price * item.quantity;
            currentSubtotal += itemTotalPrice;
            totalItemsInCart += item.quantity; // Aggiunge la quantità di ogni prodotto

            itemElement.innerHTML = `
                <div class="product-info">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <p class="product-name">${item.name}</p>
                        <p class="product-price-item">CHF ${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="quantity-controls">
                    <button class="minus-btn">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="item-quantity">
                    <button class="plus-btn">+</button>
                    <button class="remove-item-btn">🗑️</button>
                </div>
                <div class="item-total">CHF ${itemTotalPrice.toFixed(2)}</div>
            `;
            cartList.appendChild(itemElement);
        });

        cartTotalElement.textContent = `CHF ${currentSubtotal.toFixed(2)}`;
        // Correggi l'aggiornamento del conteggio del carrello per mostrare il numero di prodotti unici
        cartCountElements.forEach(el => {
            el.textContent = cart.length; // Continua a mostrare il numero di tipi di prodotti (articoli unici)
        });
        // Se vuoi mostrare il numero totale di prodotti (somma delle quantità), dovresti usare totalItemsInCart per #cart-count
        // Ad esempio: cartCountElements.forEach(el => { el.textContent = totalItemsInCart; });
    }

    // =========================================
    // LOGICA PER LA PAGINA DEL CARRELLO (cart.html)
    // =========================================

    if (cartList) {
        cartList.addEventListener('click', (event) => {
            const target = event.target;
            const cartItemElement = target.closest('.cart-item');

            if (!cartItemElement) return;

            const itemId = cartItemElement.dataset.id;
            let cart = loadCart();
            let itemIndex = cart.findIndex(item => item.id == itemId);

            if (itemIndex === -1) return;

            const quantityInput = cartItemElement.querySelector('.item-quantity');
            let currentQuantity = parseInt(quantityInput.value);

            if (target.classList.contains('minus-btn')) {
                if (currentQuantity > 1) {
                    cart[itemIndex].quantity--;
                }
            } else if (target.classList.contains('plus-btn')) {
                cart[itemIndex].quantity++;
            } else if (target.classList.contains('remove-item-btn')) {
                cart.splice(itemIndex, 1);
            }

            saveCart(cart);
            renderCart();
        });

        cartList.addEventListener('change', (event) => {
            const target = event.target;
            if (target.classList.contains('item-quantity')) {
                const cartItemElement = target.closest('.cart-item');
                if (!cartItemElement) return;

                const itemId = cartItemElement.dataset.id;
                let cart = loadCart();
                let itemIndex = cart.findIndex(item => item.id == itemId);

                if (itemIndex === -1) return;

                let newQuantity = parseInt(target.value);
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1;
                }
                cart[itemIndex].quantity = newQuantity;

                saveCart(cart);
                renderCart();
            }
        });
    }

    if (clearCartButton) {
        clearCartButton.addEventListener('click', () => {
            localStorage.removeItem('cart');
            renderCart();
        });
    }

    // =========================================
    // LA TUA LOGICA ESISTENTE PER AGGIUNGERE AL CARRELLO (dalla pagina shop.html)
    // =========================================

    // Funzione per aggiungere un prodotto al carrello
    window.addProductToCart = (productData) => {
        let cart = loadCart();
        const existingProductIndex = cart.findIndex(item => item.id == productData.id);

        if (existingProductIndex > -1) {
            // Se il prodotto esiste già, incrementa solo la quantità
            cart[existingProductIndex].quantity++;
        } else {
            // Altrimenti, aggiungi il nuovo prodotto con quantità 1
            cart.push({ ...productData, quantity: 1 });
        }
        saveCart(cart);
        updateCartCount(); // Aggiorna il conteggio ovunque
        if (window.location.pathname.includes('cart.html')) {
            renderCart();
        }
    };


    // Il tuo listener 'add-to-cart' dai pulsanti dei prodotti
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const product = event.target.closest('.product');
            const productId = event.target.getAttribute('data-product');
            const productName = product.querySelector('.productDescription')?.textContent || "Prodotto Sconosciuto";
            // Prendi il prezzo dall'elemento corretto, assumendo che sia l'ultimo p prima del bottone
            // o un elemento specifico con una classe per il prezzo
            const priceElement = product.querySelector('.product p:last-of-type'); // Adjust selector if needed
            let productPrice;
            if (priceElement && priceElement.textContent.includes('CHF')) {
                productPrice = parseFloat(priceElement.textContent.replace('CHF ', '').trim());
            } else {
                console.warn("Prezzo non trovato o formato non corretto per il prodotto:", productName);
                productPrice = 0; // Default a 0 o gestisci l'errore
            }

            const imageSrc = product.querySelector('.carousel img')?.src || product.querySelector('img')?.src || '';

            if (isNaN(productPrice)) {
                console.error("Impossibile aggiungere il prodotto al carrello: prezzo non valido per", productName);
                alert("Impossibile aggiungere il prodotto al carrello: prezzo non valido.");
                return;
            }

            const newItem = {
                id: productId,
                name: productName,
                price: productPrice,
                image: imageSrc
            };

            window.addProductToCart(newItem); // Usa la funzione centralizzata
            alert(`${newItem.name} aggiunto al carrello!`);
        });
    });


    // =========================================
    // LA TUA LOGICA ESISTENTE PER I CAROSELLI DEI PRODOTTI (sulla pagina shop.html)
    // =========================================

    document.querySelectorAll('.product').forEach(product => {
        const carouselContainer = product.querySelector('.carousel-container');
        const images = product.querySelectorAll('.carousel img');
        const prevButton = product.querySelector('.prev');
        const nextButton = product.querySelector('.next');

        if (!prevButton || !nextButton || !carouselContainer || images.length === 0) return;

        let currentIndex = 0;

        function updateCarousel() {
            // Assicurati che images[0] esista prima di accedere a offsetWidth
            if (images.length > 0) {
                const offset = -currentIndex * images[0].offsetWidth;
                carouselContainer.style.transform = `translateX(${offset}px)`;
            }
        }

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateCarousel();
        });

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateCarousel();
        });

        updateCarousel();
    });


    // Inizializza il carrello (aggiorna il display in base alla pagina in cui si trova)
    renderCart(); // Chiamata iniziale per mostrare il carrello o il conteggio

});
