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

    document.querySelectorAll('.carousel').forEach(carousel => {
        const container = carousel.querySelector('.carousel-container');
        const images = container.querySelectorAll('img');
        let current = 0;

        function showImage(index) {
            images.forEach((img, i) => {
                img.style.display = i === index ? 'block' : 'none';
            });
        }

        // Mostra la prima immagine
        showImage(current);

        // Bottoni
        const prev = carousel.querySelector('.prev');
        const next = carousel.querySelector('.next');
        if (prev && next) {
            prev.addEventListener('click', e => {
                e.stopPropagation();
                current = (current - 1 + images.length) % images.length;
                showImage(current);
            });
            next.addEventListener('click', e => {
                e.stopPropagation();
                current = (current + 1) % images.length;
                showImage(current);
            });
        }
    });


    // Inizializza il carrello (aggiorna il display in base alla pagina in cui si trova)
    renderCart(); // Chiamata iniziale per mostrare il carrello o il conteggio

});

// Gestione click sui prodotti nello shop
document.addEventListener('DOMContentLoaded', function() {
    // Solo se siamo nella pagina shop.html
    if (document.querySelector('.product-list')) {
        document.querySelectorAll('.product-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const productDiv = this.closest('.product');
                const productData = {
                    id: productDiv.dataset.productId,
                    name: productDiv.dataset.productName,
                    price: productDiv.dataset.productPrice,
                    img: productDiv.dataset.productImg,
                    description: productDiv.dataset.productDescription
                };
                localStorage.setItem('selectedProduct', JSON.stringify(productData));
                window.location.href = 'product.html';
            });
        });
    }

    // Solo se siamo nella pagina product.html
    if (document.getElementById('product-name')) {
        // 1. Prendi l'id dall'URL
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        // 2. Definisci i dati dei prodotti
        const products = [
            {
                id: "tazza-icone",
                name: "Tazza icone",
                price: 15,
                img: "assets/images/tazza_bassotti.png",
                description: "Tazza in ceramica con icone simpatiche di bassotti e gatti."
            },
            {
                id: "tazza-personalizzabile",
                name: "Tazza personalizzabile con nome",
                price: 25,
                img: "assets/images/tazza_nome.png",
                description: "Tazza in ceramica personalizzabile con il tuo nome."
            },
            {
                id: "gioco-gatti",
                name: "Gioco per gatti",
                price: 20,
                img: "assets/images/gioco_gatti.png",
                description: "Gioco interattivo per gatti, stimola la curiosità e il movimento."
            },
            {
                id: "tagliere-cervo",
                name: "Tagliere in ardesia con cervo",
                price: 30,
                img: "assets/images/tagliere_cervo.png",
                description: "Tagliere in ardesia inciso con sagoma di cervo, elegante e resistente."
            },
            {
                id: "vassoio-love",
                name: "Vassoio love personalizzato",
                price: 35,
                img: "assets/images/tagliere_love_bianco.png",
                description: "Vassoio in ardesia personalizzato con scritta love, disponibile in vari colori."
            },
            {
                id: "orologio-legno-ardesia",
                name: "Orologio in legno e ardesia",
                price: 60,
                img: "assets/images/orologioLegnoArdesia.png",
                description: "Orologio da parete realizzato in legno e ardesia, design unico."
            },
            {
                id: "lampada-luna-3d",
                name: "Lampada luna 3D",
                price: 50,
                img: "assets/images/lampadaLuna3D.png",
                description: "Lampada decorativa a forma di luna 3D, perfetta come luce notturna."
            }
        ];

        // 3. Trova il prodotto giusto
        const product = products.find(p => p.id === productId);

        // 4. Mostra i dati
        if (product) {
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-price').textContent = 'CHF ' + product.price;
            document.getElementById('product-img').src = product.img;
            document.getElementById('product-description').textContent = product.description;
        } else {
            document.getElementById('product-name').textContent = "Prodotto non trovato";
            document.getElementById('product-price').textContent = "";
            document.getElementById('product-img').src = "";
            document.getElementById('product-description').textContent = "";
        }
    }

    // Aggiorna tutti i link dei prodotti in shop.html per avere sempre l'id corretto
    document.querySelectorAll('.product').forEach(prod => {
        const id = prod.dataset.productId;
        const link = prod.querySelector('a');
        if (link && id) link.href = `product.html?id=${id}`;
    });
});