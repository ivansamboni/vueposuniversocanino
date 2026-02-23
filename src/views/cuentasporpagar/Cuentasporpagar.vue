<template>
    <v-alert title="Gestión de Créditos Compras" type="info" icon="mdi-truck-delivery-outline"></v-alert>

    <br><br>
    <v-row>
        <v-col cols="12" md="4">
            <v-text-field v-model="search" append-inner-icon="mdi-magnify"
                label="nombre, apellido, cedula, número de factura" variant="underlined" color="primary" />
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
                        Proveedor
                    </th>
                    <th class="text-left">
                        Factura de Compra
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
                <tr v-for="cli in creditList" :key="cli.id">
                    <td><v-chip :color="cli.saldo > 0 ? 'error' : 'success'" variant="tonal" size="small">
                            {{ cli.saldo > 0 ? 'Pendiente' : 'Pagado' }}
                        </v-chip></td>
                    <td> <v-btn color="dark" @click="selecSeller(cli.purchase.seller.id), dialogVerCliente = true"
                            density="comfortable" icon="mdi mdi-eye-outline" title="Ver"></v-btn> -
                        <small>{{ cli.purchase.seller.nombres }} {{ cli.purchase.seller.apellidos || '' }}
                        </small>
                    </td>
                    <td><small><v-btn color="dark" @click="verFactura(cli.purchase.id), dialogFactura = true"
                                density="comfortable" title="Ver">{{ cli.purchase.factura_numero
                                }}</v-btn></small></td>
                    <td><small class="text-success">$ {{ cli.total_credito ?
                        parseFloat(cli.total_credito).toLocaleString('es-ES')
                        : '0' }}</small>
                    </td>
                    <td>
                        <small :class="cli.saldo == 0 ? 'text-success' : 'text-error'">
                            $ {{ cli.saldo ? parseFloat(cli.saldo).toLocaleString('es-ES') : '0' }}
                        </small>
                    </td>
                    <td><small>
                            <v-btn color="success" @click="selecCredit(cli.id), dialogAbonar = true"
                                density="comfortable" title="ver">Ver/ +Abonar</v-btn>
                        </small></td>
                </tr>
            </tbody>
        </table>
    </div>

    <v-pagination v-model="currentPage" :length="lastPage" :total-visible="10" @update:modelValue="getCredits" />

    <!--Dialog ver factura -->
    <div class="pa-4 text-center">
        <v-dialog max-width="800" v-model="dialogFactura">
            <template v-slot:default="{ isActive }">
                <v-card class="pa-5" elevation="3" style="position: relative;">

                    <!-- Botón de cerrar en la parte superior derecha -->
                    <v-btn icon @click="dialogFactura = false"
                        style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <br>
                    <v-container>
                        <v-row>
                            <v-col cols="12" md="6" class="text-left">
                                <h4 class="blue--text">FACTURA</h4>
                                <p><small><strong>No</strong> {{ purchaseDetail.factura_numero }}</small></p>
                                <p><small><strong>Fecha</strong> {{ formatFecha(purchaseDetail.created_at) }}</small>
                                </p>
                                <p>
                                    <small><strong>Proveedor</strong> {{ purchaseDetail.seller?.nombres || '' }}
                                        {{ purchaseDetail.seller?.apellidos || '' }}</small>
                                </p>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-select :items="['Pagado', 'Pendiente de Pago']" v-model="purchaseDetail.status"
                                    label="Estado" variant="underlined" color="primary" />
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
                                    <th class="text-left">Código</th>
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
                                    <td><small>{{ detalle.producto.codigo_barras }}</small></td>
                                    <td><small>{{ detalle.producto.nombre }}</small></td>
                                    <td class="text-right"><small>{{ detalle.cantidad }}</small></td>
                                    <td class="text-right"><small>${{
                                        parseFloat(detalle.precio_unitario).toLocaleString('es-ES')
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
                                        <strong>Total:</strong> ${{
                                            parseFloat(purchaseDetail.total).toLocaleString('es-ES') }}
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

    <!--Dialog ver sellere -->
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
                    <v-toolbar-title class="font-weight-bold">Gestión de Abonos a Proveedor</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon="mdi-close" variant="text" @click="dialogAbonar = false"></v-btn>
                </v-toolbar>
            </v-card-title>

            <v-card-text class="pa-6">
                <v-row class="mb-4">
                    <v-col cols="12">
                        <div class="d-flex align-center mb-3">
                            <v-icon color="primary" class="mr-2">mdi-truck-delivery-outline</v-icon>
                            <span class="text-overline font-weight-black">Información del Proveedor</span>
                        </div>
                        <v-card variant="tonal" color="grey-lighten-3" class="rounded-lg border-0">
                            <v-card-text class="pa-4">
                                <v-row dense>
                                    <v-col cols="12" md="3">
                                        <div class="text-caption text-grey-darken-1">Identificación</div>
                                        <div class="text-subtitle-1 font-weight-bold">{{ txtregdata.tipoidentificacion
                                            }}: {{
                                                txtregdata.numidentificacion }}</div>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <div class="text-caption text-grey-darken-1">Nombre Completo</div>
                                        <div class="text-subtitle-1 font-weight-bold">{{ txtregdata.nombres }} {{
                                            txtregdata.apellidos }}
                                        </div>
                                    </v-col>
                                    <v-col cols="12" md="3" class="d-flex align-center justify-end">
                                        <v-btn prepend-icon="mdi-printer" color="primary" variant="outlined"
                                            size="small" class="rounded-pill">
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
                                $ {{ txtregdata.total_credito ?
                                    parseFloat(txtregdata.total_credito).toLocaleString('es-ES') : '0' }}
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
                </v-row>

                <v-card border class="rounded-xl overflow-hidden mb-6">
                    <v-table class="text-no-wrap">
                        <thead class="bg-grey-lighten-4">
                            <tr>
                                <th class="text-uppercase text-caption font-weight-bold">Detalle</th>
                                <th class="text-uppercase text-caption font-weight-bold" style="width: 250px;">Monto a
                                    Abonar</th>
                                <th class="text-uppercase text-caption font-weight-bold" style="width: 200px;">Forma de
                                    Pago</th>
                                <th class="text-uppercase text-caption font-weight-bold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <v-btn color="secondary" variant="tonal" size="small" prepend-icon="mdi-eye"
                                        @click="verFactura(txtregdata.purchase_id), dialogFactura = true">
                                        Ver Factura
                                    </v-btn>
                                </td>
                                <td class="pt-4">
                                    <v-text-field v-model="txtregdata.monto" prefix="$" type="number" variant="outlined" v-solo-enteros
                                        density="compact" placeholder="0.00" class="rounded-lg"></v-text-field>
                                    <v-checkbox v-model="txtregdata.monto" :value="txtregdata.saldo" v-solo-enteros
                                        label="Pagar saldo total" color="success" density="compact"
                                        hide-details></v-checkbox>
                                </td>
                                <td>
                                    <v-select v-model="txtregdata.metodo_pago" :items="metodosPago" label="Seleccione"
                                        variant="outlined" density="compact" class="rounded-lg"></v-select>
                                </td>
                                <td class="text-center">
                                    <v-btn color="success" variant="elevated" prepend-icon="mdi-plus-circle"
                                        :disabled="!txtregdata.metodo_pago || !txtregdata.monto" @click="registrar()"
                                        :loading="spinner">
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
    total_credito: '', saldo: '', saldoOtrosCreditos: '', monto: '', credit_id: '', purchase_id: '', metodo_pago: ''
})
const creditList = ref([]);

const totalSaldoPendiente = ref('');
const pagos = ref([])
const metodosPago = [
    { title: 'Efectivo', value: '10' },
    { title: 'Transferencia', value: '47' },
    { title: 'Tarjeta Débito', value: '49' },
    { title: 'Tarjeta Crédito', value: '48' },
]
const purchaseDetail = ref([])
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


const selecSeller = async (id) => {
    editando.value = false;
    try {
        const res = await axiosInst.get(url + 'api/proveedores/' + id)
        txtregdata.value = res.data

    } catch (err) {
        alert(err)
    }
}

const selecCredit = async (id) => {

    try {
        const res = await axiosInst.get(url + 'api/creditseller/' + id)
        txtregdata.value.credit_id = res.data.id
        txtregdata.value.purchase_id = res.data.purchase_id
        txtregdata.value.tipoidentificacion = res.data.purchase.seller.tipoidentificacion
        txtregdata.value.numidentificacion = res.data.purchase.seller.numidentificacion
        txtregdata.value.nombres = res.data.purchase.seller.nombres
        txtregdata.value.apellidos = res.data.purchase.seller.apellidos
        txtregdata.value.total_credito = res.data.total_credito
        txtregdata.value.saldo = res.data.saldo
        pagos.value = res.data.payment_seller

    } catch (err) {
        alert(err)
    }
}

const registrar = async () => {
    spinner.value = true
    const payload = {
        metodo_pago: txtregdata.value.metodo_pago,
        credit_id: txtregdata.value.credit_id,
        monto: txtregdata.value.monto

    }

    await register(url + 'api/creditseller', payload)
    getCredits()
    dialogAbonar.value = false
    snackbarReg.value = true
    editando.value = true

    for (const key in txtregdata.value) {
        txtregdata.value[key] = ''
    }
    spinner.value = false
}

const verFactura = async (id) => {
    const res = await axiosInst.get(url + 'api/purchase/' + id);
    purchaseDetail.value = res.data;
}

const getCredits = async (page = 1) => {
    try {
        const res = await axiosInst.get(url + `api/creditseller`, {
            params: {
                page,
                search: search.value || '',
            },
        });
       
        currentPage.value = res.data.credits.current_page;
        lastPage.value = res.data.credits.last_page;
        perPage.value = res.data.credits.per_page;
        creditList.value = res.data.credits.data;
        totalSaldoPendiente.value = res.data.totalsaldopendiente;
    } catch (error) {
        console.error("Error al obtener créditos:", error);
    }
};

const updateStatus = async () => {
    await update(url + 'api/purchase/' + purchaseDetail.value.id, purchaseDetail.value);
    snackbarUpd.value = true
    getCredits()
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