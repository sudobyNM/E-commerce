import { cart, toCart } from '/data/cart.js';
import { products, getProducts, loadProducts } from '/data/products.js';
import { deliveryOptions, getDeliveryOption } from '/data/deliveryOption.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

export const orders = getfromStorage();

let orderContainer;
let inner = '';

function updateCartQuantity() {
  const cartQuantityElement = document.querySelector('.cart-quantity');
  if (!cartQuantityElement) return;
  
  let cartQuantity = 0;
  cart.forEach((item) => {
    cartQuantity += item.quantity;
  });
  cartQuantityElement.textContent = cartQuantity;
}

export function addOrder(order) {
  // Add order time if not present
  if (!order.orderTime) {
    order.orderTime = new Date().toISOString();
  }
  
  // Add order ID if not present
  if (!order.id) {
    order.id = generateOrderId();
  }
  
  orders.push(order);
  savetoStorage();
  renderOrders();
}

function generateOrderId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

async function renderOrders() {
  if (!orderContainer) return;
  
  // Load products first
  try {
    await loadProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
    return;
  }
  
  inner = '';
  
  // Sort orders by date, newest first
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.orderTime) - new Date(a.orderTime)
  );
  
  sortedOrders.forEach((orderItems) => {
    const orderDate = dayjs(orderItems.orderTime).format('MMMM D, YYYY');
    
    inner += `
    <div class="order-container">
      <div class="order-header">
        <div class="order-header-left-section">
          <div class="order-date">
            <div class="order-header-label">Order Placed:</div>
            <div>${orderDate}</div>
          </div>
          <div class="order-total">
            <div class="order-header-label">Total:</div>
            <div>$${(orderItems.totalCostCents / 100).toFixed(2)}</div>
          </div>
        </div>

        <div class="order-header-right-section">
          <div class="order-header-label">Order ID:</div>
          <div>${orderItems.id}</div>
        </div>
      </div>

      <div class="order-details-grid">
        ${orderItems.products.map(product => {
          const matchingProduct = getProducts(product.productId);
          if (!matchingProduct) {
            console.error(`Product not found for ID: ${product.productId}`);
            return `
              <div class="product-details">
                <div class="product-name">
                  Product no longer available
                </div>
                <div class="product-quantity">
                  Quantity: ${product.quantity}
                </div>
              </div>`;
          }

          // Use default delivery option ID if none is set
          const deliveryOptionId = product.deliveryOptionId || '1'; // Default to standard shipping
          const deliveryOption = getDeliveryOption(deliveryOptionId);
          if (!deliveryOption) {
            console.error(`Delivery option not found for ID: ${deliveryOptionId}`);
            return `
              <div class="product-details">
                <div class="product-name">
                  ${matchingProduct.name}
                </div>
                <div class="product-quantity">
                  Quantity: ${product.quantity}
                </div>
                <div class="product-delivery-date">
                  Delivery information unavailable
                </div>
              </div>`;
          }

          // Calculate delivery date based on order time and delivery option
          const orderDate = dayjs(orderItems.orderTime);
          const deliveryDate = orderDate.add(deliveryOption.deliveryDays, 'days');
          
          // Format the date with day of week
          const formattedDeliveryDate = deliveryDate.format('dddd, MMMM D, YYYY');
          
          return `
            <div class="product-image-container">
              <img src="${matchingProduct.image}">
            </div>

            <div class="product-details">
              <div class="product-name">
                ${matchingProduct.name}
              </div>
              <div class="product-delivery-date">
                Arriving on: ${formattedDeliveryDate}
              </div>
              <div class="product-quantity">
                Quantity: ${product.quantity}
              </div>
              <button class="buy-again-button button-primary" data-product-id="${matchingProduct.id}">
                <img class="buy-again-icon" src="images/icons/buy-again.png">
                <span class="buy-again-message">Buy it again</span>
              </button>
            </div>

            <div class="product-actions">
              <a href="tracking.html?orderId=${orderItems.id}&productId=${product.productId}">
                <button class="track-package-button button-secondary">
                  Track package
                </button>
              </a>
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
  });
  
  orderContainer.innerHTML = inner;
  addEventListeners();
}

function addEventListeners() {
  document.querySelectorAll('.buy-again-button').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      toCart(productId);
      updateCartQuantity();
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  orderContainer = document.querySelector('.orders-grid');
  if (!orderContainer) {
    console.error('Could not find .orders-grid');
    return;
  }
  await renderOrders();
  updateCartQuantity();
});

function savetoStorage() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function getfromStorage() {
  return JSON.parse(localStorage.getItem('orders')) || [];
}


