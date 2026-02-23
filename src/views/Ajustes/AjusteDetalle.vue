<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="4">
                <v-chip label color="primary" text-color="primary">
                    <v-icon left>icon</v-icon> Fecha inicial
                </v-chip>
                <input type="date" v-model="fechaini" @change="ajusteFecha">
            </v-col>
            <v-col cols="12" md="4">
                <v-chip label color="primary" text-color="primary">
                    <v-icon left>icon</v-icon> Fecha final
                </v-chip>
                <input type="date" v-model="fechafin" @change="ajusteFecha">
            </v-col>
            <v-col cols="12" md="4">
                <v-btn color="primary" @click="getAjustes()">Todos</v-btn>
            </v-col>
        </v-row>
    </v-container>
    <v-table>
        <thead>
            <tr>
                <th class="text-left">
                    Ajuste No.
                </th>
                <th class="text-left">
                    Ingresada por
                </th>
                <th class="text-left">
                    Tipo
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

            </tr>
            <tr v-for="ord in ajustesList.data" :key="ord.id">
                <td><small>{{ ord.factura_numero }}</small></td>
                <td><small>{{ ord.user?.nombres ?? '' }} , {{ ord.user?.apellidos ?? '' }}</small></td>

                <td><small>{{ ord.status }}</small></td>
                <td><small>{{ formatFecha(ord.created_at) }}</small></td>
                <td>
                    <v-btn @click="verOrden(ord.id), dialogEdit = true" color="dark" density="comfortable"
                        icon="mdi mdi-eye-outline" title="Ver"></v-btn>
                    <v-btn @click="ajustePDF(ord.id)" density="comfortable" icon="mdi mdi-printer-outline"></v-btn>
                </td>
            </tr>
        </tbody>
    </v-table>
    <div class="text-center">
        <v-btn @click="getOrders(ajustesList.prev_page_url)" :disabled="!ajustesList.prev_page_url"
            icon="mdi mdi-chevron-left" density="comfortable">
        </v-btn>
        <span>&nbsp;Página {{ ajustesList.current_page }} / {{ ajustesList.last_page }}&nbsp;</span>
        <v-btn @click="getOrders(ajustesList.next_page_url)" :disabled="!ajustesList.next_page_url"
            icon="mdi mdi-chevron-right" density="comfortable">
        </v-btn>
    </div>


    <div class="pa-4 text-center">
        <v-dialog max-width="800" v-model="dialogEdit">
            <template v-slot:default="{ isActive }">
                <v-card class="pa-5">
                    <v-container>
                        <v-row>
                            <v-col cols="10" class="text-left">
                                <h4 class="blue--text">FACTURA</h4>
                                <p><small><strong>No</strong> {{ ajusteDetail.factura_numero }}</small></p>
                                <p><small><strong>Fecha</strong> {{ formatFecha(ajusteDetail.created_at) }}</small></p>
                                <p><small><strong>Hecho por</strong> {{ ajusteDetail.user?.nombres ?? '' }} , {{
                                    ajusteDetail.user?.apellidos ?? '' }}</small></p>
                                <p><small><strong>Observaciones</strong> {{ ajusteDetail.descripcion }}</small></p>
                                <p><small><strong>Tipo</strong> {{ ajusteDetail.status }}</small></p>
                            </v-col>
                            <v-btn class="ml-auto" text="X" @click="dialogEdit = false" />
                        </v-row>
                        <v-divider></v-divider>
                        <!-- Tabla de productos -->
                        <v-table class="mt-5" dense>
                            <thead class="blue darken-3 white--text">
                                <tr>
                                    <th class="text-left">Código</th>
                                    <th class="text-left">Producto</th>
                                    <th class="text-left">Stock Nuevo</th>
                                    <th class="text-right">Cantidad de stock ajustada</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="detalle in ajusteDetail.ajustedetails" :key="detalle.id">
                                    <td><small>{{ detalle.producto.codigo_barras }}</small></td>
                                    <td><small>{{ detalle.producto.nombre }}</small></td>
                                    <td><small>{{ detalle.producto.stock }}</small></td>
                                    <td class="text-right">
                                        <h4>
                                            {{ detalle.stock_cambio > 0 ? `+${detalle.stock_cambio}` :
                                                detalle.stock_cambio }}
                                        </h4>
                                    </td>

                                </tr>
                            </tbody>
                        </v-table>
                        <v-divider class="mt-5"></v-divider>
                    </v-container>
                </v-card>
            </template>
        </v-dialog>
    </div>

</template>

<script setup>
import axiosInst from '@/components/axiosins'
import { ref, onMounted } from 'vue'

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

const url = import.meta.env.VITE_APP_API_URL
const fechaini = ref(null)
const fechafin = ref(null)
const dialogEdit = ref(false)
const ajusteDetail = ref([])
const ajustesList = ref({
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

const getAjustes = async (urls = url + 'api/ajuste') => {
    fechaini.value = ''
    fechafin.value = ''
    try {
        const res = await axiosInst.get(urls)
        trLoading.value = false
        ajustesList.value = res.data
    } catch (error) {

    }
}

const ajusteFecha = async () => {
    try {
        const res = await axiosInst.post(url + 'api/ajustefecha', {
            fechaini: fechaini.value,
            fechafin: fechafin.value
        });
        ajustesList.value = res.data
    } catch (error) {
        console.error("Error al obtener las órdenes:", error);
    }
};

const verOrden = async (id) => {
    const res = await axiosInst.get(url + 'api/ajuste/' + id);
    console.log(res.data)
    ajusteDetail.value = res.data;
}


const ajustePDF = (id) => {
    window.open(url + 'ajustepdf/' + id);
}

defineExpose({ getAjustes });

onMounted(() => {
    getAjustes()
})

</script>