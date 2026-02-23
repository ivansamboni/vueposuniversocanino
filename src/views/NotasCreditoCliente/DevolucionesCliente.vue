<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="2">
                <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="#Referencia, Proveedor"
                    variant="underlined" color="primary" />
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
                <v-btn color="primary" @click="getNotas()">Filtrar</v-btn>
            </v-col>
            <v-col cols="12" md="1">
                <v-btn title="Descargar Excel" color="success" icon="mdi-file-excel-outline" @click="compraFechaExcel()"
                    density="comfortable"></v-btn>
            </v-col>
            <v-col cols="12" md="1">
                <v-btn color="primary" @click="reload()">Todas</v-btn>
            </v-col>
            <v-col cols="12" md="1">
                <v-dialog width="2000px" v-model="modalNueva">
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-btn v-bind="activatorProps" color="success" text="Nueva +"></v-btn>
                    </template>
                    <template v-slot:default="{ isActive }">
                        <v-card title="Devolucion de Cliente">
                            <template v-slot:text>
                                <NotasCreditoCliente @loadNotas="getNotas()" />
                            </template>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text="Cancelar" variant="text" @click="isActive.value = false"></v-btn>
                            </v-card-actions>
                        </v-card>
                    </template>
                </v-dialog>
            </v-col>
        </v-row>
    </v-container>
    <table>
        <thead>
            <tr>
                <th class="text-left">
                    Consecutivo
                </th>
                <th class="text-left">
                    Fecha de Emisión
                </th>
                <th class="text-left">
                    Cliente
                </th>
                <th class="text-left">
                    Documento Origen
                </th>
                <th class="text-left">
                    Tipo Nota
                </th>
                <th class="text-left">
                    Observación
                </th>
                <th class="text-left">
                    Total
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
            <tr v-for="ord in notasList.data" :key="ord.id">
                <td><small>{{ ord.numero_nota }}</small></td>
                <td><small>{{ ord.fecha_emision }}</small></td>
                <td><small>{{ ord.sale.client.nombres ?? '' }} , {{ ord.sale.client.apellidos ?? '' }}</small></td>
                <td><small>{{ ord.sale.factura_numero }}</small></td>
                <td><small>{{ ord.tipo }}</small></td>
                <td><small>{{ ord.motivo }}</small></td>
                <td><small>${{ parseFloat(ord.total).toLocaleString('es-ES') }}</small></td>

                <td>
                    <v-btn @click="verOrden(ord.id), dialogEdit = true" color="dark" density="comfortable"
                        icon="mdi mdi-eye-outline" title="Ver"></v-btn>
                    <v-btn @click="compraPDF(ord.id)" density="comfortable" icon="mdi mdi-printer-outline"></v-btn>
                </td>
            </tr>
        </tbody>
    </table>
    <div class="text-center">
        <v-pagination v-model="currentPage" :length="lastPage" :total-visible="10" @update:modelValue="getPurchases" />
    </div>

    <!--Vista de nota -->
    <v-dialog v-model="dialogEdit" max-width="850">
        <v-card class="rounded-xl elevation-24 bg-grey-lighten-5">
            <v-toolbar color="white" flat class="border-b px-4">
                <v-icon color="secondary" class="mr-3">mdi-file-document-outline</v-icon>
                <v-toolbar-title class="text-subtitle-1 font-weight-bold text-grey-darken-3 text-uppercase">
                    Detalle Nota Crédito de Venta
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon="mdi-close" variant="text" @click="dialogEdit = false"></v-btn>
            </v-toolbar>

            <v-card-text class="pa-6 pa-md-10 bg-white">
                <v-row class="mb-6" align="start">
                    <v-col cols="12" sm="6">
                        <div class="text-overline text-primary font-weight-bold mb-1">Número de Nota</div>
                        <div class="text-h4 font-weight-black mb-1">{{ notasDetail.numero_nota }}</div>

                        <div class="d-flex align-center mb-2">
                            <v-icon size="small" color="grey-darken-2" class="mr-1">mdi-link-variant</v-icon>
                            <span class="text-caption text-grey-darken-2">
                                Afecta Factura: <strong>{{ notasDetail.sale?.referencia || 'N/A' }}</strong>
                            </span>
                        </div>

                        <v-chip size="small" color="blue-grey-lighten-5" text-color="blue-grey-darken-4"
                            class="font-weight-medium">
                            Emitido el: {{ notasDetail.fecha_emision }}
                        </v-chip>
                    </v-col>

                    <v-col cols="12" sm="6" class="text-sm-right">
                        <div class="text-overline text-grey-darken-1 mb-1">Cliente</div>
                        <div class="text-h6 font-weight-bold leading-tight">
                            {{ notasDetail.sale?.client?.nombres }} {{ notasDetail.sale?.client?.apellidos }}
                        </div>
                        <div class="text-body-2 text-grey-darken-1">
                            {{ notasDetail.sale?.client?.tipoidentificacion }}: {{
                                notasDetail.sale?.client?.numidentificacion }}
                        </div>
                        <v-chip size="x-small" color="black" variant="flat" class="mt-2">
                            CONCEPTO DIAN: {{ notasDetail.correction_concept_code }}
                        </v-chip>
                    </v-col>
                </v-row>

                <v-divider class="mb-6"></v-divider>

                <v-row class="mb-8 px-2 py-4 bg-grey-lighten-4 rounded-lg text-center">
                    <v-col cols="4" class="border-e">
                        <div class="text-caption text-grey-darken-1 text-uppercase font-weight-bold">Tipo</div>
                        <div class="text-body-1 font-weight-medium text-capitalize">Nota {{ notasDetail.tipo }}</div>
                    </v-col>
                    <v-col cols="4" class="border-e">
                        <div class="text-caption text-grey-darken-1 text-uppercase font-weight-bold">Método Pago</div>
                        <div class="text-body-1 font-weight-medium">{{ notasDetail.metodo_pago_nombre }}</div>
                    </v-col>
                    <v-col cols="4">
                        <div class="text-caption text-grey-darken-1 text-uppercase font-weight-bold">Concepto</div>
                        <div class="text-body-1 font-weight-medium">{{ notasDetail.correcion_concepto_nombre }}</div>
                    </v-col>
                </v-row>

                <div class="text-subtitle-2 font-weight-bold mb-3 ml-1 text-grey-darken-3">Artículos Devueltos /
                    Ajustados
                </div>
                <v-table class="mb-6 border rounded-lg">
                    <thead class="bg-grey-lighten-4">
                        <tr>
                            <th class="text-left font-weight-bold">DESCRIPCIÓN</th>
                            <th class="text-center font-weight-bold">CANT.</th>
                            <th class="text-right font-weight-bold">UNITARIO</th>
                            <th class="text-right font-weight-bold">IVA</th>
                            <th class="text-right font-weight-bold">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="detalle in notasDetail.notaventadetails" :key="detalle.id">
                            <td class="py-3">
                                <div class="font-weight-bold text-body-2">{{ detalle.producto.nombre }}</div>
                                <div class="text-caption text-grey">{{ detalle.producto.codigo_barras }}</div>
                            </td>
                            <td class="text-center font-weight-bold">{{ detalle.cantidad }}</td>
                            <td class="text-right text-grey-darken-2">
                                ${{ Number(detalle.precio_unitario).toLocaleString('es-CO') }}
                            </td>
                            <td class="text-right text-red-darken-1">
                                ${{ Number(detalle.iva).toLocaleString('es-CO') }}
                            </td>
                            <td class="text-right font-weight-bold">
                                ${{ (Number(detalle.cantidad) * Number(detalle.precio_unitario) + Number(detalle.iva ??
                                    0)).toLocaleString('es-CO') }}
                            </td>
                        </tr>
                    </tbody>
                </v-table>

                <v-row>
                    <v-col cols="12" md="7">
                        <v-sheet border rounded="lg" class="pa-4 bg-blue-grey-lighten-5" v-if="notasDetail.motivo">
                            <div class="text-caption font-weight-bold text-grey-darken-3 mb-1">MOTIVO DE LA NOTA:</div>
                            <div class="text-body-2 italic text-grey-darken-4">"{{ notasDetail.motivo }}"</div>
                        </v-sheet>
                    </v-col>

                    <v-col cols="12" md="5">
                        <div class="d-flex justify-space-between mb-2 mt-2 mt-md-0">
                            <span class="text-grey-darken-1">Subtotal:</span>
                            <span class="font-weight-medium">${{ (Number(notasDetail.total) -
                                calcularTotalIva(notasDetail.notaventadetails)).toLocaleString('es-CO') }}</span>
                        </div>
                        <div class="d-flex justify-space-between mb-2">
                            <span class="text-grey-darken-1">IVA:</span>
                            <span class="font-weight-medium text-red-darken-1">+ ${{
                                calcularTotalIva(notasDetail.notaventadetails).toLocaleString('es-CO') }}</span>
                        </div>
                        <v-divider class="my-3"></v-divider>
                        <div class="d-flex justify-space-between align-center">
                            <span class="text-h6 font-weight-bold">TOTAL</span>
                            <span class="text-h4 font-weight-black text-primary">
                                ${{ Number(notasDetail.total).toLocaleString('es-CO') }}
                            </span>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-6 bg-grey-lighten-4">
                <v-btn variant="text" color="grey-darken-1" @click="dialogEdit = false" class="text-none">
                    Cerrar
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="flat" prepend-icon="mdi-printer"
                    class="px-8 text-none font-weight-bold">
                    Imprimir Copia Cliente
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

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
import { ref, onMounted } from 'vue'
import { CodigosDian } from '@/composables/CodigosDian'
import NotasCreditoCliente from '@/views/NotasCreditoCliente/NotasCreditoCliente.vue'

const { metodosPago, formasPago, tipoNotas, motivosNotaCredito } = CodigosDian();


const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const url = import.meta.env.VITE_APP_API_URL
const fechaini = ref(null)
const fechafin = ref(null)
const search = ref('')
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(10)
const trLoading = ref(true)
const dialogEdit = ref(false)
const modalNueva = ref(false)

const notasList = ref({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
})

const notasDetail = ref({
    bill_id_factus: null,
    correction_concept_code: null,
    created_at: null,
    fecha_emision: null,
    id: null,
    motivo: null,
    notaventadetails: [],
    numbering_range_id: null,
    numero_nota: null,
    payment_method_code: null,
    pdf_url: null,
    sale_id: null,
    referencia_proveedor: null,
    client_id: null,
    tipo: null,
    total: null,
    updated_at: null,
    uuid_factus: null,
    xml_url: null,

});

const calcularTotalIva = (detalles) => {
    return detalles.reduce((acc, item) => acc + Number(item.iva || 0), 0);
}

const getNotas = async (page = 1) => {
    modalNueva.value = false
    try {
        const res = await axiosInst.get(url + `api/notasventa`, {
            params: {
                page,
                search: search.value || '',
                fechaini: fechaini.value,
                fechafin: fechafin.value
            },
        });
        currentPage.value = res.data.current_page;
        lastPage.value = res.data.last_page;
        perPage.value = res.data.per_page;
        trLoading.value = false
        notasList.value = res.data
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
};

const verOrden = async (id) => {

    const res = await axiosInst.get(url + 'api/notasventa/' + id);
    notasDetail.value = res.data;
}

const reload = () => {
    fechaini.value = ''
    fechafin.value = ''
    search.value = ''
    getNotas()
}

onMounted(() => {
    getNotas()
})
</script>

<style scoped>
.text-mono {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.85rem;
}

.custom-table {
    overflow: hidden;
}

.v-table th {
    text-transform: uppercase;
    font-size: 0.75rem !important;
    letter-spacing: 1px;
}
</style>