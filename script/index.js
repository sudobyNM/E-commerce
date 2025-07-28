import { products, getProducts, loadProducts } from "/data/products.js";
import { cart, toCart } from "/data/cart.js";

const productGrid = document.querySelector(".products-grid");


const search = document.querySelector('.search-bar')
const searchBtn = document.querySelector('.search-button')

searchBtn.addEventListener('click',()=>{

  let val = search.value
  products.forEach((key)=>{
   console.log(key.keywords)
  })
//  if(products)
})
//Load products
async function loadPage() {
  await loadProducts();
  renderProducts();
}
loadPage();

  

// generate a product container for each product
function renderProducts(productsToRender = products) {
  productGrid.innerHTML = '';
  
  if (productsToRender.length === 0) {
    productGrid.innerHTML = `
      <div class="no-products-found">
        <div class="no-products-message">
          No products found matching your search.
        </div>
        <button class="show-all-products button-primary" onclick="renderProducts()">
          Show All Products
        </button>
      </div>
    `;
    return;
  }
  
  productsToRender.forEach((product) => {
    productGrid.innerHTML += `
      <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${product.image}">
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${product.name}
        </div>

        <div class="product-rating-container">
          <img class="product-rating-stars" src="${product.getRating()}">
          <div class="product-rating-count link-primary">
            ${product.rating.count}
          </div>
        </div>

        <div class="product-price">
          $${product.getPrice()}
        </div>

        <div class="product-quantity-container">
          <select class="js-quantity-selector" id="quantity-${product.id}">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => 
              `<option value="${num}">${num}</option>`
            ).join('')}
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart added-${product.id}">
          <img src="images/icons/checkmark.png">
          Added
        </div>

        <button class="add-to-cart button-primary" data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;
  });

  // Add event listeners to the new buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      addedMsg(productId);
      toCart(productId);
      updateCartQuantity();
    });
  });
}

//Show added to cart message
function addedMsg(productId) {
  const addedToCart = document.querySelector(`.added-${productId}`);
  addedToCart.classList.add("added-to-cart-visible");
  setTimeout(() => {
    addedToCart.classList.remove("added-to-cart-visible");
  }, 1300);
}

function updateCartQuantity() {
  const cartQuantityElement = document.querySelector('.cart-quantity');
  if (!cartQuantityElement) return;
  
  let cartQuantity = 0;
  cart.forEach((item) => {
    cartQuantity += item.quantity;
  });
  cartQuantityElement.textContent = cartQuantity;
}

function searchProducts() {
  const searchTerm = search.value.toLowerCase().trim();
  
  if (!searchTerm) {
    // If search is empty, show all products
    renderProducts(products);
    return;
  }

  console.log('Searching for:', searchTerm);
  console.log('Available products:', products);

  const filteredProducts = products.filter(product => {
    // Search in product name
    const nameMatch = product.name.toLowerCase().includes(searchTerm);
    
    // Search in keywords
    const keywordMatch = product.keywords && product.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm)
    );
    
    console.log('Product:', product.name);
    console.log('Keywords:', product.keywords);
    console.log('Name match:', nameMatch);
    console.log('Keyword match:', keywordMatch);
    
    return nameMatch || keywordMatch;
  });

  console.log('Filtered products:', filteredProducts);
  renderProducts(filteredProducts);
}

// Add event listeners
searchBtn.addEventListener('click', searchProducts);
search.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    searchProducts();
  }
});

// Initialize the page
async function init() {
  await loadProducts();
  renderProducts();
  updateCartQuantity();
}

init();

// Make renderProducts available globally
window.renderProducts = renderProducts;


