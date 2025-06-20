<template>
  <v-alert text="Registro de ventas POS" title="Facturas de Ventas" type="info"
    icon="mdi-ballot-recount-outline"></v-alert><br>
  <v-container>
    <v-row>
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
        <v-btn color="info" @click="ventaFecha()">Filtrar</v-btn>
      </v-col>
      <v-col cols="12" md="1">
        <v-btn title="Descargar Excel" color="success" icon="mdi-file-excel-outline" @click="ventaFechaExcel()" density="comfortable"></v-btn>
      </v-col>
      <v-col cols="12" md="1">
        <v-btn color="info" @click="getOrders()">Todas</v-btn>
      </v-col>
      <v-col cols="12" md="3">
        <v-chip color="success">Total Ganancias: ${{ totalGanancia.toLocaleString('es-ES') }}</v-chip>
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
          Ganancias
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
        <td><v-skeleton-loader type="article"></v-skeleton-loader></td>

      </tr>
      <tr v-for="ord in ordersList.data" :key="ord.id">

        <td><small>{{ ord.factura_numero }}</small></td>
        <td><small>{{ ord.user?.nombres ?? '' }} , {{ ord.user.apellidos ?? '' }}</small></td>
        <td><small>{{ ord.client.nombres ?? '' }} , {{ ord.client.apellidos ?? '' }}</small></td>
        <td><small>{{ ord.tipo_pago }}</small></td>
        <td><small>${{ parseFloat(ord.total).toLocaleString('es-ES') }}</small></td>
        <td><small>${{ parseFloat(ord.total_ganancia).toLocaleString('es-ES') }}</small></td>
        <td><small>{{ formatFecha(ord.created_at) }}</small></td>
        <td>
          <v-btn color="dark" @click="verFactura(ord.id), dialogEdit = true" density="comfortable"
            icon="mdi mdi-eye-outline" title="Ver"></v-btn>
          <v-btn color="dark" @click="impFactura(ord.uuid)" density="comfortable" icon="mdi mdi-printer-outline"
            title="Imprimir factura"></v-btn>
            <v-btn color="success" @click="ventaFechaExcel(ord.id)" density="comfortable" icon="mdi-file-excel-outline"
            title="Exportar Excel"></v-btn>
            <v-btn @click="facturaPDF(ord.uuid)" density="comfortable"
            color="error" icon="mdi mdi-file-pdf-box" title="Ver en PDF"></v-btn>
        </td>       
      </tr>
    </tbody>
  </table>
  <div class="text-center">
    <v-btn @click="getOrders(ordersList.prev_page_url)" :disabled="!ordersList.prev_page_url"
      icon="mdi mdi-chevron-left" density="comfortable">
    </v-btn>
    <span>&nbsp;Página {{ ordersList.current_page }} / {{ ordersList.last_page }}&nbsp;</span>
    <v-btn @click="getOrders(ordersList.next_page_url)" :disabled="!ordersList.next_page_url"
      icon="mdi mdi-chevron-right" density="comfortable">
    </v-btn>
  </div>

  <div class="pa-4 text-center">
    <v-dialog max-width="800" v-model="dialogEdit">
      <template v-slot:default="{ isActive }">

        <v-card class="pa-5">

          <v-container>
            <v-btn @click="facturaPDF(orderDetail.uuid)" density="comfortable">Ver en PDF</v-btn>
            <v-row>
              <v-col cols="6">

                <v-img src="/logo.png" max-height="50" contain></v-img>
                <h3 class="text-title">{{ empresa.nombre }}</h3>
                <p><strong>NIT:</strong> {{ empresa.nit }}</p>
                <p><strong>Tel:</strong> {{ empresa.telefonos }}</p>
                <p><strong>Email:</strong> {{ empresa.email }}</p>
                <p><strong>Dirección:</strong> {{ empresa.direccion }}</p>
                <p><strong>Ciudad:</strong> {{ empresa.ciudad }}</p>
              </v-col>
              <v-col cols="6" class="text-right">
                <h4 class="blue--text">FACTURA</h4>
                <p><strong>N°:</strong> {{ orderDetail.id }}</p>
                <p><strong>Fecha:</strong> {{ formatFecha(orderDetail.created_at) }}</p>
                <p><strong>Condiciones:</strong> Próximos 30 días</p>
              </v-col>
            </v-row>

            <v-divider></v-divider>

            <!-- Datos del cliente -->
            <v-row class="mt-3">
              <v-col cols="6">
                <v-sheet class="pa-3 blue lighten-4">
                  <h5 class="blue--text">FACTURAR A:</h5>
                  <p><strong>Nombre:</strong> {{ orderDetail.client?.nombres ?? '' }}, {{ orderDetail.client?.apellidos
                    ?? '' }}</p>
                  <p><strong>CC/NIT:</strong> {{ orderDetail.client?.numidentificacion ?? '' }}</p>
                  <p><strong>Tel:</strong> {{ orderDetail.client?.telefono ?? '' }}</p>
                  <p><strong>Email:</strong> {{ orderDetail.client?.email ?? '' }}</p>
                  <p><strong>Dirección:</strong> {{ orderDetail.client?.ubicacion ?? '' }}</p>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="pa-3 blue lighten-4">
                  <h5 class="blue--text">ENVIAR A:</h5>
                  <p>Mismo que facturación</p>
                </v-sheet>
              </v-col>
            </v-row>

            <!-- Tabla de productos -->
            <table class="mt-5" dense>
              <thead class="blue darken-3 white--text">
                <tr>
                  <th class="text-left">Producto</th>
                  <th class="text-right">Cant</th>
                  <th class="text-right">Precio Unitario</th>
                  <th class="text-right">Iva</th>
                  <th class="text-right">Ibua</th>
                  <th class="text-right">Ipc</th>
                  <th class="text-right">Sub Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detalle in orderDetail.details" :key="detalle.id">
                  <td><small>{{ detalle.producto.nombre }}</small></td>
                  <td class="text-right">  <small>{{ Number(detalle.cantidad) % 1 === 0 ? Number(detalle.cantidad) : Number(detalle.cantidad).toFixed(3) }}</small>
                  </td>
                  <td class="text-right"><small>${{ parseFloat(detalle.producto.precio_venta).toLocaleString('es-ES')
                  }}</small></td>
                  <td class="text-right"><small>{{ detalle.iva }}</small></td>
                  <td class="text-right"><small>{{ detalle.ibua }}</small></td>
                  <td class="text-right"><small>{{ detalle.ipc }}</small></td>
                  <td class="text-right"><small>${{ (Number(detalle.cantidad) * Number(detalle.precio_unitario)
                  ).toLocaleString('es-ES') }}
                    </small></td>
                </tr>
              </tbody>
            </table>

            <!-- Totales -->
            <v-row class="mt-5">
              <v-col cols="8"></v-col>
              <v-col cols="4">
                <v-sheet class="pa-3 blue lighten-4">
                  <h4 class="mt-3 blue--text"><strong>Total:</strong> ${{
                    parseFloat(orderDetail.total).toLocaleString('es-ES') }}</h4>
                </v-sheet>
              </v-col>
            </v-row>

            <!-- Mensaje final -->
            <v-divider class="mt-5"></v-divider>
            <p class="text-center mt-3 blue--text"><strong>GRACIAS</strong></p>
            <p class="text-center">Si tiene preguntas sobre esta factura, contáctenos.</p>
          </v-container>
        </v-card>
      </template>
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
import { ref, onMounted, computed } from 'vue'

const url = import.meta.env.VITE_APP_API_URL
const trLoading = ref(true)
const dialogImp = ref(false)
const pdfUrl = ref('')
const dialogEdit = ref(false)
const orderDetail = ref([])
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

const totalGanancia = computed(() => {
  return ordersList.value.data?.reduce((sum, ord) => sum + (parseFloat(ord.total_ganancia) || 0), 0) || 0;
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

const getOrders = async (urls = url + 'api/orderlist?page=1') => {
  fechaini.value = ''
  fechafin.value = ''
  try {
    const res = await axiosInst.get(urls)
    trLoading.value = false
    ordersList.value = res.data
  } catch (error) {

  }
}

const ventaFecha = async () => {
  try {
    const res = await axiosInst.post(url + 'api/ventafecha', {
      fechaini: fechaini.value,
      fechafin: fechafin.value
    });
    ordersList.value = res.data
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
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
  orderDetail.value = res.data;
}

const facturaPDF = (id) => {
  window.open(url + 'facturapdf/' + id);
}

const datosNegocio = async () => {
  const res = await axiosInst.get(url + 'api/settings')
  empresa.value = res.data
};


onMounted(() => {
  getOrders()
  datosNegocio()
})

</script>
