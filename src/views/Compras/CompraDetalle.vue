<template>
  <v-container>
    <v-row> <v-col cols="12" md="2">
        <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="Numero factura "
          variant="underlined" color="info" />
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
        <v-btn color="info" @click="ordenFecha()">Filtrar</v-btn>
      </v-col>
      <v-col cols="12" md="1">
        <v-btn title="Descargar Excel" color="success" icon="mdi-file-excel-outline" @click="compraFechaExcel()"
          density="comfortable"></v-btn>
      </v-col>
      <v-col cols="12" md="1">
        <v-btn color="info" @click="getPurchases()">Todas</v-btn>
      </v-col>
    </v-row>
  </v-container>
  <table>
    <thead>
      <tr>
        <th class="text-left">
          Factura Numero
        </th>
        <th class="text-left">
          Ingresada por
        </th>
        <th class="text-left">
          Proveedor
        </th>
        <th class="text-left">
          Forma de Pago
        </th>
        <th class="text-left">
          Total
        </th>
        <th class="text-left">
          Estado
        </th>
        <th class="text-left">
          Fecha de Creación
        </th>
        <th class="text-left">
          Ver/Imprimir
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
      <tr v-for="ord in purchasesList.data" :key="ord.id">
        <td><small>{{ ord.factura_numero }}</small></td>
        <td><small>{{ ord.user?.nombres ?? '' }} , {{ ord.user?.apellidos ?? '' }}</small></td>
        <td><small>{{ ord.seller?.nombres ?? '' }} , {{ ord.seller.apellidos ?? '' }}</small></td>
        <td><small>{{ ord.tipo_pago }}</small></td>
        <td><small>$ {{ parseFloat(ord.total).toLocaleString('es-ES') }}</small></td>
        <td><small>{{ ord.status }}</small></td>
        <td><small>{{ formatFecha(ord.created_at) }}</small></td>
        <td>
          <v-btn @click="verOrden(ord.id), dialogEdit = true" color="dark" density="comfortable"
            icon="mdi mdi-eye-outline" title="Ver"></v-btn>
          <v-btn @click="compraPDF(ord.id)" density="comfortable" icon="mdi mdi-printer-outline"></v-btn>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="text-center">
    <v-btn @click="getOrders(purchasesList.prev_page_url)" :disabled="!purchasesList.prev_page_url"
      icon="mdi mdi-chevron-left" density="comfortable">
    </v-btn>
    <span>&nbsp;Página {{ purchasesList.current_page }} / {{ purchasesList.last_page }}&nbsp;</span>
    <v-btn @click="getOrders(purchasesList.next_page_url)" :disabled="!purchasesList.next_page_url"
      icon="mdi mdi-chevron-right" density="comfortable">
    </v-btn>
  </div>


  <div class="pa-4 text-center">
    <v-dialog max-width="800" v-model="dialogEdit">
      <template v-slot:default="{ isActive }">
        <v-card class="pa-5" elevation="3" style="position: relative;">

          <!-- Botón de cerrar en la parte superior derecha -->
          <v-btn icon @click="dialogEdit = false" style="position: absolute; top: 10px; right: 10px; z-index: 10;">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <br>
          <v-container>
            <v-row>
              <v-col cols="12" md="6" class="text-left">
                <h4 class="blue--text">FACTURA</h4>
                <p><small><strong>No</strong> {{ purchaseDetail.factura_numero }}</small></p>
                <p><small><strong>Fecha</strong> {{ formatFecha(purchaseDetail.order_date) }}</small></p>
                <p>
                  <small><strong>Proveedor</strong> {{ purchaseDetail.seller?.nombres || '' }}
                    {{ purchaseDetail.seller?.apellidos || '' }}</small>
                </p>
              </v-col>
              <v-col cols="12" md="4">
                <v-select :items="['Recibido', 'Pendiente']" v-model="purchaseDetail.status" label="Estado"
                  variant="underlined" color="info" />
              </v-col>
              <v-col cols="12" md="2">
                <v-btn color="success" @click="updateStatus()" dark>Aplicar</v-btn>
              </v-col>
            </v-row>

            <v-divider></v-divider>

            <!-- Tabla de productos -->
            <table class="mt-5" dense>
              <thead class="blue darken-3 white--text">
                <tr>
                  <th class="text-left">Producto</th>
                  <th class="text-right">Cant</th>
                  <th class="text-right">Precio Compra</th>
                  <th class="text-right">Iva</th>
                  <th class="text-right">Ibua</th>
                  <th class="text-right">Ipc</th>
                  <th class="text-right">Sub Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detalle in purchaseDetail.purchasedetails" :key="detalle.id">
                  <td><small>{{ detalle.producto.nombre }}</small></td>
                  <td class="text-right"><small>{{ detalle.cantidad }}</small></td>
                  <td class="text-right"><small>${{ parseFloat(detalle.precio_unitario).toLocaleString('es-ES')
                      }}</small></td>
                  <td class="text-right"><small>{{ detalle.iva }}</small></td>
                  <td class="text-right"><small>{{ detalle.ibua }}</small></td>
                  <td class="text-right"><small>{{ detalle.ipc }}</small></td>
                  <td class="text-right">
                    <small>
                      ${{
                        (Number(detalle.cantidad) * Number(detalle.precio_unitario) +
                          Number(detalle.iva ?? 0) +
                          Number(detalle.ibua ?? 0)
                        ).toLocaleString('es-ES')
                      }}
                    </small>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Totales -->
            <v-row class="mt-5">
              <v-col cols="8"></v-col>
              <v-col cols="4">
                <v-sheet class="pa-3 blue lighten-4">
                  <h4 class="mt-3 blue--text">
                    <strong>Total:</strong> ${{ parseFloat(purchaseDetail.total).toLocaleString('es-ES') }}
                  </h4>
                </v-sheet>
              </v-col>
            </v-row>
            <!-- Mensaje final -->
            <v-divider class="mt-5"></v-divider>
          </v-container>
        </v-card>
      </template>
    </v-dialog>
  </div>

  <v-snackbar v-model="snackbarUpd" :timeout="timeout">
    <h3 v-if="upderrormsg" class="text-error">{{ upderrormsg }}</h3>
    <h3 v-if="updsuccessmsg" class="text-success">{{ updsuccessmsg }}</h3>
    <template v-slot:actions>
      <v-btn color="blue" variant="text" @click="snackbarUpd = false">
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import axiosInst from '@/components/axiosins'
import { ref, onMounted, watch} from 'vue'
import useUpdate from '@/composables/useUpdate'

const trLoading = ref(true)
const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const { update, upderrormsg, updsuccessmsg } = useUpdate();
const url = import.meta.env.VITE_APP_API_URL
const dialogEdit = ref(false)
const snackbarUpd = ref(false)
const timeout = 4000
const fechaini = ref(null)
const fechafin = ref(null)
const search = ref('')
const purchasesList = ref({
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
const purchaseDetail = ref({
  factura_numero: '',
  user_id: '',
  seller_id: null,
  tipo_pago: '',
  status: '',

});

const buscarCompra = async () => {
    try {
        const res = await axiosInst.post(url + 'api/comprasearch', { search: search.value }); // Enviar como objeto
        purchasesList.value = res.data;
    } catch (error) {
        console.error("Error al obtener las compras", error);
    }
};

const getPurchases = async (urls = url + 'api/purchase') => {
  fechaini.value = ''
  fechafin.value = ''
  try {
    const res = await axiosInst.get(urls)
    trLoading.value = false
    purchasesList.value = res.data
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
  }
}

const updateStatus = async () => {
  await update(url + 'api/purchase/' + purchaseDetail.value.id, purchaseDetail.value);
  snackbarUpd.value = true
  getPurchases()
};

const ordenFecha = async () => {
  try {
    const res = await axiosInst.post(url + 'api/comprafecha', {
      fechaini: fechaini.value,
      fechafin: fechafin.value
    });
    purchasesList.value = res.data
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
  }
};

const compraFechaExcel = async () => {
  try {
    const res = await axiosInst.post(url + 'api/comprafechaexcel', {
      fechaini: fechaini.value,
      fechafin: fechafin.value
    }, { responseType: 'blob' });

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

const verOrden = async (id) => {
  const res = await axiosInst.get(url + 'api/purchase/' + id);
  purchaseDetail.value = res.data;
}

const datosNegocio = async () => {
  const res = await axiosInst.get(url + 'api/settings')
  empresa.value = res.data
};

const compraPDF = (id) => {
  window.open(url + 'comprapdf/' + id);
}

defineExpose({ getPurchases });

watch(search, () => {
    if (search.value.length >= 3) {
        buscarCompra();
    }
});

onMounted(() => {
  getPurchases()
  datosNegocio()
})

</script>
