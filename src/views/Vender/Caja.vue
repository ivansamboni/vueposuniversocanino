<template>
    <v-alert text="Ajuste apertura y cierre de cajas" title="Ajuste de Cajas" type="primary"
        icon="mdi-cash-register"></v-alert>
    <div class="text-center pa-4">

        <v-dialog v-model="dialogEdit" max-width="750px" scrollable>
            <v-card class="rounded-xl elevation-4 overflow-hidden">
                <v-toolbar color="primary" flat>
                    <v-icon start class="ms-4">mdi-cash-register</v-icon>
                    <v-toolbar-title class="font-weight-bold">
                        {{ editando ? 'Abrir Caja' : 'Cerrar Caja' }}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon="mdi-close" variant="text" @click="dialogEdit = false"></v-btn>
                </v-toolbar>

                <v-card-text class="pa-5">
                    <v-sheet border rounded="lg" class="pa-4 mb-6 bg-grey-lighten-4 d-flex align-center">
                        <v-avatar color="primary" size="40" class="me-3">
                            <v-icon color="white">mdi-account</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-caption text-medium-emphasis">Responsable de Turno</div>
                            <div class="text-subtitle-1 font-weight-bold">
                                <span v-if="authUsershow">
                                    {{ authStore.user.nombres }} {{ authStore.user.apellidos ?? '' }}
                                </span>
                                <span v-else-if="txtregdataUsershow">
                                    {{ txtregdata.nombres }} {{ txtregdata.apellidos ?? '' }}
                                </span>
                            </div>
                        </div>
                    </v-sheet>

                    <v-form @submit.prevent="registrar()">
                        <v-table density="comfortable" class="border rounded-lg mb-4">
                            <tbody>
                                <tr>
                                    <td class="bg-grey-lighten-5 font-weight-bold" style="width: 40%">Referencia de Caja
                                    </td>
                                    <td>
                                        <v-text-field v-model="txtregdata.caja_numero" variant="outlined"
                                            hide-details="auto" color="primary" required density="compact"
                                            class="py-2" />
                                    </td>
                                </tr>

                                <tr>
                                    <td class="bg-grey-lighten-5 font-weight-bold">Efectivo Inicial</td>
                                    <td>
                                        <v-text-field v-model="monto_inicial_formateado"
                                            :disabled="monto_inicialDisabled" variant="outlined" hide-details="auto"
                                            color="primary" required @input="formatearMonto" density="compact"
                                            prefix="$" class="py-2" />
                                    </td>
                                </tr>

                                <template v-if="monto_final">
                                    <tr>
                                        <td class="font-weight-medium">Ventas en Efectivo</td>
                                        <td class="text-right font-weight-bold">
                                            $ {{ txtregdata.total_ventas_contado ?
                                                parseFloat(txtregdata.total_ventas_contado).toLocaleString('es-ES') : '0' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="font-weight-medium">Ventas Transferencia</td>
                                        <td class="text-right font-weight-bold text-blue-darken-2">
                                            $ {{ txtregdata.total_ventas_transferencias ?
                                                parseFloat(txtregdata.total_ventas_transferencias).toLocaleString('es-ES') :
                                            '0' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="font-weight-medium">Ventas a Crédito</td>
                                        <td class="text-right font-weight-bold text-orange-darken-2">
                                            $ {{ txtregdata.total_ventas_credito ?
                                                parseFloat(txtregdata.total_ventas_credito).toLocaleString('es-ES') : '0' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="font-weight-medium">Ventas con Tarjeta</td>
                                        <td class="text-right font-weight-bold text-indigo-darken-1">
                                            $ {{ txtregdata.total_ventas_tarjetas ?
                                                parseFloat(txtregdata.total_ventas_tarjetas).toLocaleString('es-ES') : '0'
                                            }}
                                        </td>
                                    </tr>
                                    <tr class="bg-blue-lighten-5">
                                        <td class="font-weight-black text-primary">Total Ventas</td>
                                        <td class="text-right font-weight-black text-primary">
                                            $ {{ txtregdata.totalGeneralVentas ?
                                                parseFloat(txtregdata.totalGeneralVentas).toLocaleString('es-ES') : '0' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="font-weight-medium text-grey">Pagos Recibidos en Efectivo</td>
                                        <td class="text-right font-weight-bold">
                                            ${{ txtregdata.total_pagos_efectivo ?
                                                parseFloat(txtregdata.total_pagos_efectivo).toLocaleString('es-ES') : '0' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="font-weight-medium text-grey">Pagos Recibidos con Transferencia</td>
                                        <td class="text-right font-weight-bold">
                                            ${{ txtregdata.total_pagos_transferencias ?
                                                parseFloat(txtregdata.total_pagos_transferencias).toLocaleString('es-ES') :
                                            '0' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="font-weight-medium text-grey">Pagos Recibidos con Tarjeta</td>
                                        <td class="text-right font-weight-bold">
                                            ${{ txtregdata.total_pagos_tarjetas ?
                                                parseFloat(txtregdata.total_pagos_tarjetas).toLocaleString('es-ES') : '0' }}
                                        </td>
                                    </tr>
                                    <tr class="bg-green-lighten-5">
                                        <td class="font-weight-bold text-success">Total Ingresos de Efectivo</td>
                                        <td class="text-right font-weight-bold text-success">
                                            ${{ txtregdata.total_ingresos ?
                                                parseFloat(txtregdata.total_ingresos).toLocaleString('es-ES') : '0' }}
                                        </td>
                                    </tr>
                                    <tr class="bg-red-lighten-5">
                                        <td class="font-weight-bold text-error">Total Salida de Efectivo</td>
                                        <td class="text-right font-weight-bold text-error">
                                            $-{{ txtregdata.total_salidas ?
                                                parseFloat(txtregdata.total_salidas).toLocaleString('es-ES') : '0' }}
                                        </td>
                                    </tr>
                                    <tr class="bg-primary text-white">
                                        <td class="font-weight-black text-h6">Efectivo en Caja</td>
                                        <td class="text-right font-weight-black text-h6 text-white">
                                            $ {{ txtregdata.monto_final ?
                                                parseFloat(txtregdata.monto_final).toLocaleString('es-ES') : '0' }}
                                        </td>
                                    </tr>
                                </template>

                                <tr>
                                    <td class="bg-grey-lighten-5 font-weight-bold">Observaciones</td>
                                    <td>
                                        <v-textarea v-model="txtregdata.observaciones" variant="outlined"
                                            hide-details="auto" color="primary" clearable rows="2" class="py-2" />
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>

                        <div v-show="monto_final" class="mt-6">
                            <div class="d-flex align-center justify-space-between mb-2">
                                <h3 class="text-h6 font-weight-bold text-grey-darken-3">
                                    <v-icon color="primary" class="me-1">mdi-swap-horizontal</v-icon> Movimientos
                                </h3>
                                <v-btn prepend-icon="mdi-plus" color="primary" variant="tonal" size="small"
                                    @click="dialogMovimiento = true">
                                    Nuevo Movimiento
                                </v-btn>
                            </div>

                            <v-table border density="compact" class="rounded-lg">
                                <thead class="bg-grey-lighten-4">
                                    <tr>
                                        <th class="text-uppercase text-caption font-weight-bold">Movimiento</th>
                                        <th class="text-uppercase text-caption font-weight-bold">Monto</th>
                                        <th class="text-uppercase text-caption font-weight-bold">Descripción</th>
                                        <th class="text-uppercase text-caption font-weight-bold">Referencia</th>
                                        <th class="text-uppercase text-caption font-weight-bold text-right">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="mov in movimientosCaja" :key="mov.id">
                                        <td><v-chip size="x-small"
                                                :color="mov.tipo === 'Ingreso' ? 'success' : 'error'">{{ mov.tipo
                                                }}</v-chip>
                                        </td>
                                        <td class="font-weight-bold">${{ mov.monto ?
                                            parseFloat(mov.monto).toLocaleString('es-ES') : '0' }}</td>
                                        <td><small>{{ mov.descripcion }}</small></td>
                                        <td><small class="text-medium-emphasis">{{ mov.referencia }}</small></td>
                                        <td class="text-right"><small>{{ formatFecha(mov.created_at) }}</small></td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </div>

                        <v-divider class="mt-6 mb-4"></v-divider>
                        <div class="d-flex align-center">
                            <v-btn color="error" variant="text" @click="dialogEdit = false" class="px-6">
                                Cancelar
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn v-if="!editando" color="success" variant="elevated" @click="actualizar"
                                prepend-icon="mdi-lock">
                                Cerrar Caja
                            </v-btn>
                            <v-btn v-if="editando" color="primary" variant="elevated" type="submit"
                                prepend-icon="mdi-key">
                                Abrir Caja
                            </v-btn>
                        </div>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Dialog ver caja -->
        <v-dialog v-model="dialogShow" max-width="700px">
            <v-card class="rounded-xl elevation-3">
                <!-- Header -->
                <v-card-title class="d-flex align-center py-4">
                    <v-icon size="40" color="primary" class="me-3">mdi-cash-register</v-icon>
                    <div>
                        <h3 class="mb-1">Detalle de Caja</h3>
                        <p class="text-subtitle-2 text-medium-emphasis mb-0">
                            <span v-if="authUsershow">
                                {{ authStore.user.nombres }} {{ authStore.user.apellidos ?? '' }}
                            </span>
                            <span v-else-if="txtregdataUsershow">
                                {{ txtregdata.nombres }} {{ txtregdata.apellidos ?? '' }}
                            </span>
                        </p>
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn icon="mdi-close" variant="text" @click="dialogShow = false"></v-btn>
                </v-card-title>

                <!-- Body -->
                <v-divider></v-divider>
                <v-card-text>
                    <div ref="printContent" class="mt-2">
                        <v-table density="compact">
                            <tbody>
                                <tr>
                                    <td><strong>Caja Número</strong></td>
                                    <td>
                                        <v-text-field v-model="txtregdata.caja_numero" variant="underlined" disabled
                                            hide-details="auto" color="primary" required />
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Efectivo Inicial</strong></td>
                                    <td>
                                        <v-text-field v-model="monto_inicial_formateado" variant="underlined"
                                            hide-details="auto" color="primary" disabled @input="formatearMonto" /> <br>
                                    </td>
                                </tr>
                                <tr v-show="monto_final">
                                    <td><strong>Ventas en Efectivo</strong></td>
                                    <td>
                                        $ {{ txtregdata.total_ventas_contado
                                            ? parseFloat(txtregdata.total_ventas_contado).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>
                                <tr v-show="monto_final">
                                    <td><strong>Ventas Transferencia</strong></td>
                                    <td>
                                        $ {{ txtregdata.total_ventas_transferencias
                                            ? parseFloat(txtregdata.total_ventas_transferencias).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>

                                <tr v-show="monto_final">
                                    <td><strong>Ventas a Crédito</strong></td>
                                    <td>
                                        $ {{ txtregdata.total_ventas_credito
                                            ? parseFloat(txtregdata.total_ventas_credito).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>
                                <tr v-show="monto_final">
                                    <td><strong>Ventas con Tarjeta</strong></td>
                                    <td>
                                        $ {{ txtregdata.total_ventas_tarjetas
                                            ? parseFloat(txtregdata.total_ventas_tarjetas).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>

                                <tr v-show="monto_final">
                                    <td><strong>Total Ventas</strong></td>
                                    <td>
                                        $ {{ txtregdata.totalGeneralVentas
                                            ? parseFloat(txtregdata.totalGeneralVentas).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>
                                <tr v-show="monto_final">
                                    <td><strong>Pagos Recibidos en Efectivo</strong></td>
                                    <td>
                                        ${{ txtregdata.total_pagos_efectivo
                                            ? parseFloat(txtregdata.total_pagos_efectivo).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>
                                <tr v-show="monto_final">
                                    <td><strong>Pagos Recibidos con Transferencia</strong></td>
                                    <td>
                                        ${{ txtregdata.total_pagos_transferencias
                                            ? parseFloat(txtregdata.total_pagos_transferencias).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>
                                <tr v-show="monto_final">
                                    <td><strong>Pagos Recibidos con Tarjeta</strong></td>
                                    <td>
                                        ${{ txtregdata.total_pagos_tarjetas
                                            ? parseFloat(txtregdata.total_pagos_tarjetas).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>

                                <tr v-show="monto_final">
                                    <td><strong>Total Ingresos de Efectivo</strong></td>
                                    <td>
                                        ${{ txtregdata.total_ingresos
                                            ? parseFloat(txtregdata.total_ingresos).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>
                                <tr v-show="monto_final">
                                    <td><strong>Total Salida de Efectivo</strong></td>
                                    <td class="text-error">
                                        $-{{ txtregdata.total_salidas
                                            ? parseFloat(txtregdata.total_salidas).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>
                                <tr v-show="monto_final">
                                    <td><strong>Efectivo en Caja</strong></td>
                                    <td class="text-success">
                                        $ {{ txtregdata.monto_final
                                            ? parseFloat(txtregdata.monto_final).toLocaleString('es-ES')
                                            : '0' }}
                                    </td>
                                </tr>

                                <tr>
                                    <td><strong>Observaciones</strong></td>
                                    <td>
                                        <p>{{ txtregdata.observaciones }}</p>
                                        <br>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>

                        <!-- Lista de movimientos -->
                        <v-container grid-list-xs>
                            <h3 class="text-center">Movimientos de Efectivo</h3>
                            <v-table density="compact">
                                <thead>
                                    <tr>
                                        <th scope="col">Movimiento</th>
                                        <th scope="col">Monto</th>
                                        <th scope="col">Descripción</th>
                                        <th scope="col">Referencia</th>
                                        <th scope="col">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="mov in movimientosCaja" :key="mov.id">
                                        <td><small>{{ mov.tipo }}</small></td>
                                        <td><small>
                                                ${{ mov.monto
                                                    ? parseFloat(mov.monto).toLocaleString('es-ES')
                                                    : '0' }}
                                            </small></td>
                                        <td><small>{{ mov.descripcion }}</small></td>
                                        <td><small>{{ mov.referencia }}</small></td>
                                        <td><small>{{ formatFecha(mov.created_at) }}</small></td>
                                    </tr>

                                </tbody>
                            </v-table>
                        </v-container>
                    </div>
                </v-card-text>

                <!-- Footer -->
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="primary" variant="elevated" prepend-icon="mdi-printer" @click="printDialogContent">
                        Imprimir
                    </v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog movimiento-->
        <div class="text-center pa-4">
            <v-dialog width="500" v-model="dialogMovimiento">
                <v-card>
                    <!-- Encabezado -->
                    <v-card-title class="text-h6 font-weight-bold">
                        Nuevo movimiento de caja
                    </v-card-title>

                    <v-card-text>
                        <v-form class="mt-1 logprimaryrm" @submit.prevent="guardarMovimiento">
                            <v-row>
                                <v-col cols="12">
                                    <v-select v-model="movimiento.tipo" :items="['salida', 'ingreso']"
                                        label="Tipo de movimiento" variant="underlined" color="primary" dense
                                        required />
                                </v-col>

                                <v-col cols="12">
                                    <v-text-field v-model="inicial_formateado" type="number" min="1"
                                        variant="underlined" color="primary" label="Monto (obligatorio)"
                                        @input="formatearMontoMovi" required />
                                </v-col>

                                <v-col cols="12">
                                    <v-text-field v-model="movimiento.descripcion" variant="underlined" color="primary"
                                        label="Descripción (opcional)" maxlength="255" />
                                </v-col>

                                <v-col cols="12">
                                    <v-textarea v-model="movimiento.referencia" variant="underlined" color="primary"
                                        label="Referencia (opcional)" maxlength="1000" rows="2" />
                                </v-col>
                            </v-row>

                            <!-- Botones -->
                            <v-card-actions>
                                <v-btn text @click="dialogMovimiento = false">Cerrar</v-btn>
                                <v-btn color="success" type="submit">Crear</v-btn>
                            </v-card-actions>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </div>


    </div>
    <v-chip label color="primary" text-color="primary">
        <v-btn @click="nuevaCaja" icon="mdi mdi-plus" density="compact"></v-btn>
        Abrir Caja
    </v-chip>

    <br><br>
    <v-row>
        <v-col cols="12" md="3">
            <form @submit.prevent="getCajas()">
                <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="Nombres, Apellidos, Cedula, Email"
                    variant="underlined" color="primary" clearable />
            </form>
        </v-col>
        <v-col cols="12" md="3">
            <label for="fecha">Fecha apertura</label>:
            <input type="date" name="fecha" v-model="search" @change="getCajas()">
        </v-col>
        <v-col cols="12" md="3">
            <v-btn color="primary" @click="reload()">Todos</v-btn>
        </v-col>
    </v-row>

    <v-row dense>
        <v-col v-for="caj in CajasList.data" :key="caj.id" cols="12" md="6" lg="3">
            <v-card elevation="2" class="pa-3">
                <div class="d-flex justify-space-between align-center mb-2">
                    <v-chip :color="caj.cierre ? 'success' : 'error'" variant="tonal" size="small">
                        {{ caj.cierre ? 'Cerrada' : 'Abierta' }}
                    </v-chip>
                    <strong>Caja Registradora #{{ caj.caja_numero }}</strong>
                </div>

                <v-divider class="mb-2"></v-divider>

                <div class="text-subtitle-2">
                    <strong>ID Caja:</strong> {{ caj.id }}
                </div>

                <div class="text-subtitle-2">
                    <strong>Responsable:</strong><br>
                    {{ caj.user?.nombres }} {{ caj.user?.apellidos || '' }}<br>
                    <small>{{ caj.user?.numidentificacion }}</small>
                </div>

                <div class="text-subtitle-2 mt-2">
                    <strong>Apertura:</strong> {{ formatFecha(caj.apertura) }}
                </div>

                <div class="text-subtitle-2">
                    <strong>Monto Inicial:</strong>
                    $ {{ caj.monto_inicial ? parseFloat(caj.monto_inicial).toLocaleString('es-ES') : '0' }}
                </div>

                <div class="text-subtitle-2">
                    <strong>Cierre:</strong> {{ caj.cierre ? formatFecha(caj.cierre) : '—' }}
                </div>

                <div class="text-subtitle-2">
                    <strong>Monto Final:</strong>
                    $ {{ caj.monto_final ? parseFloat(caj.monto_final).toLocaleString('es-ES') : '0' }}
                </div>
                <div class="d-flex justify-end mt-3">
                    <v-btn color="dark" icon="mdi mdi-eye-outline" @click="verCaja(caj.id); dialogShow = true"
                        variant="text" title="Ver"></v-btn>

                    <v-btn v-if="caj.user_id === authStore.user.id && !caj.cierre" color="dark"
                        icon="mdi mdi-square-edit-outline" @click="selecCaja(caj.id); dialogEdit = true" variant="text"
                        title="Editar"></v-btn>
                </div>
            </v-card>
        </v-col>
    </v-row>
    <br>
    <v-pagination v-model="currentPage" :length="lastPage" :total-visible="10" @update:modelValue="getCajas" />

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


<script setup>
import { ref, onMounted, watch } from 'vue'
import axiosInst from '@/components/axiosins'
import { useAuthStore } from '@/stores/auth';
import useRegister from '@/composables/useRegister'
import useUpdate from '@/composables/useUpdate'

const printContent = ref(null)
const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const authStore = useAuthStore();
const { register, regsuccessmsg, regerrormsg } = useRegister();
const { update, upderrormsg, updsuccessmsg } = useUpdate();

const url = import.meta.env.VITE_APP_API_URL

const txtregdata = ref({
    user_id: authStore.user.id, nombres: '', apertura: '', cierre: '', apellidos: '',
    caja_numero: '', monto_inicial: '', monto_final: '', total_ventas_efectivo: '',
    totalGeneralVentas: '', observaciones: '', total_efectivo_caja: '',
    total_ingresos: '', total_salidas: '', total_ventas_transferencias: '',
    total_ventas_contado: '', total_ventas_credito: '', total_ventas_tarjetas: '',
    total_pagos_efectivo: '', total_pagos_tarjetas: '', total_pagos_transferencias: ''
});

const movimiento = ref({ caja_id: '', user_id: '', tipo: '', monto: '', descripcion: '', referencia: '' })
const CajasList = ref({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
});
const nombreRules = ref([(v) => !!v || 'El campo es requerido'])
const emailRules = ref([(v) => !!v || 'El campo es requerido', (v) => /.+@.+\..+/.test(v) || 'E-mail debe ser valido']);
const snackbarReg = ref(false)
const snackbarUpd = ref(false)
const timeout = 4000
const dialogEdit = ref(false)
const editando = ref(false);
const dialogShow = ref(false);
const dialogMovimiento = ref(false);
const search = ref('');
const authUsershow = ref(false);
const txtregdataUsershow = ref(false);
const isMontoFinalDisabled = ref(false);
const total_ventas = ref(true);
const monto_final = ref(true);
const monto_inicialDisabled = ref(false);
const movimientosCaja = ref([]);
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(10)
const monto_inicial_formateado = ref('');
const inicial_formateado = ref('');

const formatearMonto = () => {
    // Quitamos todo lo que no sea número
    const valorSinFormato = monto_inicial_formateado.value.replace(/\D/g, '');

    // Actualizamos el valor limpio para guardar
    txtregdata.value.monto_inicial = valorSinFormato;

    // Agregamos el formato de miles visualmente
    monto_inicial_formateado.value = new Intl.NumberFormat('es-CO').format(valorSinFormato);
};

const formatearMontoMovi = () => {
    // Quitamos todo lo que no sea número
    const SinFormato = inicial_formateado.value.replace(/\D/g, '');

    // Actualizamos el valor limpio para guardar
    movimiento.value.monto = SinFormato;

    // Agregamos el formato de miles visualmente
    inicial_formateado.value = new Intl.NumberFormat('es-CO').format(SinFormato);
};

const nuevaCaja = () => {
    editando.value = true
    dialogEdit.value = true
    authUsershow.value = true
    txtregdataUsershow.value = false
    monto_inicialDisabled.value = false
    isMontoFinalDisabled.value = true
    txtregdata.value.caja_numero = ''
    monto_inicial_formateado.value = ''
    txtregdata.value.monto_final = ''
    txtregdata.value.observaciones = ''
    movimiento.value.tipo = ''
    movimiento.value.monto = ''
    movimiento.value.descripcion = ''
    movimiento.value.referencia = ''
    inicial_formateado.value = ''
    monto_final.value = false
    total_ventas.value = false

}

const registrar = async () => {
    await register(url + 'api/cajas', txtregdata.value);
    getCajas()
    dialogEdit.value = false
    snackbarReg.value = true
    editando.value = true;
    movimiento.value.tipo = ''
    movimiento.value.monto = ''
    inicial_formateado.value = ''
    movimiento.value.descripcion = ''
    movimiento.value.referencia = ''
}

const guardarMovimiento = async () => {
    await register(url + 'api/cajasmovimientos', movimiento.value);
    getCajas()
    dialogEdit.value = false
    snackbarReg.value = true
    dialogMovimiento.value = false
    movimiento.value.tipo = ''
    movimiento.value.monto = ''
    inicial_formateado.value = ''
    movimiento.value.descripcion = ''
    movimiento.value.referencia = ''
}

const actualizar = async () => {
    let confirmar = confirm('¿Cerrar Caja?')
    if (confirmar) {
        await update(url + 'api/cajas/' + txtregdata.value.id, txtregdata.value);
        getCajas()
        dialogEdit.value = false
        snackbarUpd.value = true
        editando.value = false;
    }

}
const verCaja = async (id) => {
    selecCaja(id)
    dialogShow.value = true
    authUsershow.value = false
    txtregdataUsershow.value = true

}

const selecCaja = async (id) => {
    authUsershow.value = false
    txtregdataUsershow.value = true
    editando.value = false
    monto_inicialDisabled.value = true
    isMontoFinalDisabled.value = false
    monto_final.value = true
    total_ventas.value = true

    try {
        const res = await axiosInst.get(url + 'api/cajas/' + id)
        // Datos base       
        movimientosCaja.value = res.data.movimientos
        movimiento.value.caja_id = id
        movimiento.value.user_id = res.data.user.id
        txtregdata.value = res.data
        txtregdata.value.nombres = res.data.user.nombres
        txtregdata.value.apellidos = res.data.user.apellidos
        monto_inicial_formateado.value = res.data.monto_inicial

        // 🔹 VENTAS (informativo)
        const montoInicial = parseFloat(res.data.monto_inicial) || 0
        const ventasContado = parseFloat(res.data.total_ventas_contado) || 0
        const ventasTransferencias = parseFloat(res.data.total_ventas_transferencias) || 0
        const ventasCredito = parseFloat(res.data.total_ventas_credito) || 0
        const ventasTarjeta = parseFloat(res.data.total_ventas_tarjetas) || 0
        const pagosEfectivo = parseFloat(res.data.total_pagos_efectivo) || 0
        const pagosTransferencias = parseFloat(res.data.total_pagos_transferencias) || 0
        const pagosTarjeta = parseFloat(res.data.total_pagos_tarjetas) || 0

        txtregdata.value.total_ventas_contado = ventasContado
        txtregdata.value.total_ventas_transferencias = ventasTransferencias
        txtregdata.value.total_ventas_credito = ventasCredito
        txtregdata.value.total_ventas_tarjetas = ventasTarjeta
        txtregdata.value.totalGeneralVentas = ventasContado + ventasCredito + ventasTarjeta + ventasTransferencias

        // 🔹 MOVIMIENTOS
        const ingresos = parseFloat(res.data.ingresos) || 0
        const salidas = parseFloat(res.data.salidas) || 0

        // 🔹 TOTAL EFECTIVO EN CAJA (CUADRE REAL)
        txtregdata.value.total_efectivo_caja = ventasContado + montoInicial + pagosEfectivo

        // 🔹 DESGLOSE       
        txtregdata.value.total_ingresos = ingresos
        txtregdata.value.total_salidas = salidas

        // 🔹 MONTO FINAL (solo efectivo)
        txtregdata.value.monto_final = txtregdata.value.total_efectivo_caja + txtregdata.value.total_ingresos - salidas

    } catch (err) {
        console.error(err)
        alert('Error cargando la caja')
    }
}


const getCajas = async (page = 1) => {
    try {
        const res = await axiosInst.get(url + `api/cajas`, {
            params: {
                page,
                search: search.value || '',
            },
        });
        CajasList.value = res.data
        currentPage.value = res.data.current_page;
        lastPage.value = res.data.last_page;
        perPage.value = res.data.per_page;
        filters.value.id = ''
        filters.value.fecha = ''
    } catch (error) {

    }
};

onMounted(() => {
    getCajas()
});

const reload = () => {
    search.value = ''
    getCajas()
}

watch(search, () => {
    if (search.value.length >= 3) {
        getCajas();
    }

});

const printDialogContent = () => {
    const content = printContent.value?.innerHTML || ''

    const printArea = document.createElement('div')
    printArea.innerHTML = content

    const win = window.open('', '', 'height=600,width=800')
    win.document.write(`
    <html>
      <head>
        <title>Resumen de Caja</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h4 { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 6px; vertical-align: top; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
}


</script>
<style lang="scss">
.registerBox {
    max-width: 1000px;
    margin: 0 auto;
}
</style>