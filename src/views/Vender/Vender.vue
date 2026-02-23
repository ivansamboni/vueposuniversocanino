<template>
    <!-- ===================== CONTENEDOR PRINCIPAL ===================== -->
    <v-container fluid class="bg-grey-lighten-4 main-pos-container pa-0">
        <v-row class="fill-height-custom" no-gutters>
            <v-col cols="12" class="d-flex flex-column h-100">

                <!-- ===== BARRA SUPERIOR: BÚSQUEDA Y CLIENTE ===== -->
                <v-card elevation="2" class="mb-2 rounded-lg flex-none">
                    <v-card-text class="py-3">
                        <v-form @submit.prevent="searchCodigo()">
                            <v-row dense align="center">

                                <!-- Código de barras -->
                                <v-col cols="12" md="2">
                                    <v-text-field ref="codigoBarrasInput" v-model="txtregdata.codigo_barras"
                                        label="Código (Ctrl + C)" variant="outlined" color="primary" density="compact"
                                        hide-details autofocus>
                                        <template v-slot:prepend-inner>
                                            <v-icon icon="mdi-barcode-scan" class="opacity-60"
                                                @click="searchCodigo()" />
                                        </template>
                                    </v-text-field>
                                </v-col>

                                <!-- Buscador por nombre -->
                                <v-col cols="12" md="2">
                                    <v-combobox v-model="selectedId" :items="productResults" item-title="nombre"
                                        item-value="codigo_barras" v-model:search="nomBuscar" label="Buscar producto..."
                                        prepend-inner-icon="mdi-magnify" variant="outlined" color="primary"
                                        density="compact" hide-details clearable />
                                </v-col>

                                <!-- Botón Planes -->
                                <v-col cols="12" md="1">
                                    <v-btn icon="mdi mdi-playlist-check" title="Planes" density="compact"
                                        @click="dialog = true" />
                                </v-col>

                                <!-- Estado de caja -->
                                <v-col cols="12" md="2" class="d-flex justify-center">
                                    <v-chip :color="cajaMensajeEstado.status" variant="flat" size="small"
                                        class="font-weight-medium w-100 justify-center"
                                        :class="{ 'clase-parpadeo': cajaMensajeEstado.status === 'error' }">
                                        <v-icon start size="20">mdi-cash-register</v-icon>
                                        {{ cajaMensajeEstado.message }}
                                    </v-chip>
                                </v-col>

                                <!-- Info cliente activo -->
                                <v-col cols="12" md="5">
                                    <v-card variant="flat" color="blue-grey-lighten-5" class="rounded-lg">
                                        <v-list-item density="compact" class="pa-1">
                                            <template v-slot:prepend>
                                                <v-btn color="primary" icon="mdi-account-edit" variant="tonal"
                                                    size="small" class="rounded-lg" @click="dialogEdit = true" />
                                            </template>
                                            <v-list-item-title class="font-weight-bold text-body-2 text-uppercase">
                                                {{ datosVenta.nombres || 'Cliente General' }}
                                            </v-list-item-title>
                                            <v-list-item-subtitle class="text-caption">
                                                NIT/CC: {{ datosVenta.numidentificacion }}
                                            </v-list-item-subtitle>
                                        </v-list-item>
                                    </v-card>
                                </v-col>

                            </v-row>
                            <v-btn type="submit" hidden />
                        </v-form>
                    </v-card-text>
                </v-card>

                <!-- ===== TABLA DE PRODUCTOS + PLAN + PAGO ===== -->
                <v-card elevation="4" class="rounded-lg overflow-hidden d-flex flex-column flex-grow-1 mb-4">

                    <!-- Tabla de productos -->
                    <div class="table-responsive flex-grow-1">
                        <table fixed-header hover class="table">
                            <thead>
                                <tr class="bg-grey-lighten-4">
                                    <th class="text-uppercase text-caption font-weight-bold">Código</th>
                                    <th class="text-uppercase text-caption font-weight-bold">Articulo</th>
                                    <th class="text-uppercase text-caption font-weight-bold">U/M</th>
                                    <th class="text-center text-uppercase text-caption font-weight-bold"
                                        style="width: 100px;">
                                        Cantidad <small>(F2)</small>
                                    </th>
                                    <th class="text-right text-uppercase text-caption font-weight-bold">Precio Unit.
                                    </th>
                                    <th class="text-right text-uppercase text-caption font-weight-bold">Subtotal</th>
                                    <th class="text-center">
                                        <v-btn v-if="itemsVenta.length > 0" prepend-icon="mdi-delete-sweep"
                                            color="error" variant="text" size="small" @click="deleteItemAll">
                                            Vaciar
                                        </v-btn>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in itemsVenta" :key="item.id">
                                    <td><small>
                                            <div class="font-weight-medium">{{ item.codigo_barras }}</div>
                                        </small></td>
                                    <td><small>
                                            <div class="font-weight-medium">{{ item.nombre }}</div>
                                        </small></td>
                                    <td>
                                        <h6>{{ item.unidad_medida }}</h6>
                                    </td>
                                    <td class="text-center">
                                        <small>
                                            <v-text-field v-model.number="item.cantidad" type="number"
                                                variant="underlined" density="compact" hide-details
                                                class="text-center custom-qty" min="1"
                                                :ref="el => { if (el) inputRefs[index] = el }"
                                                @focus="focusedIndex = index" @blur="focusedIndex = null"
                                                @change="saveToLocalStorage" />
                                        </small>
                                    </td>
                                    <td class="text-right">
                                        <small>${{ parseFloat(item.precio_final).toLocaleString('es-ES') }}</small>
                                    </td>
                                    <td class="text-right font-weight-bold">
                                        <small>${{ (item.cantidad * item.precio_final).toLocaleString('es-ES')
                                        }}</small>
                                    </td>
                                    <td class="text-center">
                                        <small>
                                            <v-btn icon="mdi-close-circle-outline" variant="text" color="error"
                                                size="small" @click="deleteItem(item.id)" />
                                        </small>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <br>

                    <!-- Plan seleccionado -->
                    <v-card v-show="cardPlanSelected" class="mx-auto mt-4" elevation="2" border width="100%">
                        <div class="d-flex flex-no-wrap align-center pa-3">

                            <div style="width: 25%" class="border-e pr-4">
                                <v-chip :color="dataPlan.is_active ? 'success' : 'error'" size="x-small" variant="flat"
                                    class="mb-1">
                                    {{ dataPlan.is_active ? 'Activo' : 'Inactivo' }}
                                </v-chip>
                                <div class="text-h6 font-weight-bold text-primary text-truncate">
                                    {{ dataPlan.name }}
                                </div>
                                <div class="text-caption text-medium-emphasis text-truncate">
                                    {{ dataPlan.description }}
                                </div>
                            </div>

                            <div style="width: 30%" class="px-4 border-e">
                                <div class="d-flex align-center mb-1">
                                    <v-icon size="small" color="grey" class="mr-2">mdi-calendar-week</v-icon>
                                    <span class="text-body-2">{{ dataPlan.days_per_week }} días/semana</span>
                                </div>
                                <div class="d-flex align-center">
                                    <v-icon size="small" color="grey" class="mr-2">mdi-clock-outline</v-icon>
                                    <span class="text-body-2">Vence en: {{ dataPlan.duration_days }} días</span>
                                </div>
                            </div>

                            <div style="flex-grow: 1" class="px-4">
                                <div class="text-subtitle-2 font-weight-bold text-uppercase">
                                    <v-icon size="small" class="mr-1">mdi-account</v-icon>
                                    {{ datosVenta.nombres || 'Cliente General' }}
                                </div>
                                <div class="text-caption d-flex justify-space-between mt-1">
                                    <span><strong>ID:</strong> {{ datosVenta.numidentificacion }}</span>
                                    <span class="text-primary"><strong>Mascota:</strong> {{ datosVenta.petname }}</span>
                                </div>
                            </div>

                            <div style="width: 20%" class="text-right pl-4">
                                <div class="text-caption text-grey">Precio del Plan</div>
                                <div class="text-h5 font-weight-bold text-success">
                                    ${{ parseFloat(dataPlan.price).toLocaleString('es-ES') }}
                                    <v-btn icon="mdi-close-circle-outline" variant="text" color="error" size="small"
                                        title="Cancelar" @click="cancelPlan()" />
                                </div>
                            </div>

                        </div>
                    </v-card>

                    <!-- Sección de pago -->
                    <v-container fluid class="pa-5">
                        <v-row align="center" no-gutters>

                            <!-- Forma y método de pago -->
                            <v-col cols="12" md="6">
                                <v-row dense align="center" class="pe-4">
                                    <v-col cols="4">
                                        <v-select v-model="datosVenta.forma_pago" :items="formasPago"
                                            label="Forma de Pago" variant="outlined" density="compact" hide-details
                                            color="primary" />
                                    </v-col>
                                    <v-col cols="4">
                                        <v-select v-if="datosVenta.forma_pago === '1'" v-model="datosVenta.metodo_pago"
                                            :items="metodosPago" label="Método" variant="outlined" density="compact"
                                            color="primary" hide-details />
                                    </v-col>
                                    <v-col cols="3">
                                        <v-text-field v-if="datosVenta.metodo_pago === '10'"
                                            v-model="efectivoRecibidoFormatted" label="Efectivo Recibido"
                                            color="primary" variant="outlined" density="compact" prefix="$"
                                            @input="updateEfectivoRecibido" hide-details />
                                    </v-col>
                                </v-row>
                            </v-col>

                            <!-- Toggle impresión -->
                            <v-col cols="12" md="2" class="d-flex align-center justify-end ps-4">
                                <v-switch v-model="activeImpresion" density="compact" hide-details
                                    :label="activeImpresion ? 'Imprimir' : 'No Imprimir'" color="primary"
                                    class="me-6" />
                            </v-col>

                            <!-- Total -->
                            <v-col cols="12" md="2" class="text-center border-s border-e px-2">
                                <div class="d-flex flex-column align-center justify-center">
                                    <span class="text-overline text-grey-darken-1" style="line-height: 1;">TOTAL A
                                        PAGAR</span>
                                    <span class="text-h4 font-weight-black text-primary-darken-1"
                                        style="line-height: 1.2;">
                                        ${{ parseFloat(total).toLocaleString('es-ES') }}
                                    </span>
                                    <div style="min-height: 20px;">
                                        <span v-if="mensajeDevolver" :class="{
                                            'text-success': colorMensaje === 'text-success',
                                            'text-error': colorMensaje !== 'text-success',
                                            'text-caption font-weight-bold': true
                                        }">
                                            {{ mensajeDevolver }}
                                        </span>
                                    </div>
                                </div>
                            </v-col>

                            <!-- Botón vender -->
                            <v-col cols="12" md="2" class="d-flex align-center justify-end ps-2">
                                <v-btn color="primary" elevation="6" class="text-none font-weight-bold rounded-lg px-4"
                                    :disabled="isDisabled" :loading="spinner" @click="finishSale">
                                    Vender (Ctrl+F9)
                                </v-btn>
                            </v-col>

                        </v-row>
                    </v-container>

                </v-card>
            </v-col>
        </v-row>
    </v-container>


    <!-- ===================== DIALOGS ===================== -->

    <!-- Dialog: Editar / Asignar cliente -->
    <v-dialog v-model="dialogEdit" max-width="700px" transition="dialog-bottom-transition">
        <v-card class="rounded-xl">
            <v-toolbar color="primary" density="comfortable">
                <v-icon start class="ms-4">mdi-account-search</v-icon>
                <v-toolbar-title class="text-subtitle-1 font-weight-bold">
                    Asignar Cliente a Factura
                </v-toolbar-title>
                <v-spacer />
                <v-btn icon="mdi-close" variant="text" @click="dialogEdit = false" />
            </v-toolbar>

            <v-card-text class="pa-6">
                <v-form>
                    <v-row align="center">
                        <v-col cols="12" md="8">
                            <v-combobox v-model="search" :items="clientResults" item-title="nombre" item-value="id"
                                variant="outlined" v-model:search="buscarCliente"
                                label="Buscar cliente por nombre o NIT" prepend-inner-icon="mdi-magnify" color="primary"
                                hide-details rounded="lg" />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-btn color="primary" block variant="tonal" height="56" class="text-none rounded-lg"
                                @click="dialogAddclient = true">
                                <v-icon start>mdi-account-plus</v-icon>
                                Nuevo Cliente
                            </v-btn>
                        </v-col>
                    </v-row>

                    <!-- Info del cliente seleccionado -->
                    <v-sheet border rounded="lg" class="mt-6 bg-grey-lighten-5 pa-4">
                        <div class="text-overline text-grey-darken-1 mb-2">Información de Facturación</div>
                        <v-row dense>
                            <v-col cols="12" md="7">
                                <div class="d-flex align-center mb-2">
                                    <v-icon size="18" color="primary" class="me-2">mdi-account-outline</v-icon>
                                    <span class="text-body-2 font-weight-bold">NOMBRE:</span>
                                    <span class="ms-2 text-body-2">{{ search.nombre || 'No seleccionado' }}</span>
                                </div>
                                <div class="d-flex align-center mb-2">
                                    <v-icon size="18" color="primary"
                                        class="me-2">mdi-card-account-details-outline</v-icon>
                                    <span class="text-body-2 font-weight-bold">CC/NIT:</span>
                                    <span class="ms-2 text-body-2">{{ search.numidentificacion || '-' }}</span>
                                </div>
                            </v-col>
                            <v-col cols="12" md="5">
                                <div class="d-flex align-center mb-2">
                                    <v-icon size="18" color="primary" class="me-2">mdi-phone-outline</v-icon>
                                    <span class="text-body-2 font-weight-bold">TEL:</span>
                                    <span class="ms-2 text-body-2">{{ search.telefono || '-' }}</span>
                                </div>
                                <div class="d-flex align-center mb-2">
                                    <v-icon size="18" color="primary" class="me-2">mdi-email-outline</v-icon>
                                    <span class="text-body-2 font-weight-bold">EMAIL:</span>
                                    <span class="ms-2 text-body-2 text-truncate">{{ search.email || '-' }}</span>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <v-divider class="my-2" />
                                <div class="d-flex align-start">
                                    <v-icon size="18" color="primary" class="me-2 mt-1">mdi-map-marker-outline</v-icon>
                                    <span class="text-body-2 font-weight-bold">DIRECCIÓN:</span>
                                    <span class="ms-2 text-body-2">{{ search.ubicacion || '-' }}</span>
                                </div>
                            </v-col>
                        </v-row>
                    </v-sheet>

                    <v-alert v-if="search.email" density="compact" type="info" variant="tonal" class="mt-4 text-caption"
                        icon="mdi-send-check">
                        La factura se enviará al correo <strong>{{ search.email }}</strong>
                    </v-alert>
                </v-form>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-btn variant="text" color="grey-darken-1" class="text-none"
                    @click="clienteFinal(222222222222); dialogEdit = false">
                    Usar Cliente General
                </v-btn>
                <v-spacer />
                <v-btn color="primary" variant="elevated" :disabled="!search.numidentificacion"
                    class="text-none px-6 rounded-lg"
                    @click="clienteFinal(search.numidentificacion); dialogEdit = false">
                    <v-icon start>mdi-check-circle</v-icon>
                    Confirmar Cliente
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog: Crear nuevo cliente -->
    <v-dialog v-model="dialogAddclient" max-width="auto">
        <v-card>
            <v-card-actions class="justify-end">
                <v-btn text="X Cerrar" color="primary" @click="dialogAddclient = false" />
            </v-card-actions>
            <v-container>
                <Clientes ref="clientesRef" />
            </v-container>
        </v-card>
    </v-dialog>

    <!-- Dialog: Lista de planes -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="1000px" scrollable>
            <v-card color="grey-lighten-4">
                <v-card-title class="d-flex align-center justify-space-between bg-white pa-4">
                    <span class="text-h5 font-weight-bold text-primary">Planes y Membresías</span>
                    <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-6">
                    <v-row dense>
                        <v-col v-for="mac in plansList.data" :key="mac.id" cols="12" sm="6" md="4" lg="3">
                            <v-card class="mx-auto h-100 d-flex flex-column rounded-xl transition-swing" elevation="1"
                                hover border>
                                <div class="pa-3 d-flex justify-end">
                                    <v-chip :color="mac.is_active ? 'success' : 'error'" size="x-small" variant="tonal"
                                        class="font-weight-bold">
                                        {{ mac.is_active ? 'Activo' : 'Inactivo' }}
                                    </v-chip>
                                </div>
                                <v-card-item class="pt-0 text-center">
                                    <div class="text-h6 font-weight-black text-secondary mb-1">{{ mac.name }}</div>
                                    <v-divider class="mx-auto w-25 mb-2" color="primary" thickness="2" />
                                    <div class="text-caption text-medium-emphasis line-clamp-2"
                                        style="min-height: 40px;">
                                        {{ mac.description }}
                                    </div>
                                </v-card-item>
                                <v-sheet color="grey-lighten-5" class="mx-4 rounded-lg pa-2">
                                    <v-list density="compact" bg-color="transparent">
                                        <v-list-item density="compact" class="px-1">
                                            <template v-slot:prepend>
                                                <v-icon size="small" color="primary">mdi-calendar-week</v-icon>
                                            </template>
                                            <v-list-item-title class="text-caption">
                                                {{ mac.days_per_week }} días / semana
                                            </v-list-item-title>
                                        </v-list-item>
                                        <v-list-item density="compact" class="px-1">
                                            <template v-slot:prepend>
                                                <v-icon size="small" color="primary">mdi-clock-outline</v-icon>
                                            </template>
                                            <v-list-item-title class="text-caption">
                                                Vigencia: {{ mac.duration_days }} días
                                            </v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-sheet>
                                <v-card-text class="text-center pt-4">
                                    <div class="text-h5 font-weight-bold text-primary">
                                        ${{ parseFloat(mac.price).toLocaleString('es-ES') }}
                                    </div>
                                </v-card-text>
                                <v-spacer />
                                <v-card-actions class="pa-4">
                                    <v-btn block color="primary" variant="flat" rounded="lg"
                                        prepend-icon="mdi-check-circle-outline" :disabled="!mac.is_active"
                                        @click="selecPlan(mac.id), dialog2 = true">
                                        Seleccionar
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Dialog: Confirmar asignación de plan -->
        <v-dialog v-model="dialog2" max-width="450px">
            <v-card class="rounded-xl pa-2">
                <v-card-title class="text-h6 font-weight-bold text-center pt-4">
                    Confirmar Asignación
                </v-card-title>
                <v-card-text>
                    <v-list-item class="bg-blue-lighten-5 rounded-lg mb-4 pa-3">
                        <template v-slot:prepend>
                            <v-avatar color="primary" variant="flat">
                                <v-icon color="white" @click="dialogEdit = true">mdi-account</v-icon>
                            </v-avatar>
                        </template>
                        <v-list-item-title class="font-weight-bold text-uppercase">
                            {{ datosVenta.nombres || 'Cliente General' }}
                        </v-list-item-title>
                        <v-list-item-subtitle>CC: {{ datosVenta.numidentificacion }}</v-list-item-subtitle>
                    </v-list-item>

                    <p class="text-caption text-grey-darken-1 mb-2 ml-1">VINCULAR A UNA MASCOTA:</p>
                    <v-select v-model="datosVenta.pet_id" :items="pets" item-title="name" item-value="id"
                        label="Seleccionar Mascota" prepend-inner-icon="mdi-paw" variant="outlined"
                        density="comfortable" color="primary" rounded="lg" :hint="getPetHint(datosVenta.pet_id)"
                        persistent-hint no-data-text="El cliente no tiene mascotas registradas"
                        @update:model-value="actualizarNombreMascota">
                        <template v-slot:item="{ props, item }">
                            <v-list-item v-bind="props" :subtitle="item.raw.type" />
                        </template>
                    </v-select>
                </v-card-text>
                <v-card-actions class="pb-4 px-6">
                    <v-btn variant="text" color="grey" @click="dialog2 = false, cancelPlan()">Cancelar</v-btn>
                    <v-spacer />
                    <v-btn color="primary" variant="flat" rounded="lg" class="px-6" @click="confirmarPlan()">
                        Confirmar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>

    <!-- Dialog: Impresión de factura -->
    <v-dialog max-width="500px" v-model="dialogImp">
        <v-card>
            <v-card-title class="justify-space-between">
                <span class="text-h6">Impresión de Factura</span>
                <v-btn icon="mdi-close" @click="dialogImp = false, codigoBarrasInput?.value?.focus?.();" />
            </v-card-title>
            <v-divider />
            <v-card-text>
                <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="600px" frameborder="0" />
            </v-card-text>
        </v-card>
    </v-dialog>

    <!-- Snackbar: venta exitosa -->
    <v-snackbar v-model="snackbarReg">
        <h3 class="text-success">
            Venta realizada
            <v-icon left size="small" class="mr-2">mdi-check-circle</v-icon>
        </h3>
        <template v-slot:actions>
            <v-btn color="blue" variant="text" @click="snackbarReg = false">Cerrar</v-btn>
        </template>
    </v-snackbar>
    <v-snackbar v-model="snackbarError">
        <h3 v-if="regerrormsg" class="text-error">{{ regerrormsg }}</h3>
    </v-snackbar>



</template>


        <script setup>
        // ===================== IMPORTS =====================
        import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, watch, nextTick, onBeforeUpdate, shallowRef } from 'vue'
        import { useRouter } from 'vue-router'
        import axiosInst from '@/components/axiosins'
        import { useAuthStore } from '@/stores/auth'
        import useRegister from '@/composables/useRegister'
        import { CodigosDian } from '@/composables/CodigosDian'
        import Clientes from '../Clientes/Clientes.vue'


        // ===================== SETUP =====================
        const { metodosPago, formasPago } = CodigosDian()
        const router = useRouter()
        const authStore = useAuthStore()
        const { register } = useRegister()
        const url = import.meta.env.VITE_APP_API_URL


        // ===================== ESTADO DE UI =====================
        const dialog = shallowRef(false)
        const dialog2 = shallowRef(false)
        const dialogEdit = ref(false)
        const dialogAddclient = ref(false)
        const dialogImp = ref(false)
        const snackbarReg = ref(false)
        const snackbarError = ref(false)
        const cardPlanSelected = ref(false)
        const spinner = ref(false)
        const activeImpresion = ref(true)
        const pdfUrl = ref('')
        const cajaMensajeEstado = ref({ message: '', status: '' })
        const regerrormsg = ref('')

        // ===================== REFERENCIAS DOM =====================
        const codigoBarrasInput = ref(null)
        const clientesRef = ref(null)
        const inputRefs = ref([])
        const focusedIndex = ref(null)


        // ===================== BÚSQUEDA =====================
        const search = ref('')
        const buscarCliente = ref('')      // watch separado del input del combobox
        const nomBuscar = ref('')
        const selectedId = ref('')
        const clientResults = ref([])
        const productResults = ref([])


        // ===================== VENTA =====================
        const cedula = ref('222222222222')
        const itemsVenta = ref([])
        const pets = ref([])

        const datosVenta = ref({
            cliente_id: '',
            pet_id: '',
            petname: '',
            plan_id: '',
            user_id: authStore.user.id,
            nombres: '',
            numidentificacion: '',
            forma_pago: '1',   // 1 = contado | 2 = crédito
            metodo_pago: '10',  // efectivo por defecto
            total: 0,
        })

        const txtregdata = ref({
            cajero_id: authStore.user.id,
            id: '',
            nombre: '',
            unidad_medida: '',
            precio_venta: '',
            precio_final: '',
            cantidad: 1,
            stock: '',
            codigo_barras: '',
            img1: '',
        })

        const dataPlan = ref({
            id: '',
            name: '',
            description: '',
            price: '',
            days_per_week: '',
            duration_days: '',
            is_active: true,
        })

        const plansList = ref({
            current_page: 1,
            data: [],
            last_page: 1,
            next_page_url: null,
            prev_page_url: null,
        })


        // ===================== EFECTIVO =====================
        const efectivoRecibido = ref('')

        const efectivoRecibidoFormatted = computed(() =>
            efectivoRecibido.value.toLocaleString('es-CO')
        )

        const updateEfectivoRecibido = (event) => {
            const value = event.target.value.replace(/\D/g, '')
            efectivoRecibido.value = Number(value)
        }

        // ===================== COMPUTED =====================
        const total = computed(() => {

            const totalProductos = itemsVenta.value.reduce((acc, p) => acc + p.precio_final * p.cantidad, 0)

            const precioPlan = dataPlan.value && dataPlan.value.price ? parseFloat(dataPlan.value.price) : 0

            return totalProductos + precioPlan
        })

        const totalDevolver = computed(() =>
            efectivoRecibido.value - total.value
        )

        const mensajeDevolver = computed(() => {
            const fmt = Math.abs(totalDevolver.value).toLocaleString('es-CO')
            return totalDevolver.value >= 0 ? `Devolver: $${fmt}` : `Debe: $${fmt}`
        })

        const colorMensaje = computed(() =>
            totalDevolver.value >= 0 ? 'text-success' : 'text-error'
        )

        const isDisabled = computed(() => {
            if (!datosVenta.value.cliente_id) return true
            if (datosVenta.value.forma_pago === '1' && !datosVenta.value.metodo_pago) return true
            const tieneProductos = itemsVenta.value.length > 0
            const tienePlan = !!datosVenta.value.plan_id
            if (!tieneProductos && !tienePlan) return true
            if (tieneProductos) {
                const cantidadesInvalidas = itemsVenta.value.some(item =>
                    item.cantidad === null || Number(item.cantidad) <= 0
                )
                if (cantidadesInvalidas) return true
            }

            return false
        })


        // ===================== LOCAL STORAGE =====================
        const loadStorageList = () => {
            const stored = JSON.parse(localStorage.getItem('listaProductos'))
            if (stored) itemsVenta.value = stored
        }

        const saveToLocalStorage = () => {
            localStorage.setItem('listaProductos', JSON.stringify(itemsVenta.value))
        }


        // ===================== API: CAJA =====================
        const validarAperturaCaja = async () => {
            const res = await axiosInst.get(`${url}api/validarcaja/${txtregdata.value.cajero_id}`)
            cajaMensajeEstado.value.message = res.data.message
            cajaMensajeEstado.value.status = res.data.status
        }


        // ===================== API: PRODUCTOS =====================
        const searchProducto = async () => {
            try {
                const res = await axiosInst.get(`${url}api/searchnomproducto/${nomBuscar.value}`)
                productResults.value = res.data.map(p => ({
                    codigo_barras: p.codigo_barras,
                    nombre: p.nombre
                        + (p.unidad_medida ? ' ' + p.unidad_medida : '')
                        + (p.precio_final ? ' $ ' + p.precio_final : '')
                }))
            } catch { /* silencioso */ }
        }

        const searchCodigo = async () => {
            try {
                const res = await axiosInst.get(`${url}api/searchcodigoproducto/${txtregdata.value.codigo_barras}`)

                if (res.data.stock === 0) {
                    alert('Alerta: Producto agotado en el sistema. Actualice stock en la opción de ajustes.')
                }

                const index = itemsVenta.value.findIndex(
                    item => item.id === res.data.id || item.codigo_barras === txtregdata.value.codigo_barras
                )

                if (index !== -1) {
                    itemsVenta.value[index].cantidad += txtregdata.value.cantidad
                    const item = itemsVenta.value.splice(index, 1)[0]
                    itemsVenta.value.unshift(item)
                } else {
                    itemsVenta.value.unshift({
                        id: res.data.id,
                        nombre: res.data.nombre,
                        unidad_medida: res.data.unidad_medida,
                        precio_venta: res.data.precio_venta,
                        precio_final: res.data.precio_final,
                        stock: res.data.stock,
                        cantidad: txtregdata.value.cantidad,
                        codigo_barras: txtregdata.value.codigo_barras,
                    })
                }

                saveToLocalStorage()

                // Reset campos
                txtregdata.value.cantidad = 1
                txtregdata.value.codigo_barras = ''
                selectedId.value = ''
                productResults.value = []
                codigoBarrasInput.value.focus()

            } catch {
                alert('Código no encontrado')
                txtregdata.value.codigo_barras = ''
            }
        }


        // ===================== API: CLIENTES =====================
        const searchCliente = async () => {
            try {
                const res = await axiosInst.post(`${url}api/clientesearch`, { search: search.value })
                clientResults.value = res.data.data.map(c => ({
                    id: c.id,
                    numidentificacion: c.numidentificacion,
                    nombre: `${c.nombres} ${c.apellidos ?? ''}`,
                    email: c.email,
                    telefono: c.telefono,
                    ubicacion: c.ubicacion || '',
                }))
            } catch (error) {
                console.error('Error al obtener los clientes', error)
            }
        }

        const clienteFinal = async (cedula) => {
            const payload = {
                tipoidentificacion: 'CÉDULA DE CIUDADANÍA',
                numidentificacion: cedula,
                nombres: 'CONSUMIDOR',
                apellidos: 'FINAL',
            }

            try {
                let res
                try {
                    res = await axiosInst.get(`${url}api/clientefinal/${cedula}`)
                } catch (error) {
                    if (error.response?.status === 404) {
                        await register(`${url}api/clientes`, payload)
                        res = await axiosInst.get(`${url}api/clientefinal/${cedula}`)
                    } else {
                        throw error
                    }
                }

                pets.value = res.data.pets
                datosVenta.value.cliente_id = res.data.id
                datosVenta.value.numidentificacion = res.data.numidentificacion
                datosVenta.value.nombres = `${res.data.nombres} ${res.data.apellidos}`
                search.value = []

            } catch {
                alert('Error procesando el cliente final. Redirigiendo al módulo de clientes.')
                router.push('/clientes')
            }
        }


        // ===================== API: PLANES =====================
        const getPlans = async (urls = `${url}api/planes?page=1`) => {
            try {
                const res = await axiosInst.get(urls)
                plansList.value = res.data
            } catch { /* silencioso */ }
        }

        const selecPlan = async (id) => {
            const res = await axiosInst.get(`${url}api/planes/${id}`)
            dataPlan.value = res.data
            datosVenta.value.plan_id = res.data.id
        }

        const actualizarNombreMascota = (idSeleccionado) => {
            const mascota = pets.value.find(pet => pet.id === idSeleccionado)
            datosVenta.value.petname = mascota ? mascota.name : ''
            dialog2.value = false
            dialog.value = false
        }

        const confirmarPlan = () => {
            dialog2.value = false
            dialog.value = false
            cardPlanSelected.value = true
        }

        const cancelPlan = async () => {
            cardPlanSelected.value = false
            dataPlan.value.id = ''
            dataPlan.value.price = ''
            dataPlan.value.name = ''
            datosVenta.value.plan_id = ''
            datosVenta.value.pet_id = ''
        }


        const getPetHint = (id) => {
            if (!id) return 'Selecciona a quién se le asignará el plan'
            cardPlanSelected.value = true
            const pet = pets.value.find(p => p.id === id)
            return pet ? `Tipo: ${pet.type}` : ''
        }


        // ===================== VENTA =====================
        const finishSale = async () => {
            if (!window.confirm('¿Realizar Venta?')) return

            spinner.value = true
            try {
                const payload = {
                    cliente_id: datosVenta.value.cliente_id,
                    pet_id: datosVenta.value.pet_id,
                    plan_id: datosVenta.value.plan_id,
                    forma_pago: datosVenta.value.forma_pago,
                    metodo_pago: datosVenta.value.metodo_pago,
                    total: total.value,
                    items: itemsVenta.value,
                }

                const res = await axiosInst.post(`${url}api/vender`, payload)

                if (activeImpresion.value) {
                    pdfUrl.value = res.data.ticket_url
                    dialogImp.value = true
                } else {
                    dialogImp.value = false
                    pdfUrl.value = null
                }

                // Reset estado post-venta
                efectivoRecibido.value = ''
                itemsVenta.value = []
                datosVenta.value.forma_pago = '1'
                datosVenta.value.cliente_id = ''
                datosVenta.value.plan_id = ''
                datosVenta.value.pet_id = ''
                saveToLocalStorage()
                clienteFinal(cedula.value)
                snackbarReg.value = true
                cancelPlan()
                codigoBarrasInput?.value?.focus?.()

            } catch (error) {
                regerrormsg.value = error.response.data.message
                snackbarError.value = true
            } finally {
                spinner.value = false
            }
        }


        // ===================== ITEMS =====================
        const deleteItem = (id) => {
            const index = itemsVenta.value.findIndex(item => item.id === id)
            if (index !== -1) {
                itemsVenta.value.splice(index, 1)
                saveToLocalStorage()
            }
            codigoBarrasInput.value.focus()
        }

        const deleteItemAll = () => {
            if (!window.confirm('¿Quitar todos los productos de la lista?')) return
            itemsVenta.value = []
            saveToLocalStorage()
            codigoBarrasInput?.value?.focus?.()
        }


        // ===================== FOCO Y ATAJOS =====================
        const focusSpecificInput = (index) => {
            focusedIndex.value = index
            nextTick(() => {
                const component = inputRefs.value[index]
                if (component) {
                    component.focus()
                    const el = component.$el.querySelector('input')
                    if (el) el.select()
                }
            })
        }

        const ponerFoco = () => {
            codigoBarrasInput.value?.focus()
        }

        let timerInactividad = null

        const resetTimer = () => {
            clearTimeout(timerInactividad)
            timerInactividad = setTimeout(ponerFoco, 10000)
        }

        const handleShortcuts = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'c') {
                e.preventDefault()
                codigoBarrasInput.value.focus()
                return
            }

            if (e.key === 'F2' || e.key === 'F1') {
                e.preventDefault()
                if (itemsVenta.value.length > 0) focusSpecificInput(0)
                return
            }

            if (isDisabled.value) return

            if (e.ctrlKey && e.code === 'F9') {
                e.preventDefault()
                finishSale()
            }
        }


        // ===================== WATCHERS =====================
        watch(nomBuscar, () => {
            if (nomBuscar.value.length >= 3) searchProducto()
        })

        watch(selectedId, (newVal) => {
            if (newVal?.codigo_barras) {
                txtregdata.value.codigo_barras = newVal.codigo_barras.toString().trim()
                if (txtregdata.value.codigo_barras.length > 0) searchCodigo()
            }
        })

        watch(search, () => {
            if (search.value.length >= 3) searchCliente()
        })

        watch(
            () => datosVenta.value.forma_pago,
            (val) => {
                if (val === '2') {
                    datosVenta.value.metodo_pago = null
                    efectivoRecibido.value = 0
                    dialogEdit.value = true
                } else {
                    datosVenta.value.metodo_pago = '10'
                }
            }
        )

        watch(dialogAddclient, async (value) => {
            if (value) {
                await nextTick()
                clientesRef.value?.nuevoCliente?.()
            }
        })


        // ===================== CICLO DE VIDA =====================
        onMounted(() => {
            codigoBarrasInput.value.focus()
            loadStorageList()
            clienteFinal(cedula.value)
            getPlans()
            validarAperturaCaja()

            window.addEventListener('keydown', handleShortcuts)
            window.addEventListener('mousemove', resetTimer)
            window.addEventListener('keydown', resetTimer)
            window.addEventListener('click', resetTimer)
            window.addEventListener('scroll', resetTimer)
            resetTimer()
        })

        onUnmounted(() => {
            window.removeEventListener('mousemove', resetTimer)
            window.removeEventListener('keydown', resetTimer)
            window.removeEventListener('click', resetTimer)
            window.removeEventListener('scroll', resetTimer)
            clearTimeout(timerInactividad)
        })

        onBeforeUnmount(() => {
            window.removeEventListener('keydown', handleShortcuts)
        })

        onBeforeUpdate(() => {
            inputRefs.value = []
        })

</script>


        <style lang="scss">
        .main-pos-container {
            height: 100vh !important;
            max-height: 90vh !important;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .fill-height-custom {
            height: 100%;
        }

        .table-responsive {
            overflow-y: auto;
            overflow-x: hidden;
        }

        .flex-none {
            flex: none;
        }

        .custom-qty :deep(input) {
            text-align: center;
            font-weight: bold;
        }

        .border-primary {
            border-top: 6px solid #1867c0 !important;
        }

        .footer-pago {
            background: white !important;
            position: relative;
            width: 100%;
            z-index: 10;
            flex-shrink: 0;
        }

        .lh-1 {
            line-height: 1.1;
        }

        .tabla-pos :deep(td) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
        }
    </style>