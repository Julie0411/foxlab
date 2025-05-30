document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
        const button = event.target;
        const product = button.closest('.product');
        const productId = button.getAttribute('data-product') || Date.now().toString();
        const productName = button.getAttribute('data-name') || product.querySelector('.productDescription')?.textContent || "Prodotto";
        const productPrice = parseFloat(button.getAttribute('data-price'));
        const imageSrc = product.querySelector('img')?.src || '';

        const newItem = {
            id: productId,
            name: productName,
            price: productPrice,
            image: imageSrc
        };

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(newItem);
        localStorage.setItem('cart', JSON.stringify(cart));

        document.querySelectorAll('#cart-count').forEach(el => {
            el.innerText = cart.length;
        });
    });
});

document.querySelectorAll('.product').forEach(product => {
    const container = product.querySelector('.carousel-container');
    const images = product.querySelectorAll('.carousel img');
    const prevButton = product.querySelector('.prev');
    const nextButton = product.querySelector('.next');
    if (!prevButton || !nextButton || !container) return;

    let index = 0;

    function updateCarousel() {
        const offset = -index * 200;
        container.style.transform = `translateX(${offset}px)`;
    }

    nextButton.addEventListener('click', () => {
        index = (index + 1) % images.length;
        updateCarousel();
    });

    prevButton.addEventListener('click', () => {
        index = (index - 1 + images.length) % images.length;
        updateCarousel();
    });

    updateCarousel();
});

function loadCart() {
    const items = JSON.parse(localStorage.getItem("cart")) || [];
    const cartList = document.getElementById("cart-items");
    const totalDisplay = document.getElementById("cart-total");

    if (!cartList || !totalDisplay) return;

    cartList.innerHTML = "";
    let total = 0;

    items.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "cart-item";

        const img = document.createElement("img");
        img.src = item.image || "assets/images/placeholder.png";
        img.alt = item.name;
        img.className = "cart-item-img";

        const details = document.createElement("div");
        details.className = "cart-item-details";

        const nameSpan = document.createElement("span");
        nameSpan.className = "cart-item-name";
        nameSpan.textContent = item.name;

        const priceSpan = document.createElement("span");
        priceSpan.className = "cart-item-price";
        priceSpan.textContent = `CHF ${item.price.toFixed(2)}`;

        details.appendChild(nameSpan);
        details.appendChild(priceSpan);

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-item";
        removeBtn.innerHTML = "✕";
        removeBtn.addEventListener("click", () => {
            items.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(items));
            loadCart();
        });

        li.appendChild(img);
        li.appendChild(details);
        li.appendChild(removeBtn);

        cartList.appendChild(li);
        total += item.price;
    });

    totalDisplay.textContent = `Totale: CHF ${total.toFixed(2)}`;

    document.querySelectorAll('#cart-count').forEach(el => {
        el.innerText = items.length;
    });
}

function clearCart() {
    localStorage.removeItem("cart");
    loadCart();
}

window.onload = loadCart;
