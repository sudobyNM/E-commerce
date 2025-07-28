import { addOrder } from "/data/orders.js";
import { cart } from "/data/cart.js";
import { getProducts, loadProducts } from "/data/products.js";

export function renderPaymentMethod() {
  let productPrice = 0;
  let shippingPrice = 0;
  
  // Calculate product price
  cart.forEach((cartItem) => {
    const product = getProducts(cartItem.productId);
    if (product) {
      productPrice += product.priceCents * cartItem.quantity;
    }
    
    //shipping price
    if (cartItem.deliveryOptionId === "1") {
      shippingPrice += 0;
    } else if (cartItem.deliveryOptionId === "2") {
      shippingPrice += 499;
    } else if (cartItem.deliveryOptionId === "3") {
      shippingPrice += 999;
    }
  });

  //total before tax
  let totalBeforeTax = productPrice + shippingPrice;
  //tax calculation
  let tax = totalBeforeTax * 0.1;
  //total after tax
  let totalAfterTax = totalBeforeTax + tax;

  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });

  let paymentHTML = `
    <div class="payment-summary-title">Order Summary</div>

    <div class="payment-summary-row">
      <div>items (${cartQuantity}): </div>
      <div class="payment-summary-money">$${formatCurrency(productPrice)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">$${formatCurrency(shippingPrice)}</div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">$${formatCurrency(
        totalBeforeTax
      )}</div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">$${formatCurrency(tax)}</div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">$${formatCurrency(totalAfterTax)}</div>
    </div>

    <button class="place-order-button button-primary">
      Place your order
    </button>
  `;

  const paymentMethod = document.querySelector(".payment-summary");
  paymentMethod.innerHTML = paymentHTML;

  const placeOrderButton = document.querySelector(".place-order-button");
  placeOrderButton.addEventListener("click", async function () {
    const response = await fetch('https://supersimplebackend.dev/orders',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cart: cart,
       
      })
    })
  
    const order = await response.json()
    
    addOrder(order)

    location.href = 'orders.html'
   
   
  });
}

// Initialize the payment method after products are loaded
async function initPaymentMethod() {
  await loadProducts();
  renderPaymentMethod();
}
initPaymentMethod();

export function formatCurrency(cents) {
  return (cents / 100).toFixed(2);
}
