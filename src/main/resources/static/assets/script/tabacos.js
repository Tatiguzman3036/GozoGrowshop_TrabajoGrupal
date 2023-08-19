window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");
  const scrollPosition = window.scrollY;
  const navbarHeight = navbar.offsetHeight;
  const headerHeight = 200;

  const opacity = Math.min(1, scrollPosition / (headerHeight - navbarHeight));
  if (scrollPosition > headerHeight) {
    navbar.classList.add("top-nav");
    navbar.classList.remove("navbar-interno_home")
  } else {
    navbar.classList.remove("top-nav");
    navbar.classList.add("navbar-interno_home")
  }
  navbar.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
});
const myModal = document.getElementById('exampleModal');
const myInput = myModal.querySelector('.modal-body input');

myModal.addEventListener('shown.bs.modal', () => {
  myInput.focus();
});

window.addEventListener("load", function () {
  this.document.getElementById("container-loader").classList.toggle("container-loader2")
})

const { createApp } = Vue

createApp({
  data() {
    return {
      productos: [],

      tabacos: [],
      accesorios: [],
      cultivo: [],

      tabacosFiltrados: [],

      filtroTabacos: [],

      checkedCheckbox: [],
      seleccionadas: [],
      tabacosFiltrados: [],
      cantidadProductosCarrito: this.getCantidadProductosCarrito(),
      totalPrecioProductos: 0,

      productoSeleccionado: {},
      logged: false,
      cliente: [],
      cantidadEscogida: 1,
        descripcionMaxLength : 50,
        descripcionCompleta: false,
        totalPrecioProductos: 0,
    };
  },
  created() {
    axios.get("/api/cliente/actual")
      .then(response => {
        this.logged = true;
        this.cliente = response.data

      })
      .catch(err => console.log(err))
      this.format = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    this.traerProductosTabacos();
    this.seleccionadas = JSON.parse(localStorage.getItem("seleccionadas")) ?? [];
    this.totalPrecioProductos = parseFloat(localStorage.getItem("totalPrecioProductos")) || 0;
  },

  methods: {
    logout() {
      axios.post("/api/logout")
        .then(response => {

          window.location.href = "/index.html";
        })
    },
    traerProductosTabacos() {
      axios
        .get('/api/productos')
        .then(response => {
          this.productos = response.data.filter(productos => productos.activo == true)

          

          //TABACOS
          this.tabacos = this.productos.filter(producto => producto.categoria == "TABACO");
          let marcas = this.tabacos.map(tabaco => tabaco.marca)
          const categorias = [...new Set(marcas)]
          this.tabacosFiltrados = categorias
          console.log(this.tabacos);
        })
        .catch(exception => {
          console.log(exception);
        })
    },

    // localstorage
    toggleSeleccion(id) {
      console.log(this.productos);
      const producto = this.productos.find((e) => e.id == id);
      swal({
        title: "Agregar al carrito",
        text: `Ingrese la cantidad que desea agregar (Stock disponible: ${producto.cantidad})`,
        content: {
          element: "input",
          attributes: {
            type: "number",
            min: 1,
            max: producto.cantidad,
          },
        },
        buttons: {
          cancel: true,
          confirm: "Agregar",
        },
      }).then((value) => {
        if (value) {
          const cantidad = parseInt(value);
          if (cantidad > 0 && cantidad <= producto.cantidad) {
            const item = this.seleccionadas.find((e) => e.id == id);
            if (item) {
              item.cantidad += cantidad;
            } else {
              this.seleccionadas.push({
                ...producto,
                cantidad,
              });
            }
            this.cantidadProductosCarrito += cantidad;
            this.calcularTotalPrecioProductos();
            const jsonProductos = JSON.stringify(this.cantidadProductosCarrito)
            localStorage.setItem("cantidadProductosCarrito", jsonProductos);
            const json = JSON.stringify(this.seleccionadas);
            localStorage.setItem("seleccionadas", json);
            swal("Success", "Producto agregado al carrito", "success");
          } else {
            swal("Error", "Cantidad invÃ¡lida", "error");
          }
        }
      });
    },
    comprarEnElModal(id) {
      const producto = this.productos.find((e) => e.id == id);
      const cantidad = parseInt(this.cantidadEscogida);

      if (cantidad > 0 && cantidad <= producto.cantidad) {
        const item = this.seleccionadas.find((e) => e.id == id);
        if (item) {
          item.cantidad += cantidad;
        } else {
          this.seleccionadas.push({
            ...producto,
            cantidad,
          });
        }

        this.cantidadProductosCarrito += cantidad;
        this.calcularTotalPrecioProductos();
        const jsonProductos = JSON.stringify(this.cantidadProductosCarrito);
        localStorage.setItem("cantidadProductosCarrito", jsonProductos);

        const json = JSON.stringify(this.seleccionadas);
        localStorage.setItem("seleccionadas", json);

        swal("Success", "Producto agregado al carrito", "success");
      } else {
        swal("Error", "Cantidad inválida", "error");
      }
    },
    // Verificar si hay productos en el carrito
    getCantidadProductosCarrito() {
      const storedCantidadProductosCarrito = localStorage.getItem("cantidadProductosCarrito");
      if (storedCantidadProductosCarrito) {
        return parseInt(storedCantidadProductosCarrito);
      }
      return 0; // Valor predeterminado si no se encuentra en el LocalStorage
    },
    calcularTotalPrecioProductos() {
      this.totalPrecioProductos = this.seleccionadas.reduce((total, producto) => {
        return total + producto.precio * producto.cantidad;
      }, 0);
  
      // Guardar el precio total en el localStorage
      localStorage.setItem("totalPrecioProductos", this.totalPrecioProductos);
    },
    mostrarModal(producto) {
      if (producto) {
        this.productoSeleccionado = producto;
      }
    },
    toggleDescripcion() {
      if (this.descripcionMaxLength === 50) {
        this.descripcionMaxLength = this.productoSeleccionado.descripcion.length;
      } else {
        this.descripcionMaxLength = 50;
      }
    },
    toggleDescripcionCompleta() {
      this.descripcionCompleta = !this.descripcionCompleta;
    },

  },
  computed: {
    filtroBusquedaTabacos() {
      if (this.checkedCheckbox.length != 0) {
        this.filtroTabacos = this.tabacos.filter(tabaco => this.checkedCheckbox.includes(tabaco.marca));
        console.log(this.filtroTabacos)
      } else {
        this.filtroTabacos = this.tabacos;
      }
    },
    descripcionReducida() {
      if (this.productoSeleccionado && this.productoSeleccionado.descripcion) {
        if (this.descripcionCompleta) {
          return this.productoSeleccionado.descripcion;
        } else {
          if (this.productoSeleccionado.descripcion.length > this.descripcionMaxLength) {
            let producto = this.productoSeleccionado.descripcion.slice(0, this.descripcionMaxLength) + "...";
            return producto;
          } else {
            return this.productoSeleccionado.descripcion;
          }
        }
      }
      return '';
    },
  }
}).mount("#app")