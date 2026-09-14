const cartContainer = document.querySelector('.cart-container');
const cartCountEl = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItemsEl = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');

const userName = document.getElementById('user-name')
const eMail = document.getElementById('email')
const phone = document.getElementById('phone')

let cartList = [];


cartContainer.addEventListener('click', () => {
    cartModal.style.display = 'flex';
});
document.getElementById('continue-btn').addEventListener('click', () => {
    cartModal.style.display = 'none';
});

document.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.querySelector('.modal-overlay')) {
        cartModal.style.display = 'none';
    }
});

document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product');
        const name = card.querySelector('h3').textContent;
        const priceText = card.querySelector('.price').textContent;
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

        const existing = cartList.find(item => item.name === name);
        if (existing) {
            existing.qty++;
        } else {
            cartList.push({ name, price, qty: 1 });
        }
        renderCart();
    });
});


function renderCart() {
    cartItemsEl.innerHTML = '';
    let total = 0;
    let totalQty = cartList.length;

    cartList.forEach((item, index) => {
        total += item.price * item.qty;
        
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
            <span>${index + 1}</span>
            <span>${item.name}</span>
            <span>GH₵${item.price}</span>
            <div class="qty-controls">
                <button class="qty-minus" data-index="${index}">-</button>
                <span class="item-count">${item.qty}</span>
                <button class="qty-plus" data-index="${index}">+</button>
            </div>
            <button class="remove-btn" data-index="${index}">Remove</button>
        `;
        cartItemsEl.appendChild(row);
    });

    totalPriceEl.textContent = total.toFixed(2);
    cartCountEl.textContent = totalQty;
}

// Qty Control
cartItemsEl.addEventListener('click', (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains('qty-plus')) {
        cartList[index].qty++;
    }
    if (e.target.classList.contains('qty-minus')) {
        if (cartList[index].qty > 1) cartList[index].qty--;
    }
    if (e.target.classList.contains('remove-btn')) {
        cartList.splice(index, 1);
    }
    renderCart();
});

