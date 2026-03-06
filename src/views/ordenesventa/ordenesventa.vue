<template>
  <v-alert text="Registro de ventas POS" title="Facturas de Ventas" type="primary"
    icon="mdi-ballot-recount-outline"></v-alert><br>
  <v-container>
    <v-row>
      <v-col cols="12" md="2">
        <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="# factura, Cliente " variant="underlined"
          color="primary" />
      </v-col>
      <v-col cols="12" md="3">
        <v-chip label color="primary" text-color="primary">
          <v-icon left>icon</v-icon> Fecha inicial
        </v-chip>
        <input type="date" v-model="fechaini">
      </v-col>
      <v-col cols="12" md="3">
        <v-chip label color="primary" text-color="primary">
          <v-icon left>icon</v-icon> Fecha final
        </v-chip>
        <input type="date" v-model="fechafin">
      </v-col>
      <v-col cols="12" md="1">
        <v-btn color="primary" @click="getOrders()">Filtrar</v-btn>
      </v-col>

      <v-col cols="12" md="1">
        <v-btn color="primary" @click="reload()">Todas</v-btn>
      </v-col>
      <v-col cols="12" md="1">
        <v-btn title="Descargar Excel" color="success" icon="mdi-file-excel-outline" @click="ventaFechaExcel()"
          density="comfortable"></v-btn>
      </v-col>
    </v-row>
  </v-container>
  <table>
    <thead>
      <tr>
        <th class="text-left">
          Factura No.
        </th>
        <th class="text-left">
          Vendedor
        </th>
        <th class="text-left">
          Cliente
        </th>
        <th class="text-left">
          Forma de Pago
        </th>
        <th class="text-left">
          Total
        </th>
        <th class="text-left">
          Fecha de Venta
        </th>
        <th class="text-left">
          Ver/Tirilla/Excel/PDF
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-show="trLoading">
        <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
        <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
        <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
        <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
        <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
        <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
      </tr>
      <tr v-for="ord in ordersList.data" :key="ord.id">

        <td><small>{{ ord.factura_numero }}</small></td>
        <td><small>{{ ord.user?.nombres ?? '' }} , {{ ord.user.apellidos ?? '' }}</small></td>
        <td><small>{{ ord.client.nombres ?? '' }} , {{ ord.client.apellidos ?? '' }}</small></td>
        <td><small>{{ ord.forma_pago_nombre }}/{{ ord.metodo_pago_nombre }}</small></td>
        <td><small>${{ parseFloat(ord.total).toLocaleString('es-ES') }}</small></td>
        <td><small>{{ formatFecha(ord.created_at) }}</small></td>
        <td>
          <v-btn color="dark" @click="verFactura(ord.id), dialogEdit = true" density="comfortable"
            icon="mdi mdi-eye-outline" title="Ver"></v-btn>
          <v-btn color="dark" @click="impFactura(ord.uuid)" density="comfortable" icon="mdi mdi-printer-outline"
            title="Imprimir factura"></v-btn>
          <v-btn color="success" @click="ventaFechaExcel(ord.id)" density="comfortable" icon="mdi-file-excel-outline"
            title="Exportar Excel"></v-btn>
          <v-btn @click="facturaPDF(ord.uuid)" density="comfortable" color="error" icon="mdi mdi-file-pdf-box"
            title="Ver en PDF"></v-btn>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="text-center">
    <v-pagination v-model="currentPage" :length="lastPage" :total-visible="10" @update:modelValue="getOrders" />
  </div>

  <div class="pa-4 text-center">
    <v-dialog max-width="900" v-model="dialogEdit" scrollable>
      <v-card elevation="8" class="rounded-lg">
        <v-container>
          <!-- Encabezado Factura -->
          <v-row align="center" justify="space-between">
            <v-col cols="6">
              <h2 class="blue--text font-weight-bold">FACTURA</h2>
              <p><strong>N°:</strong> {{ orderDetail.factura_numero }}</p>
              <p><strong>Fecha:</strong> {{ formatFecha(orderDetail.created_at) }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- Datos del cliente -->
          <v-row>
            <v-col cols="12">
              <v-sheet rounded class="pa-4 blue lighten-5">
                <v-row>
                  <v-col cols="6">
                    <p><strong>Nombre:</strong> {{ orderDetail.client?.nombres ?? '' }} {{ orderDetail.client?.apellidos
                      ?? '' }}</p>
                    <p><strong>CC/NIT:</strong> {{ orderDetail.client?.numidentificacion ?? '' }}</p>
                    <p><strong>Tel:</strong> {{ orderDetail.client?.telefono ?? '' }}</p>
                  </v-col>
                  <v-col cols="6">
                    <p><strong>Email:</strong> {{ orderDetail.client?.email ?? '' }}</p>
                    <p><strong>Dirección:</strong> {{ orderDetail.client?.ubicacion ?? '' }}</p>
                  </v-col>
                </v-row>
              </v-sheet>
            </v-col>
          </v-row>

          <!-- Tabla de productos -->
          <v-simple-table class="mt-6" dense>
            <thead class="blue darken-3 white--text">
              <tr>
                <th class="text-left white--text">Código</th>
                <th class="text-left white--text">Producto / Plan</th>
                <th class="text-right white--text">Cant</th>
                <th class="text-right white--text">Precio Unitario</th>
                <th class="text-right white--text">IVA</th>
                <th class="text-right white--text">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detalle in orderDetail.details" :key="detalle.id">
                <td>
                  {{ detalle.producto?.codigo_barras || (detalle.subscription?.plan ? 'PLAN-' +
                    detalle.subscription.plan.id : 'N/A') }}
                </td>

                <td>
                  <div v-if="detalle.producto">
                    {{ detalle.producto.nombre }}
                  </div>
                  <div v-else-if="detalle.subscription?.plan">
                    <strong>Plan:</strong> {{ detalle.subscription.plan.name }}-{{ detalle.subscription.plan.description }}
                    <div class="text-caption text-grey">Mascota: {{ detalle.subscription.pet?.name || 'N/A' }}</div>
                  </div>
                  <div v-else>Servicio general</div>
                </td>
                <td class="text-right">
                  {{ Number(detalle.cantidad) % 1 === 0 ? Number(detalle.cantidad) : Number(detalle.cantidad).toFixed(3)
                  }}
                </td>
                <td class="text-right">
                  ${{ parseFloat(detalle.precio_unitario).toLocaleString('es-ES') }}
                </td>
                <td class="text-right">${{ parseFloat(detalle.iva || 0).toLocaleString('es-ES') }}</td> 
                <td class="text-right font-weight-bold">
                  ${{ (
                    (Number(detalle.cantidad) * Number(detalle.precio_unitario)) +
                    Number(detalle.iva || 0) +
                    Number(detalle.ibua || 0) +
                    Number(detalle.ipc || 0)
                  ).toLocaleString('es-ES') }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>

          <v-row class="mt-6">
            <v-col cols="8">
              <v-chip v-if="orderDetail.metodo_pago_nombre" color="blue lighten-4" text-color="blue darken-4">
                {{ orderDetail.metodo_pago_nombre }}
              </v-chip>
            </v-col>
            <v-col cols="4">
              <v-sheet rounded class="pa-4 blue lighten-5 text-right">
                <h3 class="blue--text font-weight-bold">TOTAL</h3>
                <h2 class="font-weight-bold">${{ parseFloat(orderDetail.total).toLocaleString('es-ES') }}</h2>
              </v-sheet>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- Botón Cerrar -->
          <v-card-actions class="justify-end">
            <v-btn color="primary" variant="tonal" @click="dialogEdit = false">Cerrar</v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </div>

  <template>
    <v-dialog max-width="400" v-model="dialogImp">
      <v-card>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="recargarIframe"><span class="mdi mdi-printer-outline"></span>Imprimir</v-btn>
          <v-btn @click="dialogImp = false">X</v-btn>
        </v-card-actions>
        <v-card-text>
          <iframe :key="iframeKey" v-if="pdfUrl" :src="pdfUrl" width="100%" height="600px" frameborder="0">
          </iframe>
        </v-card-text>
      </v-card>
    </v-dialog>
  </template>

</template>

<script setup>
import axiosInst from '@/components/axiosins'
import { ref, onMounted, computed, watch } from 'vue'

const url = import.meta.env.VITE_APP_API_URL
const trLoading = ref(true)
const dialogImp = ref(false)
const pdfUrl = ref('')
const dialogEdit = ref(false)
const orderDetail = ref([])
const search = ref('')
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(10)
const fechaini = ref(null)
const fechafin = ref(null)
const iframeKey = ref(Date.now())
const ordersList = ref({
  current_page: 1,
  data: [],
  last_page: 1,
  next_page_url: null,
  prev_page_url: null,
})
const empresa = ref({
  id: '',
  nombre: '',
  nit: '',
  telefonos: '',
  email: '',
  direccion: '',
  ciudad: '',
  logotiopo: ''
});
const props = defineProps({
  ordersList: Object
});



const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getOrders = async (page = 1) => {
  try {
    const res = await axiosInst.get(url + `api/orderlist`, {
      params: {
        page,
        search: search.value || '',
        fechaini: fechaini.value,
        fechafin: fechafin.value
      },
    });
    console.log(res.data)
    currentPage.value = res.data.current_page;
    lastPage.value = res.data.last_page;
    perPage.value = res.data.per_page;
    trLoading.value = false
    ordersList.value = res.data
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
};

const ventaFechaExcel = async (id = null) => {
  try {
    const res = await axiosInst.post(
      url + 'api/ventafechaexcel',
      {
        fechaini: fechaini.value || null,
        fechafin: fechafin.value || null,
        id: id || null,
      },
      { responseType: 'blob' }
    );

    const blob = new Blob([res.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'ventas.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
  }
};


const impFactura = (id) => {
  pdfUrl.value = url + "ticket/" + id;
  dialogImp.value = true;
};

const recargarIframe = () => {
  iframeKey.value = Date.now()
}

const verFactura = async (id) => {
  const res = await axiosInst.get(url + 'api/ordershow/' + id);
  console.log(res.data)
  orderDetail.value = res.data;
}

const facturaPDF = (id) => {
  window.open(url + 'facturapdf/' + id);
}


watch(search, () => {
  if (search.value.length >= 3) {
    getOrders();
  }
});

const reload = () => {
  search.value = ''
  fechaini.value = ''
  fechafin.value = ''
  getOrders()
}

onMounted(() => {
  getOrders()
})

</script>
