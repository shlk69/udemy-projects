// 1. Fixed event listener: call one setup function
document.addEventListener('DOMContentLoaded', initializeApp);

const products = [
    { id: 1, name: 'Wireless Headphones', price: 129.99 },
    { id: 2, name: 'USB-C Cable', price: 19.99 },
    { id: 3, name: 'Phone Stand', price: 24.99 },
    { id: 4, name: 'Laptop Sleeve', price: 49.99 },
    { id: 5, name: 'Portable Charger', price: 39.99 },
    { id: 6, name: 'Desk Lamp', price: 59.99 },
    { id: 7, name: 'Keyboard', price: 89.99 },
    { id: 8, name: 'Mouse Pad', price: 14.99 },
];

const allProducts = document.getElementById('All-products');
const checkoutList = document.getElementById('checkout-list');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutItem = document.getElementById('checkout-items');
const checkBtn = document.getElementById('checkout-btn')

let totalItem = 0;
let itemAmnt = 0;
let cartItem = JSON.parse(localStorage.getItem('cart')) || [];

function initializeApp() {
    saveToPr();
    showProducts(); // Show store items
    renderCart();   // Show saved items from localStorage
}

function showProducts() {
    allProducts.innerHTML = ""; // Clear to prevent double rendering
    products.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `Name: ${product.name} <br> Amount: $${product.price} `;
        const btn = document.createElement('button');
        btn.textContent = 'Add to cart';
        btn.addEventListener('click', () => addToCart(product.id, product.name, product.price));
        li.appendChild(btn);
        allProducts.appendChild(li);
    });
}

function addToCart(id, name, price) {
    const item = { id, price, name };
    cartItem.push(item);
    saveToCart();
    renderCart(); // Refresh the whole cart UI
}

// 2. Fixed: One function to rule the Cart UI
function renderCart() {
    checkoutList.innerHTML = "";
    totalItem = 0;
    itemAmnt = 0;

    cartItem.forEach((item, index) => {
        totalItem += 1;
        itemAmnt += item.price;

        const li = document.createElement('li');
        // We pass 'index' directly to the function
        li.innerHTML = `
            ${item.name} - $${item.price}
            <button onclick="deleteItem(${index})">delete</button>
            <br><br>
        `;
        checkoutList.appendChild(li);
    });

    checkoutItem.innerHTML = `<span>Total Items : ${totalItem}</span>`;
    checkoutTotal.innerHTML = `<span>Total amount : $${itemAmnt.toFixed(2)}</span>`;
}

function deleteItem(index) {
    // Remove specifically the item at the clicked index
    cartItem.splice(index, 1);

    // Sync with storage
    saveToCart();

    // Refresh the UI to show the new list and correct indexes
    renderCart();
}

function saveToPr() {
    localStorage.setItem('products', JSON.stringify(products));
}

function saveToCart() {
    localStorage.setItem('cart', JSON.stringify(cartItem));
}


checkBtn.addEventListener('click', () => {
    checkoutList.innerHTML = ""
    checkoutItem.innerHTML = `<span>Total Items : 0</span>`;
    checkoutTotal.innerHTML = `<span>Total amount : $0.00</span>`
})