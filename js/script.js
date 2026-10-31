const cartContainer = document.querySelector('.cart-container');
const cartCountEl = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const successModal = document.getElementById('success-modal');
const cartItemsEl = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const productListEl = document.querySelector('.product-list');

const userNameInput = document.getElementById('user-name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

let cartList = [];
let currentTotal = 0; 

function renderProducts() {
    productListEl.innerHTML = '';
    
    items.forEach(product => {
        const isInCart = cartList.some(item => item.id === product.id);
        const btnText = isInCart ? 'Remove From Cart' : 'Add to Cart';

        const productCard = document.createElement('div');
        productCard.className = 'product';
        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">GH₵ ${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${product.id}">${btnText}</button>
        `;
        productListEl.appendChild(productCard);
    });
}

renderProducts();

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

productListEl.addEventListener('click', (e) => {
    if (!e.target.classList.contains('add-to-cart')) return;

    const productId = parseInt(e.target.dataset.id);
    const product = items.find(item => item.id === productId);

    if (!product) return;

    const existingIndex = cartList.findIndex(item => item.id === product.id);
    
    if (existingIndex > -1) {
        cartList.splice(existingIndex, 1);
    } else {
        cartList.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }

    renderProducts();
    renderCart();
});

function renderCart() {
    cartItemsEl.innerHTML = '';
    currentTotal = 0;
    let totalQty = 0;
    cartCountEl.textContent = cartList.length;

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
}

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
    renderProducts(); 
});

function payWithPaystack(email, name) {
  let paystack = new PaystackPop();
  
  paystack.newTransaction({
    key: 'pk_test_f7ac2ef93b09c114d34b090bfd3b9b8125b0b14b',
    email: email,          
    amount: Math.round(currentTotal * 100), 
    currency: 'GHS',                
    ref: 'SS_' + Math.floor((Math.random() * 1000000000) + 1),
    onSuccess: function(response) {
      // 1. Copy purchased items for success modal
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

      // 2. Clear cart and update UI
      cartList = [];
      renderCart();
      renderProducts(); 

      // 3. Show success modal
      successModal.style.display = 'flex';
    },
    onCancel: function() {
      console.log('Transaction was not completed, window closed.');
    }
  });
}