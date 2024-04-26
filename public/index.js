const urlProductos = "http://localhost:3000/productos";
const urlDescuentos = "http://localhost:3000/descuentos";
const urlTraducir = "http://localhost:3000/traducir";
const urlComprar = "http://localhost:3000/compra";

async function obtenerDescuentos() {
  try {
    const response = await fetch(urlDescuentos);
    const descuentos = await response.json();
    return descuentos;
  } catch (error) {
    console.error('Error al obtener descuentos:', error);
    throw error;
  }
}
if (document.querySelector("section")) {
  fetch(urlProductos)
    .then(res => res.json())
    .then(data => {
      Promise.all(data.map(async producto => {
        const response = await fetch(urlTraducir, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: producto.title,
            description: producto.description
          })
        });
        const translatedData = await response.json();


        const descuentos = await obtenerDescuentos();
        const descuento = descuentos.find(descuento => descuento.id === producto.id);

        const shortDesc = translatedData.description.substring(0, 30) + "...";

        const card = document.createRange().createContextualFragment(
          `
        <div class="card">
            <div class="card-body">
              <div class="front-card">
                    <div class="image"> 
                        <img src="${producto.image}" class="card-img" alt="...">
                    </div> 
                    <h5 class="card-title">${translatedData.title}</h5>
                    <p class="card-category">${producto.category}</p>
                    <p class="card-text-short">${shortDesc}</p>
                    <div class="card-descuentos">
                      <div class="card-descuentoBarra">
                          <h5 class="card-precioFinal">$${producto.price}</h5>
                      </div>
                        <div class="card-precioOriginal">
                          <h5 class="card-price"></h5>
                         <h5 class="card-descontado"> </h5>
                        </div>
                    
                      <h5 class="card-descuento"></h5>
                    </div>
                   
                   

                 </div>
                   <div class="back-card"> 
                        <p class="card-text-full">${translatedData.description}</p>
                        
                    <button class="agregar-carrito" data-id=${producto.id}>Agregar al Carrito</button>
                </div>
            </div>
            
        </div>`
        );

        if (descuento) {
          let calcularDescuento = (producto.price * descuento.descuento) / 100;
          let precioFinal = producto.price - calcularDescuento;
          let montoDescontado = producto.price - precioFinal;
          card.querySelector(".card-price").innerHTML = `$${producto.price}`;
          card.querySelector(".card-precioFinal").innerHTML = `$${precioFinal.toFixed(2)}`;
          card.querySelector(".card-descuento").innerHTML = `%${descuento.descuento}`;
          card.querySelector(".card-descontado").innerHTML = `-${montoDescontado.toFixed(2)}`;

        } else {
          const descuentoElement = card.querySelector(".card-descuento");
          descuentoElement.parentNode.removeChild(descuentoElement);
          const precioOriginalElement = card.querySelector(".card-precioOriginal");
          precioOriginalElement.parentNode.removeChild(precioOriginalElement);
        }



        return card;

      }))
        .then(cards => {
          const section = document.querySelector("section");
          cards.forEach(card => {
            section.append(card);
          });
          agregarCarrito();
        })
    })
    .catch(error => {
      console.error('Error al obtener productos:', error);
    });
}


function agregarCarrito() {
  document.querySelectorAll('.agregar-carrito').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-id');
      const product = button.closest('.card');
      const productImage = product.querySelector('.card-img').src;
      const productTitle = product.querySelector('.card-title').textContent;
      const cantidad = 1;
      const precio = parseFloat(product.querySelector('.card-precioFinal').textContent.replace('$', ''));
      const descuentoElement = product.querySelector('.card-descuento');
      const descuento = descuentoElement ? parseFloat(descuentoElement.textContent.replace('%', '')) : 0;
      let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      console.log('carrito', carrito);
      const productoExistenteIndex = carrito.findIndex(item => item.id === productId);

      if (productoExistenteIndex !== -1) {
        carrito[productoExistenteIndex].cantidad++;
        carrito[productoExistenteIndex].price += precio;
      } else {
        const nuevoProducto = { id: productId, cantidad: 1, price: precio, image: productImage, title: productTitle, discount: descuento };
        carrito.push(nuevoProducto);

      }
      localStorage.setItem('carrito', JSON.stringify(carrito));
    });
  });
}

function mostrarCarrito() {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const carritoContainer = document.getElementById('carrito-container');
  let precioTotal = 0;

  carrito.forEach(producto => {

    const card = document.createRange().createContextualFragment(
      `<div class="tarjeta" data-id=${producto.id} > 
        <div class="tarjeta-container">
          <div class="imagen-container"> 
            <img src="${producto.image}" class="tarjeta-img">
          </div> 

            <div class="tarjeta-texto">
             <h5 class="tarjeta-title">${producto.title}</h5>

            <div class="tarjeta-precios-container">
            <div class="precios-container">
              <h5 class="tarjeta-precio">$${producto.price}</h5>
              <div class="div-descuento">
                <h5 class="tarjeta-descuento"></h5>
              </div>
            </div>
              <div class="tarjeta-cantidad">

              <button   id="decrementar">-</button>
              <h4 id="quantity">${producto.cantidad}</h4>

              <button  id="aumentar">+</button>
                
              
              </div>


            </div>
            
          <button class="eliminar">Eliminar</button>


          </div>
        </div>
      </div>`
    );
    const tarjetaDescuentoElement = card.querySelector('.tarjeta-descuento');
    if (producto.discount > 0) {
      tarjetaDescuentoElement.textContent = `${producto.discount}%`;
    } else {
      tarjetaDescuentoElement.style.display = 'none';
    }

    carritoContainer.appendChild(card);


  });


  //botones
  const tarjetas = document.querySelectorAll('.tarjeta');


  function actualizarPrecios() {
    let carritos = JSON.parse(localStorage.getItem('carrito')) || [];
    const preciosPorCantidad = carritos.map(producto => {
      const precioProducto = parseFloat(producto.price.toFixed(2));
      console.log('cantidad:', producto.cantidad);
      return precioProducto * producto.cantidad;
    });
    return precioTotal = preciosPorCantidad.reduce((total, precio) => total + precio, 0);
  }
  function agregarPrecio() {
    precioTotal = actualizarPrecios();
    document.querySelector('.precioTotal').innerHTML = `Precio Total: $${precioTotal.toFixed(2)}`;
  }

  if (carrito.length > 0) {
    precioTotal = actualizarPrecios();
    const comprar = document.createRange().createContextualFragment(
      ` <div class="comprar">
            <div class="total">
                <h4 class="precioTotal">Precio Total: $${precioTotal.toFixed(2)}</h4>
            </div>
            <div class="boton-compra">
              <button class="realizar-compra">Comprar</button>
            </div>
          </div> `
    );
    carritoContainer.appendChild(comprar);
  } else {
    const SinProductos = document.createElement('div');
    SinProductos.innerHTML = 'No hay productos en el carrito';
    carritoContainer.appendChild(SinProductos);
  }


  tarjetas.forEach(tarjeta => {
    const botonDecrementar = tarjeta.querySelectorAll('#decrementar');
    const botonIncrementar = tarjeta.querySelectorAll('#aumentar');
    const elementoCantidad = tarjeta.querySelector('#quantity');
    const botonElminar = tarjeta.querySelectorAll(".eliminar");

    let cantidad = parseInt(elementoCantidad.innerText);
    const productId = tarjeta.getAttribute('data-id');
    console.log(productId);

    botonDecrementar.forEach(button => {
      button.addEventListener('click', () => {
        if (cantidad > 1) {
          cantidad--;
          elementoCantidad.innerText = cantidad;
          actualizarCarrito(productId, cantidad);
          agregarPrecio();
        }
      });
    });

    botonIncrementar.forEach(button => {
      button.addEventListener('click', () => {
        cantidad++;
        elementoCantidad.innerText = cantidad;
        actualizarCarrito(productId, cantidad);
        agregarPrecio();
      });
    });

    botonElminar.forEach(button => {
      button.addEventListener('click', () => {
        eliminarProductoDelCarrito(productId, carrito, carritoContainer);
        agregarPrecio();
      });
    });
  });

  const botonCompra = document.querySelector('.realizar-compra');

  botonCompra.addEventListener('click', () => {
    guardarCompra();
    const carrt = [];
    localStorage.setItem('carrito', JSON.stringify(carrt));
    alert('Compra realizada');
    window.location.href = 'index.html';

  });

}


function eliminarProductoDelCarrito(productId, carrito, carritoContainer) {
  const productoIndex = carrito.findIndex(item => item.id === productId);

  carrito.splice(productoIndex, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  const eliminarTarjeta = document.querySelector(`.tarjeta[data-id="${productId}"]`);
  if (eliminarTarjeta) {
    eliminarTarjeta.remove();
  }

  if (carrito.length === 0) {
    const botonCompra = document.querySelector('.comprar');
    if (botonCompra) {
      botonCompra.remove();
      const SinProductos = document.createElement('div');
      SinProductos.innerHTML = 'No hay productos en el carrito';
      carritoContainer.appendChild(SinProductos);
    }
  }
}
function actualizarCarrito(productId, nuevaCantidad) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const productoIndex = carrito.findIndex(item => item.id === productId);
  if (productoIndex !== -1) {
    carrito[productoIndex].cantidad = nuevaCantidad;
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }
}
async function guardarCompra() {

  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  const response = await fetch(urlComprar, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(carrito)
  });

  if (response.ok) {
    console.log('Datos enviados correctamente al servidor');
  } else {
    console.error('Error al enviar datos al servidor');
  }

}

