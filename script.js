const cartContainer = document.querySelector('.cart-container');
const cartCountEl = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const successModal = document.getElementById('success-modal');
const cartItemsEl = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');

const userNameInput = document.getElementById('user-name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

let cartList = [];
let currentTotal = 0; 

cartContainer.addEventListener('click', () => {
    cartModal.style.display = 'flex';
});

document.getElementById('continue-btn').addEventListener('click', () => {
    cartModal.style.display = 'none';
});

document.getElementById('checkout-btn').addEventListener('click', () => {
    const email = emailInput.value.trim();
    const name = userNameInput.value.trim();

    if (!email || !name) {
        alert('Please fill in your name and email before checking out.');
        return;
    }

    if (cartList.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    cartModal.style.display = 'none';
    payWithPaystack(email, name);
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.style.display = 'none';
    if (e.target === successModal) successModal.style.display = 'none';
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
    currentTotal = 0;
    let totalQty = 0;

    cartList.forEach((item, index) => {
        currentTotal += item.price * item.qty;
        totalQty += item.qty;
        
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
            <span>${index + 1}</span>
            <span>${item.name}</span>
            <span>GH₵${item.price.toFixed(2)}</span>
            <div class="qty-controls">
                <button class="qty-minus" data-index="${index}">-</button>
                <span class="item-count">${item.qty}</span>
                <button class="qty-plus" data-index="${index}">+</button>
            </div>
            <button class="remove-btn" data-index="${index}">Remove</button>
        `;
        cartItemsEl.appendChild(row);
    });

    totalPriceEl.textContent = currentTotal.toFixed(2);
    cartCountEl.textContent = totalQty;
}

// Qty Control Delegation
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

function payWithPaystack(email, name) {
  let handler = PaystackPop.setup({
    key: 'pk_test_f7ac2ef93b09c114d34b090bfd3b9b8125b0b14b',
    email: email,          
    amount: Math.round(currentTotal * 100), 
    currency: 'GHS',                
    ref: 'SS_' + Math.floor((Math.random() * 1000000000) + 1),
    callback: function(response) {
      alert('Payment complete! Reference: ' + response.reference);
      
      const purchasedItems = [...cartList];
      
      const successCartItemsEl = document.getElementById('success-cart-items');
      successCartItemsEl.innerHTML = '';
      
      purchasedItems.forEach((item, index) => {
          const row = document.createElement('div');
          row.className = 'cart-row';
          row.innerHTML = `
              <span>${index + 1}</span>
              <span>${item.name}</span>
              <span>GH₵${item.price.toFixed(2)}</span>
              <span>${item.qty}</span>
              <span></span>
          `;
          successCartItemsEl.appendChild(row);
      });

      cartList = [];
      renderCart();

      successModal.style.display = 'flex';
    },
    onClose: function() {
      alert('Transaction was not completed, window closed.');
    }
  });
  handler.openIframe();
}
