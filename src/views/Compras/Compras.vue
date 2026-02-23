<template>
  <!-- ✅ ALERTA INICIAL -->
  <v-alert title="Facturas de Compras" text="Ingreso de facturas de compra, actualice precios y stock" type="primary"
    icon="mdi-ballot-recount-outline" />

  <!-- ✅ BOTÓN NUEVA COMPRA -->
  <v-chip label color="primary" text-color="primary">
    <v-btn icon="mdi mdi-plus" density="compact" name="compra" title="Nueva compra" @click="nuevaCompra" />
    Nuevo Ingreso
  </v-chip>

  <v-container>
    <!-- ✅ DIALOGO PRINCIPAL -->
    <div class="text-center pa-4">
      <v-dialog v-model="dialogEdit" fullscreen>
        <v-card max-width="auto">
          <!-- 📦 EXPANSIÓN PRODUCTOS -->
          <v-btn class="ml-auto" text="X" @click="dialogEdit = false" />
          <v-expansion-panels v-model="panelAbierto">
            <v-expansion-panel value="productos">
              <v-expansion-panel-title>

                <strong>Productos</strong>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-container>
                  <v-card>
                    <v-container>
                      <!-- 🔍 FILTROS -->
                      <v-row>
                        <v-col cols="12" md="2">
                          <v-text-field v-model="search" label="Codigo de barras o nombre" variant="underlined"
                            color="primary" clearable append-inner-icon="mdi-magnify" />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-autocomplete v-model="filters.proveedor_id" :items="proveedoresList"
                            item-title="nombreCompleto" item-value="id" variant="underlined" color="primary"
                            label="Proveedor" :rules="nombreRules" required clearable>
                            <template v-slot:item="{ props }">
                              <v-list-item v-bind="props" />
                            </template>
                          </v-autocomplete>
                        </v-col>

                        <v-col cols="12" md="2">
                          <v-autocomplete v-model="filters.categoria_id" :items="categoriasList" item-title="nombre"
                            item-value="id" label="Categoria" variant="underlined" color="primary" clearable>
                            <template v-slot:item="{ props }">
                              <v-list-item v-bind="props" />
                            </template>
                          </v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-container>

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
                          }}</small></td>
                          <td><small>{{ item.ibua ? parseFloat(item.ibua.valor).toLocaleString('es-ES') + ' %' : '0'
                          }}</small></td>
                          <td><small>{{ item.ipc ? parseFloat(item.ipc.valor).toLocaleString('es-ES') + ' %' : '0'
                          }}</small></td>
                          <td><small>$ {{ parseFloat(item.precio_final).toLocaleString('es-ES') }}</small></td>
                          <td>
                            <small :class="{ 'text-error': item.stock <= item.stock_minimo }">
                              {{ item.stock }}
                            </small>
                          </td>
                          <td><small>{{ item.stock_minimo }}</small></td>
                          <td>
                            <v-btn icon="mdi-plus" color="success" density="comfortable"
                              @click="agregarASeleccionados(item)" />
                          </td>
                        </tr>
                      </tbody>
                    </v-table>

                    <!-- 📄 PAGINACIÓN -->
                    <v-pagination v-model="currentPage" :length="lastPage" :total-visible="5"
                      @update:modelValue="fetchProductos" />
                  </v-card>
                </v-container>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- ⏳ SPINNER -->
          <div class="text-center">
            <v-progress-circular v-show="spinner" color="primary" indeterminate :size="75">
              Espere..
            </v-progress-circular>
          </div>
          <!-- 📝 FORMULARIO COMPRA -->

          <v-container fluid>
            <v-card class="pa-4" elevation="2">
              <v-toolbar color="transparent" density="compact">
                <v-toolbar-title class="text-h5 font-weight-bold">FACTURA DE INGRESO</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-chip color="primary" variant="elevated" size="large" class="mr-2">
                  Total: ${{ parseFloat(totalfactura).toLocaleString('es-ES') }}
                </v-chip>
                <v-btn color="error" variant="tonal" prepend-icon="mdi-trash-can" @click="quitarTodos()">
                  Limpiar
                </v-btn>
              </v-toolbar>

              <v-divider class="my-4"></v-divider>

              <v-row dense>
                <v-col cols="12" md="3">
                  <v-form @submit.prevent="searchCodigo()">
                    <v-text-field ref="codigoBarrasInput" v-model="txtregdata.codigo_barras" label="Código de barras"
                      variant="outlined" density="compact" color="primary" prepend-inner-icon="mdi-barcode-scan"
                      append-inner-icon="mdi-magnify" hide-details />
                  </v-form>
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field v-model="datosCompra.factura_numero" label="Número de Factura" variant="outlined"
                    density="compact" color="primary" hide-details
                    @input="datosCompra.factura_numero = $event.target.value.toUpperCase()" />
                </v-col>

                <v-col cols="12" md="3">
                  <v-autocomplete v-model="proveedor_id" :items="proveedoresList" item-title="nombreCompleto"
                    item-value="id" label="Proveedor" variant="outlined" density="compact" color="primary" 
                    hide-details />
                </v-col>                             
               <v-col cols="12" md="2">
                  <v-select v-model="datosCompra.tipo_compra" :items="['Costo', 'Gasto']" label="Costo/Gasto"
                    variant="outlined" density="compact" color="primary" hide-details />
                </v-col>               
              
                <v-col cols="12" md="3">
                  <v-select v-model="datosCompra.forma_pago" :items="formasPago" label="Forma de Pago"
                    item-title="title" item-value="value" variant="outlined" density="compact" hide-details color="primary"/>
                </v-col>
                <v-col cols="12" md="3">
                  <v-expand-x-transition>
                    <v-select v-if="datosCompra.forma_pago === '1'" v-model="datosCompra.metodo_pago"
                      :items="metodosPago" label="Método de Pago" item-title="title" item-value="value"
                      variant="outlined" density="compact" hide-details  color="primary" />
                  </v-expand-x-transition>
                </v-col>

                <v-col cols="12" md="3">
                  <v-select v-model="datosCompra.status" :items="['Pagado', 'Pendiente de Pago']" label="Estado"
                    variant="outlined" density="compact" color="primary" hide-details />
                </v-col>
              </v-row>

              <v-table density="compact" class="mt-6 border rounded">
                <thead>
                  <tr class="bg-grey-lighten-4">
                    <th class="text-overline">Cod/Producto</th>
                    <th class="text-overline text-center" width="120">P. Compra</th>
                    <th class="text-overline text-center" width="120">P. Venta</th>
                    <th class="text-overline text-center">Ganancia</th>
                    <th class="text-overline text-center" width="80">IVA%</th>
                    <th class="text-overline text-center" width="80">IBUA%</th>
                    <th class="text-overline text-center" width="80">IMPOCONSUMO%</th>
                    <th class="text-overline text-center" width="120">Cantidad</th>
                    <th class="text-overline text-center" width="130">Precio Final</th>
                    <th class="text-overline text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in itemselected" :key="item.id">
                    <td>
                      <div class="font-weight-bold">{{ item.codigo_barras }}/{{ item.nombre }}</div>
                     
                    </td>

                    <td>
                      <v-text-field v-model="item.precio_compra" type="number" variant="underlined" density="compact"
                        hide-details />
                    </td>

                    <td>
                      <v-text-field v-model="item.precio_venta" type="number" variant="underlined" density="compact"
                        hide-details />
                    </td>

                    <td class="text-center">
                      <v-chip size="small" :color="item.ganancia > 0 ? 'success' : 'error'" variant="tonal">
                        {{ item.ganancia }}
                      </v-chip>
                    </td>

                    <td class="text-center text-caption">{{ item.iva }}%</td>
                    <td class="text-center text-caption">{{ item.ibua }}%</td>
                    <td class="text-center text-caption">{{ item.ipc }}%</td>
                    <td>
                      <v-text-field v-model="item.cantidad" type="number" min="1" variant="outlined" density="compact"
                        hide-details @change="saveToLocalStorage()" />
                    </td>

                    <td class="text-center font-weight-black text-success">
                      ${{ item.precio_final }}
                    </td>

                    <td class="text-center">
                      <v-btn color="error" variant="text" icon="mdi-close-circle" size="small"
                        @click="deleteItem(item.id)" />
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <v-card-actions class="justify-end pt-6">
                <v-btn color="success" variant="elevated" size="large" prepend-icon="mdi-check-bold"
                  @click="crearOrden()">
                  Registrar Ingreso
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-container>
          <!-- ✅ SNACKBAR -->
          <v-snackbar v-model="snackbarReg" :timeout="timeout">
            <h3 v-if="regerrormsg" class="text-error">{{ regerrormsg }}</h3>
            <template v-slot:actions>
              <v-btn color="blue" variant="text" @click="snackbarReg = false">
                Cerrar
              </v-btn>
            </template>
          </v-snackbar>
        </v-card>
      </v-dialog>
    </div>
  </v-container>


  <!-- ✅ COMPONENTE DETALLE -->
  <CompraDetalle ref="childCompras" />

</template>


<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axiosInst from '@/components/axiosins';
import { useAuthStore } from '@/stores/auth';
import CompraDetalle from '@/views/Compras/CompraDetalle.vue';
import { CodigosDian } from '@/composables/CodigosDian'


const nombreRules = ref([(v) => !!v || 'El campo es requerido'])
const panelAbierto = ref(["productos"]);
const authStore = useAuthStore();
const url = import.meta.env.VITE_APP_API_URL;
const { metodosPago, formasPago } = CodigosDian();
const regerrormsg = ref('')
const spinner = ref(false)
const timeout = 4000
const snackbarReg = ref(false)
const dialogEdit = ref(false);
const editando = ref(false);
const currentPage = ref(1);
const search = ref("");
const lastPage = ref(1);
const totalItems = ref(0);
const perPage = ref(10);
const loading = ref(false);
const proveedor_id = ref("");
const filters = ref({ proveedor_id: null, categoria_id: null });
const productosList = ref([]);
const categoriasList = ref([])
const proveedoresList = ref([]);
const ImpuestosList = ref([]);
const datosCompra = ref({
  factura_numero: '',
  user_id: authStore.user.id,
  seller_id: proveedor_id,
  forma_pago: '1',     // 1 contado | 2 crédito
  metodo_pago: '10',   // efectivo por defecto
  tipo_compra: 'Costo',
  status: 'Pagado',
});
const txtregdata = ref({
  codigo_barras: ''
});
const itemselected = ref([]);
const childCompras = ref(null);

const totalfactura = computed(() => {
  return itemselected.value.reduce((acc, item) => {
    const subtotal = Number(item.precio_compra) * Number(item.cantidad)
    const iva = subtotal * (Number(item.iva) / 100)
    const ibua = subtotal * (Number(item.ibua) / 100)
    const ipc = subtotal * (Number(item.ipc) / 100)
    return acc + subtotal + iva + ibua + ipc
  }, 0)
})


const loadStorageList = () => {
  const productosStorage = JSON.parse(localStorage.getItem('itemsCompra'));
  if (productosStorage) {
    itemselected.value = productosStorage;
  }
};


const saveToLocalStorage = () => {
  localStorage.setItem('itemsCompra', JSON.stringify(itemselected.value));
};


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

const searchCodigo = async () => {
  try {
    const codigo = txtregdata.value.codigo_barras;
    const res = await axiosInst.get(`${url}api/searchcodigoproducto/${codigo}`);
    console.log(res.data)
    // Buscar si ya existe por ID o código de barras
    const productoExistente = itemselected.value.find(
      item => item.id === res.data.id || item.codigo_barras === codigo
    );

    if (productoExistente) {
      // Sumar cantidad
      productoExistente.cantidad++;
    } else {
      // Agregar nuevo producto
      itemselected.value.push({
        id: res.data.id,
        codigo_barras: res.data.codigo_barras,
        nombre: res.data.nombre,
        precio_venta: res.data.precio_venta,
        precio_compra: res.data.precio_compra,
        precio_venta_ajustado: res.data.precio_venta_ajustado,
        precio_final: res.data.precio_final,
        iva: res.data.iva?.valor ?? 0,
        ibua: res.data.ibua?.valor ?? 0,
        ipc: res.data.ipc?.valor ?? 0,
        stock: res.data.stock,
        stock_minimo: res.data.stock_minimo,
        cantidad: 1
      });
    }
    saveToLocalStorage()
    txtregdata.value.codigo_barras = ''
    txtregdata.value.codigo_barras.focus();
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error('Producto no encontrado');
    } else {
      console.error('Error al buscar el producto', error);
    }
  }
};



const quitarTodos = () => {
  itemselected.value = [];
  saveToLocalStorage()
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
      precio_venta_ajustado: producto.precio_venta_ajustado,
      precio_final: producto.precio_final,
      iva: producto.iva?.valor ?? 0,
      ibua: producto.ibua?.valor ?? 0,
      ipc: producto.ipc?.valor ?? 0,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      cantidad: 1
    });
    saveToLocalStorage()
  } else {
    itemselected.value[index].cantidad++;
    saveToLocalStorage()
  }
};


const deleteItem = (id) => {
  const index = itemselected.value.findIndex(item => item.id === id);
  if (index !== -1) {
    itemselected.value.splice(index, 1);
    saveToLocalStorage()
  }
};

const crearOrden = async () => {
  let confirmar = confirm('¿Desea crear el registro?')
  if (confirmar) {
    spinner.value = true
    itemselected.value.forEach((item) => {
      const ventaFinal = parseFloat(item.precio_venta_ajustado) || parseFloat(item.precio_venta);
      item.precio_venta = ventaFinal; // sobrescribimos para enviar el correcto
    });
    try {
      const purchase = {
        datosCompra: datosCompra.value,
        itemselected: itemselected.value
      };
      const res = await axiosInst.post(url + 'api/purchase', purchase);

      itemselected.value = []
      saveToLocalStorage()
      filters.value.proveedor_id = ''
      filters.value.categoria_id = ''
      filters.value.minimos = 'minimos'
      datosCompra.value.factura_numero = ''
      datosCompra.value.tipo_compra = 'Costo'
      proveedor_id.value = ''
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
    const ventaUsuario = parseFloat(item.precio_venta) || 0;
    const compra = parseFloat(item.precio_compra) || 0;

    if (!ventaUsuario || compra <= 0) {
      item.ganancia = 0;
      return;
    }

    const ivaPorcentaje = parseFloat(item.iva) / 100 || 0;
    const ibuaPorcentaje = parseFloat(item.ibua) / 100 || 0;
    const ipcPorcentaje = parseFloat(item.ipc) / 100 || 0;

    const totalImpuestos = ivaPorcentaje + ibuaPorcentaje + ipcPorcentaje;
    const divisor = 1 + totalImpuestos;

    const redondear = (precio) => {
      return precio < 100 ? parseFloat(precio.toFixed(2)) : Math.round(precio / 50) * 50;
    };


    const precioFinal = redondear(ventaUsuario * divisor);
    const baseCalculado = precioFinal / divisor;

    const iva = baseCalculado * ivaPorcentaje;
    const ibua = baseCalculado * ibuaPorcentaje;
    const ipc = baseCalculado * ipcPorcentaje;

    item.precio_venta_ajustado = baseCalculado.toFixed(2);
    item.iva_calculado = iva.toFixed(2);
    item.ibua_calculado = ibua.toFixed(2);
    item.ipc_calculado = ipc.toFixed(2);
    item.precio_final = precioFinal;


    item.ganancia = (ventaUsuario - compra).toFixed(2);
  });
}, { deep: true });





onMounted(() => {
  loadStorageList();
  fetchProductos()
  dataProveedores()
  dataCategorias()
  getImpuestos()
});
</script>
