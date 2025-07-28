export let cart = loadCart()


//Add according to the quantity function
export function toCart(productId, defaultQuantity = 1) {
  const quantity = document.querySelector(`#quantity-${productId}`);
  const quan = quantity ? parseInt(quantity.value) : defaultQuantity;

  let matchingItem;

  cart.forEach((item) => {
    if (productId === item.productId) {
      matchingItem = item;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += quan;
  } else {
    cart.push({
      productId: productId,
      quantity: quan,
      deliveryOptionId: '1'
    });
  }
  
  saveCart();
}


//Save cart to local storage
export function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart))

}

//get local storage cart
export function loadCart(){
  const cart = localStorage.getItem('cart')
  if(cart){
    return JSON.parse(cart)
  }else{
    return []
  }
}




//Delete item from cart
export function deleteCart(productId){
  const newCart = cart.filter((item)=>{
    return item.productId !== productId
  })
  cart = newCart
  saveCart()
}


//update quantity on checkout cart
export function updateQuantity(productId, quantity){
  cart.forEach((item)=>{
    if(item.productId === productId){
      item.quantity = quantity
    }
  })
  saveCart()
}



//update delivery option
export function updateDeliveryOption(productId, deliveryOptionId){
  cart.forEach((item)=>{
    if(item.productId === productId){
      item.deliveryOptionId = deliveryOptionId
    }
  })
  saveCart()
}

