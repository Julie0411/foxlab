let cart = [];

function addToCart(event) {
    const button = event.target;
    const productId = button.getAttribute('data-product');
    const productName = button.getAttribute('data-name');
    const productPrice = parseFloat(button.getAttribute('data-price'));
    cart.push({ id: productId, name: productName, price: productPrice });
    document.getElementById('cart-count').innerText = cart.length;
}

document.querySelectorAll('.product').forEach(product => {
    const container = product.querySelector('.carousel-container');
    const images = product.querySelectorAll('.carousel img');
    const prevButton = product.querySelector('.prev');
    const nextButton = product.querySelector('.next');
    if (!prevButton || !nextButton) {
        console.error('Carousel buttons not found!');
        return; // Esci dalla funzione se i bottoni non sono trovati
    }
    let index = 0;

    function updateCarousel() {
        const offset = -index * 200; // 200px è la larghezza dell'immagine
        container.style.transform = `translateX(${offset}px)`;
    }

    nextButton.addEventListener('click', () => {
        index = (index + 1) % images.length; // Aumento dell'indice (ciclico)
        updateCarousel();
    });

    prevButton.addEventListener('click', () => {
        index = (index - 1 + images.length) % images.length; // Decremento ciclico
        updateCarousel();
    });

    updateCarousel();
});

