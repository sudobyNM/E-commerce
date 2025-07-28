import { cart, saveCart, deleteCart, updateQuantity, updateDeliveryOption } from "/data/cart.js";
import { products, getProducts, loadProducts } from "/data/products.js";
import { deliveryOptions, getDeliveryOption } from "/data/deliveryOption.js";
import { renderPaymentMethod } from "./paymentFunc.js";
const orders = document.querySelector(".order-summary");

import '/data/backend.js'



let cartQuantity = 0;

export function updateCartQuantity() {
  cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  document.querySelector('.return-to-home-link').textContent = `${cartQuantity} items`;
  saveCart();
}

function renderCartItem(item) {
  const productId = item.productId;
  let matchingProduct = getProducts(productId);
  
  if (!matchingProduct) {
    console.error(`Product not found for ID: ${productId}`);
    return '';
  }

  const deliveryOptionId = item.deliveryOptionId;
  const deliveryOption = getDeliveryOption(deliveryOptionId);
  let now = dayjs();
  let deliveryDate = now.add(deliveryOption.deliveryDays, "days");
  const date = deliveryDate.format("dddd, MMMM D");

  return `<div class="cart-item-container-${matchingProduct.id}"> 
    <div class="delivery-date">Delivery date: ${date} </div>

    <div class="cart-item-details-grid">
      <img
      class="product-image"
      src="${matchingProduct.image}"
    />

    <div class="cart-item-details">
      <div class="product-name">
        ${matchingProduct.name}
      </div>
      <div class="product-price">$${matchingProduct.getPrice()}</div>
      <div class="product-quantity">
        <span> Quantity: <span class="quantity-label-${matchingProduct.id}">${
          item.quantity
        }</span> </span>
        <span class="update-quantity-link link-primary" data-product-id="${
          matchingProduct.id
        }">
          Update
        </span>
        <input style="width:30px;display:none;" class="quantity-input-${matchingProduct.id}"/>
        <span class="save-quantity-link link-primary"
        data-product-id="${matchingProduct.id}">
        Save
      </span>
        <span class="delete-quantity-link link-primary" data-product-id="${
          matchingProduct.id
        }">
          Delete
        </span>
      </div>
    </div>

    <div class="delivery-options">
      <div class="delivery-options-title">
        Choose a delivery option:
      </div>
      ${deliveryOptionHTML(matchingProduct, item)}
    </div>
  </div>
  </div>`;
}

function renderCart() {
  orders.innerHTML = '';
  cart.forEach((item) => {
    orders.innerHTML += renderCartItem(item);
  });
  addEventListeners();
}

function addEventListeners() {
  document.querySelectorAll('.update-quantity-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        const container = document.querySelector(
          `.cart-item-container-${productId}`
        );
        
        container.classList.add('is-editing-quantity');
        const quantity = document.querySelector(`.quantity-input-${productId}`);
        quantity.style.display = 'initial';
      });
    });

  document.querySelectorAll('.save-quantity-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        const container = document.querySelector(
          `.cart-item-container-${productId}`
        );
       
        container.classList.remove('is-editing-quantity');
        const quantity = document.querySelector(`.quantity-input-${productId}`);
        quantity.style.display = 'none';

        const newQ = Number(quantity.value);
        const quantityLabel = document.querySelector(`.quantity-label-${productId}`);
       

        
        if(newQ === 0 || newQ === '') {
          quantityLabel.textContent = 'please select a quantity greater than 0 OR delete the item';
          quantityLabel.style.color = 'red';

          setTimeout(() => {
            const item = cart.find((item) => item.productId === productId);
            quantityLabel.textContent = `${item.quantity}`;
            quantityLabel.style.color = 'black';
           
          }
          , 1500);

        }
        
        else {
          quantityLabel.textContent = newQ;
          updateQuantity(productId, newQ);
          renderCart();
          renderPaymentMethod();
          updateCartQuantity();
        }
      });
    });

  document.querySelectorAll(".delete-quantity-link")
    .forEach((link) => {
      link.addEventListener("click", () => {
        const productId = link.dataset.productId;
        deleteCart(productId);
        renderCart();
        renderPaymentMethod();
        updateCartQuantity();
      });
    });

  document.querySelectorAll('.delivery-option')
    .forEach((element) => {
      element.addEventListener('click', () => {
        const {productId, deliveryOptionId} = element.dataset;
        updateDeliveryOption(productId, deliveryOptionId);
        renderCart();
        renderPaymentMethod();
      });
    });
}

function deliveryOptionHTML(matchingProduct, item) {
  let htmltext = '' 
  deliveryOptions.forEach((deliveryOption) => {
    let now = dayjs();
    let deliveryDate = now.add(deliveryOption.deliveryDays, "days");
    const date = deliveryDate.format('dddd, MMMM D');
    const price = deliveryOption.priceCents === 0 ? 'FREE' : `${(deliveryOption.priceCents)/100}`;
    const isChecked = deliveryOption.id === item.deliveryOptionId;

    htmltext += `
      <div class="delivery-option" data-product-id="${matchingProduct.id}" data-delivery-option-id="${deliveryOption.id}">
        <input
          type="radio"
          ${isChecked ? "checked" : ""}
          class="delivery-option-input"
          name="delivery-option-${matchingProduct.id}"
        />
        <div>
          <div class="delivery-option-date">${date}</div>
          <div class="delivery-option-price">$${price} - Shipping</div>
        </div>
      </div>`;
  });
  return htmltext;
}

// Initialize the checkout page after products are loaded
async function initCheckout() {
  await loadProducts();
  
  renderCart();
  renderPaymentMethod();
  updateCartQuantity();
}
initCheckout();
  

// const promise = new Promise((res)=>{
  
//   loadProducts(()=>{
//     res('product solved')
  
//   })

// })

// promise.then((value)=>{
//   console.log(value)
//   renderCart();
//   renderPaymentMethod();
//   updateCartQuantity();
// });











