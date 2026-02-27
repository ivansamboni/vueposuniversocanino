<template>
  <v-alert title="Gestión de Créditos" type="primary" icon="mdi-cash"></v-alert>

  <br><br>
  <v-row>
    <v-col cols="12" md="4">
      <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="nombre, apellido, cedula, número de factura"
        variant="underlined" color="primary" />
    </v-col>
    <v-col cols="12" md="2">
      <v-btn color="primary" @click="reload()">Todos</v-btn>
    </v-col>
    <v-col cols="12" md="4">
      <v-card elevation="3" class="pa-1 text-center" color="error" variant="tonal">
        <div class="text-h6 font-weight-medium text-error">
          Total Saldo Pendiente
        </div>
        <div class="text-h4 font-weight-bold text-error mt-1">
          $ {{ totalSaldoPendiente ? parseFloat(totalSaldoPendiente).toLocaleString('es-ES') : '0' }}
        </div>
      </v-card>
    </v-col>
  </v-row>
  <br>
  <br>
  <div class="table-responsive">

    <table class="table">
      <thead>
        <tr>
          <th class="text-left">
            Credito
          </th>
          <th class="text-left">
            Cliente
          </th>
          <th class="text-left">
            Factura de Venta
          </th>
          <th class="text-left">
            Total Crédito
          </th>
          <th class="text-left">
            Saldo Pendiente
          </th>
          <th class="text-left">
            Acción
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cli in clintesList" :key="cli.id">
          <td><v-chip :color="cli.saldo > 0 ? 'error' : 'success'" variant="tonal" size="small">
              {{ cli.saldo > 0 ? 'Pendiente' : 'Pagado' }}
            </v-chip></td>
          <td> <v-btn color="dark" @click="selecCliente(cli.sale.client.id), dialogVerCliente = true"
              density="comfortable" icon="mdi mdi-eye-outline" title="Ver"></v-btn> -
            <small>{{ cli.sale.client.nombres }} {{ cli.sale.client.apellidos || '' }}
            </small>
          </td>
          <td><small><v-btn color="dark" @click="verFactura(cli.sale.id), dialogFactura = true" density="comfortable"
                title="Ver">{{ cli.sale.factura_numero
                }}</v-btn></small></td>
          <td><small class="text-success">$ {{ cli.total_credito ? parseFloat(cli.total_credito).toLocaleString('es-ES')
            : '0' }}</small>
          </td>
          <td>
            <small :class="cli.saldo == 0 ? 'text-success' : 'text-error'">
              $ {{ cli.saldo ? parseFloat(cli.saldo).toLocaleString('es-ES') : '0' }}
            </small>
          </td>
          <td><small>
              <v-btn color="success" @click="selecCredit(cli.id), dialogAbonar = true" density="comfortable"
                title="ver">Ver/ +Abonar</v-btn>
            </small></td>
        </tr>
      </tbody>
    </table>
  </div>

  <v-pagination v-model="currentPage" :length="lastPage" :total-visible="10" @update:modelValue="getCredits" />

  <!--Dialog ver factura -->
  <div class="pa-4 text-center">
    <v-dialog max-width="900" v-model="dialogFactura" scrollable>
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
                <th class="text-right white--text">IBUA</th>
                <th class="text-right white--text">IPC</th>
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
                    <strong>Plan:</strong> {{ detalle.subscription.plan.name }}
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
                <td class="text-right">${{ parseFloat(detalle.ibua || 0).toLocaleString('es-ES') }}</td>
                <td class="text-right">${{ parseFloat(detalle.ipc || 0).toLocaleString('es-ES') }}</td>

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
            <v-btn color="primary" variant="tonal" @click="dialogFactura = false">Cerrar</v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </div>

  <!--Dialog ver cliente -->
  <div class="text-center pa-4">
    <v-dialog width="600" v-model="dialogVerCliente">
      <v-card max-width="600">
        <v-card-text class="pa-sm-10 pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <label class="font-weight-bold">Tipo de Identificación:</label>
              <div>{{ txtregdata.tipoidentificacion }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <label class="font-weight-bold">No Identificación:</label>
              <div>{{ txtregdata.numidentificacion }}</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <label class="font-weight-bold">Nombres:</label>
              <div>{{ txtregdata.nombres }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <label class="font-weight-bold">Apellidos:</label>
              <div>{{ txtregdata.apellidos }}</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <label class="font-weight-bold">Teléfono:</label>
              <div>{{ txtregdata.telefono }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <label class="font-weight-bold">Correo Electrónico:</label>
              <div>{{ txtregdata.email }}</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <label class="font-weight-bold">Ubicación:</label>
              <div>{{ txtregdata.ubicacion }}</div>
            </v-col>
          </v-row>

          <v-card-actions>
            <v-btn class="ms-auto" text="Cerrar" @click="dialogVerCliente = false"></v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>

  <!--Dialog abonar -->
  <v-dialog v-model="dialogAbonar" max-width="auto" scrollable>
    <v-card elevation="24" class="rounded-xl">
      <v-card-title class="pa-0">
        <v-toolbar color="primary" dark flat>
          <v-icon start class="ml-4">mdi-cash-register</v-icon>
          <v-toolbar-title class="font-weight-bold">Gestión de Abonos a Crédito</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialogAbonar = false"></v-btn>
        </v-toolbar>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" class="mr-2">mdi-account-circle-outline</v-icon>
              <span class="text-overline font-weight-black">Información del Cliente</span>
            </div>
            <v-card variant="tonal" color="grey-lighten-3" class="rounded-lg border-0">
              <v-card-text class="pa-4">
                <v-row dense>
                  <v-col cols="12" md="3">
                    <div class="text-caption text-grey-darken-1">Identificación</div>
                    <div class="text-subtitle-1 font-weight-bold">{{ txtregdata.tipoidentificacion }}: {{
                      txtregdata.numidentificacion }}</div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-caption text-grey-darken-1">Nombre Completo</div>
                    <div class="text-subtitle-1 font-weight-bold">{{ txtregdata.nombres }} {{ txtregdata.apellidos }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="3" class="d-flex align-center justify-end">
                    <v-btn prepend-icon="mdi-printer" color="primary" variant="outlined" size="small"
                      class="rounded-pill">
                      Comprobante
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="4">
            <v-card border flat class="rounded-lg pa-4 text-center">
              <div class="text-caption text-grey">Total del Crédito</div>
              <div class="text-h5 font-weight-black text-primary">
                $ {{ txtregdata.total_credito ? parseFloat(txtregdata.total_credito).toLocaleString('es-ES') : '0' }}
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card border flat class="rounded-lg pa-4 text-center bg-red-lighten-5">
              <div class="text-caption text-red-darken-1">Saldo Pendiente Factura</div>
              <div class="text-h5 font-weight-black text-error">
                $ {{ txtregdata.saldo ? parseFloat(txtregdata.saldo).toLocaleString('es-ES') : '0' }}
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card border flat class="rounded-lg pa-4 text-center bg-red-lighten-5">
              <div class="text-caption text-red-darken-1">Saldo Pendiente Todos Créditos</div>
              <div class="text-h5 font-weight-black text-error">
                $ {{ txtregdata.saldoOtrosCreditos ? parseFloat(txtregdata.saldoOtrosCreditos).toLocaleString('es-ES') :
                '0' }}
                <v-btn color="success" density="compact" prepend-icon="mdi-cash" @click="pagarTodo()"
                  :disabled="!txtregdata.metodo_pago" :loading="spinner">
                  Pagar Todo
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-card border class="rounded-xl overflow-hidden mb-6">
          <v-table class="text-no-wrap">
            <thead class="bg-grey-lighten-4">
              <tr>
                <th class="text-uppercase text-caption font-weight-bold">Detalle</th>
                <th class="text-uppercase text-caption font-weight-bold" style="width: 250px;">Monto a Abonar</th>
                <th class="text-uppercase text-caption font-weight-bold" style="width: 200px;">Forma de Pago</th>
                <th class="text-uppercase text-caption font-weight-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <v-btn color="secondary" variant="tonal" size="small" prepend-icon="mdi-eye"
                    @click="verFactura(txtregdata.sale_id), dialogFactura = true">
                    Ver Factura
                  </v-btn>
                </td>
                <td class="pt-4">
                  <v-text-field v-model="txtregdata.monto" prefix="$" type="number" variant="outlined" density="compact"
                    v-solo-enteros placeholder="0.00" class="rounded-lg"></v-text-field>
                  <v-checkbox v-model="txtregdata.monto" :value="txtregdata.saldo" label="Pagar saldo total"
                    v-solo-enteros color="success" density="compact" hide-details></v-checkbox>
                </td>
                <td>
                  <v-select v-model="txtregdata.metodo_pago" :items="metodosPago" label="Seleccione" variant="outlined"
                    density="compact" class="rounded-lg"></v-select>
                </td>
                <td class="text-center">
                  <v-btn color="success" variant="elevated" prepend-icon="mdi-plus-circle"
                    :disabled="!txtregdata.metodo_pago || !txtregdata.monto" @click="registrar()" :loading="spinner">
                    Abonar
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <div class="d-flex align-center mb-3">
          <v-icon color="grey-darken-2" class="mr-2">mdi-history</v-icon>
          <span class="text-overline font-weight-black">Historial de Abonos Recientes</span>
        </div>

        <v-divider></v-divider>

        <v-table density="comfortable" class="mt-2 border rounded-lg">
          <thead>
            <tr class="bg-grey-lighten-5">
              <th class="text-left font-weight-bold">Monto</th>
              <th class="text-left font-weight-bold">Fecha de Abono</th>
              <th class="text-right font-weight-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pag in pagos" :key="pag.id" class="hover-row">
              <td>
                <span class="text-success font-weight-bold">
                  + $ {{ pag.monto ? parseFloat(pag.monto).toLocaleString('es-ES') : '0' }}
                </span>
              </td>
              <td class="text-grey-darken-1">{{ pag.fecha_abono }}</td>
              <td class="text-right">
                <v-chip size="x-small" color="success" variant="flat">Procesado</v-chip>
              </td>
            </tr>
            <tr v-if="pagos.length === 0">
              <td colspan="3" class="text-center py-4 text-grey italic">No hay abonos registrados</td>
            </tr>
          </tbody>
        </v-table>

      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="dialogAbonar = false" class="px-6">
          Cerrar ventana
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <br>

  <v-snackbar v-model="snackbarReg" :timeout="timeout">
    <h3 v-if="regerrormsg" class="text-error">{{ regerrormsg }}</h3>
    <h3 v-if="regsuccessmsg" class="text-success">{{ regsuccessmsg }}</h3>
    <template v-slot:actions>
      <v-btn color="blue" variant="text" @click="snackbarReg = false">
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
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

<style scoped>
.hover-row:hover {
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}
</style>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axiosInst from '@/components/axiosins'
import useRegister from '@/composables/useRegister'
import useUpdate from '@/composables/useUpdate'

const { register, regsuccessmsg, regerrormsg } = useRegister();
const { update, upderrormsg, updsuccessmsg } = useUpdate();
const url = import.meta.env.VITE_APP_API_URL

const txtregdata = ref({
  id: '', tipoidentificacion: '', numidentificacion: '', nombres: '', apellidos: '', telefono: '', email: '', ubicacion: '',
  total_credito: '', saldo: '', saldoOtrosCreditos: '', monto: '', credit_id: '', sale_id: '', metodo_pago: ''
})
const clintesList = ref([]);

const totalSaldoPendiente = ref('');
const pagos = ref([])
const creditosPendientes = ref([])
const metodosPago = [
  { title: 'Efectivo', value: '10' },
  { title: 'Transferencia', value: '47' },
  { title: 'Tarjeta Débito', value: '49' },
  { title: 'Tarjeta Crédito', value: '48' },
]
const orderDetail = ref([])
const nombreRules = ref([(v) => !!v || 'El campo es requerido'])
const emailRules = ref([(v) => !!v || 'El campo es requerido', (v) => /.+@.+\..+/.test(v) || 'E-mail debe ser valido']);
const snackbarReg = ref(false)
const snackbarUpd = ref(false)
const spinner = ref(false)
const timeout = 4000
const dialogVerCliente = ref(false)
const dialogFactura = ref(false)
const dialogAbonar = ref(false)
const editando = ref(false);
const search = ref('');
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(10)
const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


const selecCliente = async (id) => {
  editando.value = false;
  try {
    const res = await axiosInst.get(url + 'api/clientes/' + id)
    txtregdata.value = res.data

  } catch (err) {
    alert(err)
  }
}

const selecCredit = async (id) => {
  for (const key in txtregdata.value) {
    txtregdata.value[key] = ''
  }
  try {
    const res = await axiosInst.get(url + 'api/credits/' + id)
    creditosPendientes.value = res.data.creditos_cliente.map(credito => ({
      credit_id: credito.id,
      saldo: credito.saldo
    }));
    txtregdata.value.credit_id = res.data.credito.id
    txtregdata.value.sale_id = res.data.credito.sale.id
    txtregdata.value.tipoidentificacion = res.data.credito.sale.client.tipoidentificacion
    txtregdata.value.numidentificacion = res.data.credito.sale.client.numidentificacion
    txtregdata.value.nombres = res.data.credito.sale.client.nombres
    txtregdata.value.apellidos = res.data.credito.sale.client.apellidos
    txtregdata.value.total_credito = res.data.credito.total_credito
    txtregdata.value.saldo = res.data.credito.saldo
    txtregdata.value.saldoOtrosCreditos = res.data.totalsaldopendiente
    pagos.value = res.data.credito.payments

  } catch (err) {
    alert(err)
  }
}

const registrar = async () => {
  spinner.value = true
  const payload = {
    metodo_pago: txtregdata.value.metodo_pago,
    creditos: [
      { credit_id: txtregdata.value.credit_id, saldo: txtregdata.value.monto }
    ]
  }

  await register(url + 'api/credits', payload)
  getCredits()
  dialogAbonar.value = false
  snackbarReg.value = true
  editando.value = true

  for (const key in txtregdata.value) {
    txtregdata.value[key] = ''
  }
  spinner.value = false
}


const pagarTodo = async () => {
  spinner.value = true
  let conf = confirm('¿Pagar el total de saldo pendiente de todos los creditos de ' + txtregdata.value.nombres + ' ?')
  if (conf) {


    if (!txtregdata.value.metodo_pago) {
      console.error("Debe seleccionar un tipo de pago");
      return
    }

    const payload = {
      metodo_pago: txtregdata.value.metodo_pago,
      creditos: creditosPendientes.value // [{ credit_id, saldo }, ...]
    }

    await register(url + 'api/credits', payload)
    getCredits()
    dialogAbonar.value = false
    snackbarReg.value = true
    editando.value = true
    creditosPendientes.value = []
    spinner.value = false
  }
}

const verFactura = async (id) => {
  const res = await axiosInst.get(url + 'api/ordershow/' + id);
  orderDetail.value = res.data;
}

const getCredits = async (page = 1) => {
  try {
    const res = await axiosInst.get(url + `api/credits`, {
      params: {
        page,
        search: search.value || '',
      },
    });

    currentPage.value = res.data.credits.current_page;
    lastPage.value = res.data.credits.last_page;
    perPage.value = res.data.credits.per_page;
    clintesList.value = res.data.credits.data;
    totalSaldoPendiente.value = res.data.totalsaldopendiente;
  } catch (error) {
    console.error("Error al obtener créditos:", error);
  }
};


watch(search, () => {
  if (search.value.length >= 3) {
    getCredits();
  }

});

const reload = () => {
  search.value = ''
  getCredits()
}

onMounted(() => {
  getCredits()
})
</script>
<style lang="scss">
.registerBox {
  max-width: 1000px;
  margin: 0 auto;
}
</style>