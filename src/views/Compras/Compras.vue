<template>
  <v-alert text="Ingreso de facturas de compra, actualice precios y stock" title="Facturas de Compras" type="primary"
    icon="mdi-ballot-recount-outline"></v-alert>
  <v-chip label color="primary" text-color="primary">
   
    <v-btn @click="nuevaCompra" icon="mdi mdi-plus" name="compra" title="Nueva compra" density="compact"></v-btn> Nuevo
    Ingreso
  </v-chip>
  <v-container>
    <div class="text-center pa-4">
      <v-dialog v-model="dialogEdit" fullscreen>
        <v-card max-width="auto">
          <br>
          <v-container>
            <v-row>

              <v-col cols="12" md="2">
                <v-text-field v-model="search" label="Codigo de barras o nombre" variant="underlined" color="info"
                  clearable />
              </v-col>
              <v-col cols="12" md="3">
                <v-autocomplete v-model="filters.proveedor_id" :items="proveedoresList" item-title="nombreCompleto"
                  :rules="nombreRules" item-value="id" variant="underlined" color="info" label="Proveedor" required>
                  <template v-slot:item="{ props }">
                    <v-list-item v-bind="props"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="2">
                <v-autocomplete v-model="filters.categoria_id" :items="categoriasList" item-title="nombre" clearable
                  item-value="id" variant="underlined" color="info" label="Categoria">
                  <template v-slot:item="{ props }">
                    <v-list-item v-bind="props"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="2">
                <v-radio-group v-model="filters.minimos" inline>
                  <v-radio label="Minimo" value="minimos" color="info"></v-radio>
                  <v-radio label="Todo" value="" color="info"></v-radio>
                </v-radio-group>
              </v-col>

              <v-btn class="ml-auto" text="X" @click="dialogEdit = false"></v-btn>
            </v-row>
          </v-container>
          <v-expansion-panels v-model="panelAbierto">
            <v-expansion-panel value="productos">
              <v-expansion-panel-title>
                <strong>Productos</strong>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-container>
                  <v-card>
                    <v-card-title>
                      <div class="d-flex justify-end">
                        <v-btn color="success" density="comfortable" @click="agregarTodos">
                          Agregar todos
                        </v-btn>
                      </div>
                    </v-card-title>
                    <v-table density="comfortable" fixed-header height="200px">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Nombre</th>
                          <th>Precio compra</th>
                          <th>Precio venta</th>
                          <th>IVA %</th>
                          <th>IBUA %</th>
                          <th>IMPOCONSUMO %</th>
                          <th>Precio final</th>
                          <th>Stock actual</th>
                          <th>Stock mínimo</th>
                          <th>Agregar</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in productosList" :key="item.id">
                          <td><small>{{ item.codigo_barras }}</small></td>

                          <td><small>{{ item.nombre }}</small></td>
                          <td><small>$ {{ parseFloat(item.precio_compra).toLocaleString('es-ES') }}</small></td>
                          <td><small>$ {{ parseFloat(item.precio_venta).toLocaleString('es-ES') }}</small></td>

                          <td><small>{{ item.iva ? parseFloat(item.iva.valor).toLocaleString('es-ES') + ' %' : '0'
                          }}</small>
                          </td>
                          <td><small>{{ item.ibua ? parseFloat(item.ibua.valor).toLocaleString('es-ES') + ' %' : '0'
                          }}</small>
                          </td>
                          <td><small>{{ item.ipc ? parseFloat(item.ipc.valor).toLocaleString('es-ES') + ' %' : '0'
                          }}</small>
                          </td>
                          <td><small>$ {{ parseFloat(item.precio_final).toLocaleString('es-ES') }}</small></td>
                          <td><small :class="{ 'text-error': item.stock <= item.stock_minimo }">{{ item.stock }}</small>
                          </td>
                          <td><small>{{ item.stock_minimo }}</small></td>
                          <td>
                            <v-btn icon="mdi-plus" color="success" density="comfortable"
                              @click="agregarASeleccionados(item)">
                            </v-btn>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                    <v-pagination v-model="currentPage" :length="lastPage" :total-visible="5"
                      @update:modelValue="fetchProductos" />
                  </v-card>
                </v-container>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
          <br>
          <div class="text-center">
            <v-progress-circular v-show="spinner" color="primary" indeterminate
              :size="75">Espere..</v-progress-circular>
          </div>
          <v-container>


            <v-row>
              <v-col cols="12" md="2">
                <v-text-field v-model="datosCompra.factura_numero" label="Numero de Factura" variant="underlined"
                  color="info" :rules="nombreRules" required clearable />
              </v-col>
              <v-col cols="12" md="4">
                <v-autocomplete v-model="proveedor_id" :items="proveedoresList" item-title="nombreCompleto"
                  :rules="nombreRules" item-value="id" variant="underlined" color="info" label="Proveedor" clearable
                  required>
                  <template v-slot:item="{ props }">
                    <v-list-item v-bind="props"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="2">
                <v-select :items="['Recibido', 'Pendiente']" v-model="datosCompra.status" label="Estado"
                  variant="underlined" color="info"></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn color="success" density="comfortable" @click="crearOrden()">Registrar</v-btn>
              </v-col>
            </v-row>
          </v-container>
          <div class="d-flex justify-end mb-2">
            <v-btn color="dark" density="comfortable" @click="quitarTodos()">
              Quita Todos
            </v-btn>
          </div>
          <v-table density="comfortable" fixed-header height="300px">
            <thead>
              <tr>
                <th style="min-width: 100px;">Código</th>
                <th style="min-width: 100px;">Nombre</th>
                <th style="min-width: 160px;">Precio compra</th>
                <th style="min-width: 160px;">Precio venta</th>
                <th style="min-width: 200px;" class="text-center">IVA %</th>
                <th style="min-width: 200px;" class="text-center">IBUA %</th>
                <th style="min-width: 200px;" class="text-center">IMPOCONSUMO %</th>
                <th>Cantidad Recibida</th>
                <th style="min-width: 120px;">Precio final</th>
                <th style="min-width: 80px;">Quitar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in itemselected" :key="item.id">
                <td><small>{{ item.codigo_barras }}</small></td>
                <td><small>{{ item.nombre }}</small></td>
                <td>
                  <v-text-field v-model="item.precio_compra" type="number" variant="underlined" density="compact"
                    min="1" color="info" clearable>
                  </v-text-field>
                </td>
                <td>
                  <v-text-field v-model="item.precio_venta" type="number" variant="underlined" density="compact" min="1"
                    color="info" clearable>
                  </v-text-field>
                </td>
                <td class="text-center">
                  <v-text-field v-model="item.iva" type="number" variant="underlined" density="compact" min="1"
                    color="info" disabled clearable>
                  </v-text-field>
                </td>
                <td class="text-center">
                  <v-text-field v-model="item.ibua" type="number" variant="underlined" density="compact" min="1"
                    color="info" disabled clearable>
                  </v-text-field>
                </td>
                <td class="text-center">
                  <v-text-field v-model="item.ipc" type="number" variant="underlined" density="compact" min="1"
                    color="info" disabled clearable>
                  </v-text-field>
                </td>
                <td>
                  <v-text-field v-model="item.cantidad" type="number" variant="underlined" density="compact" min="1"
                    color="info" clearable>
                  </v-text-field>
                </td>
                <td>
                  <v-text-field v-model="item.precio_final" type="number" variant="underlined" density="compact" min="1"
                    color="success" disabled>
                  </v-text-field>
                </td>
                <td class="text-center">
                  <v-btn color="dark" @click="deleteItem(item.id)" density="comfortable" icon="mdi-delete-forever"
                    title="Quitar">
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          <br>
          <br>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
  <v-snackbar v-model="snackbarReg" :timeout="timeout">
    <h3 v-if="regerrormsg" class="text-error">{{ regerrormsg }}</h3>
    <template v-slot:actions>
      <v-btn color="blue" variant="text" @click="snackbarReg = false">
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
  <CompraDetalle ref="childCompras" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axiosInst from '@/components/axiosins';
import { useAuthStore } from '@/stores/auth';
import CompraDetalle from '@/views/Compras/CompraDetalle.vue';


const nombreRules = ref([(v) => !!v || 'El campo es requerido'])
const panelAbierto = ref(["productos"]);
const authStore = useAuthStore();
const url = import.meta.env.VITE_APP_API_URL;

const regerrormsg = ref('')
const spinner = ref(false)
const timeout = 4000
const snackbarReg = ref(false)
const dialogEdit = ref(false);
const editando = ref(false);
const search = ref("");
const currentPage = ref(1);
const lastPage = ref(1);
const totalItems = ref(0);
const perPage = ref(10);
const loading = ref(false);
const proveedor_id = ref("");
const filters = ref({ proveedor_id: null, categoria_id: null, minimos: 'minimos' });
const productosList = ref([]);
const categoriasList = ref([])
const proveedoresList = ref([]);
const ImpuestosList = ref([]);
const datosCompra = ref({
  factura_numero: '',
  user_id: authStore.user.id,
  seller_id: proveedor_id,
  tipo_pago: 'Efectivo',
  status: 'Recibido',

});
const itemselected = ref([]);
const childCompras = ref(null);



const dataProveedores = async () => {
  const res = await axiosInst.get(url + "api/proveedoreslist");

  proveedoresList.value = res.data.map(proveedor => ({
    id: proveedor.id,
    nombreCompleto: `${proveedor.nombres} ${proveedor.apellidos || ''}`.trim()
  }));
}

const dataCategorias = async () => {
  const res = await axiosInst.get(url + "api/categoriaslist")
  categoriasList.value = res.data
}

const nuevaCompra = () => {
  editando.value = true;
  dialogEdit.value = true

}

const fetchProductos = async (page = 1) => {
  loading.value = true;
  try {
    const res = await axiosInst.get(url + `api/stock`, {
      params: {
        page,
        search: search.value,
        ...filters.value, // Agregar filtros dinámicamente
      },
    });    
    productosList.value = res.data.data;
    currentPage.value = res.data.current_page;
    lastPage.value = res.data.last_page;
    totalItems.value = res.data.total;
    perPage.value = res.data.per_page;
  } catch (error) {
    console.error("Error al obtener productos", error);
  } finally {
    loading.value = false;
  }
};

const fetchProductosCompletos = async () => {
  loading.value = true;
  let allProducts = [];
  let page = 1;
  try {
    while (true) {
      const res = await axiosInst.get(url + `api/stock`, {
        params: {
          page,
          search: search.value,
          ...filters.value,
        },
      });
      allProducts = [...allProducts, ...res.data.data];

      if (page >= res.data.last_page) break; // Salimos si ya estamos en la última página
      page++;
    }
    return allProducts; // Devolvemos todos los productos
  } catch (error) {
    console.error("Error al obtener todos los productos", error);
    return [];
  } finally {
    loading.value = false;
  }
};


const agregarTodos = async () => {
  spinner.value = true
  const allProducts = await fetchProductosCompletos(); // Traer todos los productos

  allProducts.forEach(producto => {
    const index = itemselected.value.findIndex(item => item.id === producto.id);
    if (index === -1) {
      itemselected.value.push({
        id: producto.id,
        codigo_barras: producto.codigo_barras,
        nombre: producto.nombre,
        precio_venta: producto.precio_venta,
        precio_compra: producto.precio_compra,
        precio_final: producto.precio_final,
        iva: producto.iva?.valor,
        ibua: producto.ibua?.valor,
        ipc: producto.ipc?.valor,
        stock: producto.stock,
        stock_minimo: producto.stock_minimo,
        cantidad: 1
      });
      spinner.value = false
    } else {
      itemselected.value[index].cantidad++;
      spinner.value = false
    }
  });
};


const quitarTodos = () => {
  itemselected.value = [];
};

const agregarASeleccionados = (producto) => {
  const index = itemselected.value.findIndex(item => item.id === producto.id);
  if (index === -1) {
    itemselected.value.push({
      id: producto.id,
      codigo_barras: producto.codigo_barras,
      nombre: producto.nombre,
      precio_venta: producto.precio_venta,
      precio_compra: producto.precio_compra,
      precio_final: producto.precio_final,
      iva: producto.iva?.valor,
      ibua: producto.ibua?.valor,
      ipc: producto.ipc?.valor,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      cantidad: 1
    });
  } else {
    itemselected.value[index].cantidad++;
  }
};


const deleteItem = (id) => {
  const index = itemselected.value.findIndex(item => item.id === id);
  if (index !== -1) {
    itemselected.value.splice(index, 1);

  }
};

const crearOrden = async () => {
  spinner.value = true
  try {
    const purchase = {
      datosCompra: datosCompra.value,
      itemselected: itemselected.value
    };
    const res = await axiosInst.post(url + 'api/purchase', purchase);
 
    itemselected.value = []
    filters.value.proveedor_id = ''
    filters.value.categoria_id = ''
    filters.value.minimos = 'minimos'
    datosCompra.value.factura_numero = ''
    spinner.value = false
    fetchProductos();
    childCompras.value.getPurchases()
    dialogEdit.value = false

  } catch (error) {
    console.log(error)
    snackbarReg.value = true
    regerrormsg.value = error.response.data.message
    spinner.value = false
  }

}
const getImpuestos = async () => {
  try {
    const res = await axiosInst.get(url + 'api/impuestos')
    ImpuestosList.value = res.data
  } catch (error) {

  }
};

watch([search, filters], async () => {
  await fetchProductos();
}, { deep: true });

watch(itemselected, (nuevaLista) => {
  nuevaLista.forEach((item) => {
    const nuevoVenta = parseFloat(item.precio_venta) || 0;

    // Asegurar que los valores sean números y dividirlos por 100
    const ivaPorcentaje = parseFloat(item.iva) / 100 || 0;
    const ibuaPorcentaje = parseFloat(item.ibua) / 100 || 0;
    const ipcPorcentaje = parseFloat(item.ipc) / 100 || 0;

    // Calcular impuestos sobre el precio de venta
    const iva = nuevoVenta * ivaPorcentaje;
    const ibua = nuevoVenta * ibuaPorcentaje;
    const ipc = nuevoVenta * ipcPorcentaje;

    // Calcular precio final con impuestos incluidos
    let precioFinal = nuevoVenta + iva + ibua + ipc;

    // Función para redondear a la centena más cercana
    const redondearPrecio = (precio) => {
      const centena = Math.floor(precio / 100) * 100; // Redondear a la centena inferior
      const residuo = precio % 100;

      return residuo < 50 ? centena : centena + 100; // Redondear según el residuo
    };

    // Asignar el precio redondeado
    item.precio_final = redondearPrecio(precioFinal);
  });
}, { deep: true });



onMounted(() => {
  fetchProductos()
  dataProveedores()
  dataCategorias()
  getImpuestos()
});
</script>
