import { orders } from '/data/orders.js';
import { getProducts, loadProducts } from '/data/products.js';
import { getDeliveryOption } from '/data/deliveryOption.js';
import { cart } from '/data/cart.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

let orderContainer;
let productContainer;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');
const productId = urlParams.get('productId');

async function renderTracking() {
  if (!orderContainer) return;

  try {
    await loadProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
    return;
  }

  // Find the order
  const order = orders.find(order => order.id === orderId);
  if (!order) {
    orderContainer.innerHTML = `
      <div class="error-message">
        Order not found. Please check the order ID and try again.
      </div>
    `;
    return;
  }

  // Find the product in the order
  const orderProduct = order.products.find(product => product.productId === productId);
  if (!orderProduct) {
    orderContainer.innerHTML = `
      <div class="error-message">
        Product not found in this order. Please check the product ID and try again.
      </div>
    `;
    return;
  }

  // Get product details
  const product = getProducts(productId);
  if (!product) {
    orderContainer.innerHTML = `
      <div class="error-message">
        Product details not available. Please try again later.
      </div>
    `;
    return;
  }

  // Get delivery option (use default if not found)
  const deliveryOptionId = orderProduct.deliveryOptionId || '1';
  const deliveryOption = getDeliveryOption(deliveryOptionId);
  if (!deliveryOption) {
    orderContainer.innerHTML = `
      <div class="error-message">
        Delivery information not available. Please try again later.
      </div>
    `;
    return;
  }

  // Calculate delivery date based on order time and delivery option
  const orderDate = dayjs(order.orderTime);
  const deliveryDate = orderDate.add(deliveryOption.deliveryDays, 'days');
  const formattedDeliveryDate = deliveryDate.format('dddd, MMMM D');

  // Calculate progress based on time elapsed since order
  const daysSinceOrder = dayjs().diff(orderDate, 'day');
  let progress = 0;
  let currentStatus = 'Preparing';

  if (daysSinceOrder >= deliveryOption.deliveryDays) {
    progress = 100;
    currentStatus = 'Delivered';
  } else if (daysSinceOrder >= deliveryOption.deliveryDays / 2) {
    progress = 50;
    currentStatus = 'Shipped';
  } else {
    progress = (daysSinceOrder / deliveryOption.deliveryDays) * 50;
  }

  // Update the DOM with dynamic delivery information
  const deliveryDateElement = document.querySelector('.delivery-date');
  if (deliveryDateElement) {
    deliveryDateElement.textContent = `Arriving on ${formattedDeliveryDate}`;
  }

  const productInfoElements = document.querySelectorAll('.product-info');
  if (productInfoElements.length >= 2) {
    productInfoElements[0].textContent = product.name;
    productInfoElements[1].textContent = `Quantity: ${orderProduct.quantity}`;
  }

  const productImage = document.querySelector('.product-image');
  if (productImage) {
    productImage.src = product.image;
  }

  // Update progress labels
  const progressLabels = document.querySelectorAll('.progress-label');
  progressLabels.forEach(label => {
    label.classList.remove('current-status');
    if (label.textContent.trim() === currentStatus) {
      label.classList.add('current-status');
    }
  });

  // Update progress bar
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
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

document.addEventListener('DOMContentLoaded', async () => {
  orderContainer = document.querySelector('.order-tracking');
  if (!orderContainer) {
    console.error('Could not find .order-tracking element');
    return;
  }
  await renderTracking();
  updateCartQuantity();
});
