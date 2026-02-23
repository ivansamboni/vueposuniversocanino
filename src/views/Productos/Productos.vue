<template>
    <v-alert color="primary">Gestión de Productos
        Cree, edite precios, stock, impuestos</v-alert>
    <!--modalregistroedicionproductos-->
    <div class="text-center pa-1">
        <v-dialog v-model="dialogEdit" @update:model-value="onDialogToggle" max-width="1200px" persistent>
            <v-card elevation="4" class="rounded-lg">
                <v-toolbar color="primary" density="compact">
                    <v-icon start class="ms-4">mdi-tag-outline</v-icon>
                    <v-toolbar-title>Gestión de Producto</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="dialogEdit = false"><v-icon>mdi-close</v-icon></v-btn>
                </v-toolbar>

                <v-card-text class="pa-6">
                    <v-container>
                        <v-row class="mb-4 align-center bg-grey-lighten-4 rounded-xl pa-2">
                            <v-col cols="12" md="4">
                                <div class="text-subtitle-1 mb-1">Margen de Ganancia Esperado</div>
                                <h3 class="text-success font-weight-bold">
                                    $ {{ parseFloat(txtregdata.ganancia || 0).toLocaleString('es-ES') }}
                                </h3>
                            </v-col>
                            <v-col cols="12" md="8">
                                <v-slider v-model="txtregdata.porcentajeGanancia" :min="0" :max="200" :step="1"
                                    :label="'Porcentaje de utilidad ' + (txtregdata.porcentajeGanancia) + '%'"
                                    thumb-label="always" color="success" @update:model-value="calcularDesdePorcentaje">
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-form ref="form">
                            <v-row>
                                <v-col cols="12" md="6"> <v-text-field v-model="txtregdata.nombre"
                                        label="Nombre del Producto" variant="outlined"
                                        prepend-inner-icon="mdi-tag-outline"
                                        @input="txtregdata.nombre = $event.target.value.toUpperCase()"
                                        clearable></v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="txtregdata.codigo_barras" label="Código de Barras"
                                        variant="outlined" prepend-inner-icon="mdi-barcode-scan"
                                        clearable></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">

                                    <v-combobox v-model="txtregdata.unidad_medida" :items="medidasList"
                                        label="Unidad de Medida" variant="outlined" color="primary"
                                        clearable></v-combobox>
                                </v-col>

                                <v-chip close color="primary">
                                    <v-btn @click="dialogAddmedida = true" icon="mdi mdi-plus"></v-btn>
                                </v-chip>
                            </v-row>

                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="txtregdata.precio_compra" label="Precio Compra (Sin punto ni coma)" prefix="$"
                                        @input="txtregdata.precio_venta = ''; precioventaimpuestos = 0" type="number" v-solo-enteros
                                        variant="outlined" @update:model-value="calcularDesdePorcentaje" clearable>
                                    </v-text-field>

                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="txtregdata.precio_venta" label="Precio Unitario (Base) (Sin punto ni coma)"
                                        prefix="$" type="number" variant="outlined" v-solo-enteros
                                        @update:model-value="calcularDesdeVenta" clearable>
                                    </v-text-field>
                                </v-col>

                                <v-col cols="12" md="3">
                                    <v-autocomplete v-model="txtregdata.proveedor_id" :items="proveedoresList"
                                        item-title="nombreCompleto" item-value="id" label="Proveedor" variant="outlined"
                                        prepend-inner-icon="mdi-truck-delivery-outline" clearable></v-autocomplete>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-autocomplete v-model="txtregdata.categoria_id" :items="categoriasList"
                                        item-title="nombre" item-value="id" label="Categoría" variant="outlined"
                                        prepend-inner-icon="mdi-book-outline" density="compact"
                                        clearable></v-autocomplete>
                                </v-col>
                            </v-row>

                            <v-divider class="my-4"></v-divider>
                            <v-row>
                                <v-col cols="12" md="2">
                                    <v-text-field v-model="txtregdata.stock" label="Stock Inicial" type="number"
                                        :disabled="isStockDisabled" variant="outlined"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-text-field v-model="txtregdata.stock_minimo" label="Alerta Mínimo" type="number"
                                        variant="outlined"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select v-model="txtregdata.iva_id" :items="ivaList" item-title="nombreCompleto"
                                        item-value="id" label="IVA" variant="outlined" density="compact"
                                        @update:model-value="actualizarImpuestos" clearable></v-select>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select v-model="txtregdata.ibua_id" :items="ibuaList" item-title="nombreCompleto"
                                        item-value="id" label="IBUA (Azucarados)" variant="outlined" density="compact"
                                        @update:model-value="actualizarImpuestos" clearable></v-select>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select v-model="txtregdata.ipc_id" :items="ipcList" item-title="nombreCompleto"
                                        item-value="id" label="Impoconsumo" variant="outlined" density="compact"
                                        @update:model-value="actualizarImpuestos" clearable></v-select>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-file-input v-model="txtregdata.img1" label="Foto del producto" variant="outlined"
                                        prepend-icon="" prepend-inner-icon="mdi-camera" accept="image/*"></v-file-input>
                                </v-col>
                                <v-col cols="12" md="5">
                                    <v-textarea v-model="txtregdata.descripcion" label="Descripción Larga"
                                        variant="outlined" rows="2" auto-grow clearable=""></v-textarea>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-autocomplete v-model="txtregdata.marca_id" :items="marcasList"
                                        item-title="nombre" item-value="id" label="Marca" variant="outlined"
                                        prepend-inner-icon="mdi-book-outline" density="compact"
                                        clearable></v-autocomplete>
                                </v-col>
                            </v-row>
                        </v-form>

                        <v-card variant="outlined" color="grey-lighten-3" class="mt-4 overflow-hidden">
                            <v-table density="compact" class="bg-grey-lighten-4 rounded-lg">
                                <thead>
                                    <tr>
                                        <th>Precio Unitario</th>
                                        <th>Impuestos</th>
                                        <th class="text-end">Precio Final al Público</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${{ txtregdata.precio_venta_ajustado }}</td>
                                        <td>${{ (precioventaimpuestos - txtregdata.precio_venta_ajustado).toFixed(2) }}
                                        </td>
                                        <td class="text-h6 font-weight-bold text-end">
                                            ${{ precioventaimpuestos.toLocaleString('es-ES') }}
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-card>
                    </v-container>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" color="grey-darken-1"
                        @click="nuevoProducto(), getProductos(), dialogEdit = false" class="px-6">
                        Cancelar
                    </v-btn>

                    <v-btn v-if="editando" color="primary" variant="elevated" prepend-icon="mdi-plus"
                        @click="register()" class="px-8">
                        Registrar Producto
                    </v-btn>

                    <v-btn v-else color="success" variant="elevated" prepend-icon="mdi-content-save-edit"
                        @click="updateProducto" class="px-8">
                        Guardar Cambios
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>


    <v-dialog v-model="dialogAddmedida" max-width="auto">
        <v-card>
            <v-card-actions class="justify-end">
                <v-btn text="X Cerrar" color="primary" @click="dialogAddmedida = false"></v-btn>
            </v-card-actions>
            <v-container>
                <UnidadesMedida ref="medidasRef" />
            </v-container>
        </v-card>
    </v-dialog>
    <v-card elevation="2" class="pa-4 mb-4 rounded-lg">
        <v-form @submit.prevent="searchCodigo()" class="logprimaryrm">
            <v-row align="center" no-gutters>

                <v-col cols="12" sm="5" md="2" class="px-2">
                    <v-text-field ref="codigoBarrasInput" v-model="txtregdata.codigo_barras" variant="underlined"
                        color="primary" label="Código de barras" hide-details clearable>
                        <template v-slot:prepend-inner>
                            <v-icon icon="mdi-barcode-scan" style="cursor: pointer" @click="searchCodigo()" />
                        </template>
                    </v-text-field>
                </v-col>

                <v-col cols="12" sm="6" md="3" class="px-2">
                    <v-combobox v-model="selectedId" :items="productResults" item-title="nombre"
                        item-value="codigo_barras" variant="underlined" v-model:search="nomBuscar"
                        label="Nombre del producto" prepend-inner-icon="mdi-magnify" hide-details clearable />
                </v-col>

                <v-col cols="12" sm="6" md="2" class="px-2">
                    <v-autocomplete v-model="filters.categoria_id" :items="categoriasList" item-title="nombre"
                        item-value="id" variant="underlined" label="Categoría" hide-details clearable />
                </v-col>

                <v-col cols="12" sm="6" md="2" class="px-2">
                    <v-autocomplete v-model="filters.proveedor_id" :items="proveedoresList" item-title="nombreCompleto"
                        item-value="id" variant="underlined" label="Proveedor" hide-details clearable />
                </v-col>

                <v-col cols="12" sm="6" md="1" class="px-2">
                    <v-autocomplete v-model="filters.marca_id" :items="marcasList" item-title="nombre" item-value="id"
                        variant="underlined" label="Marca" hide-details clearable />
                </v-col>
                <v-col cols="12" md="2" class="d-flex justify-end align-center mt-4 mt-md-0">

                    <v-divider vertical inset class="mx-2 d-none d-sm-flex"></v-divider>

                    <v-btn icon="mdi-reload" variant="text" color="grey-darken-1" title="Recargar"
                        @click="reload()"></v-btn>

                    <v-menu location="bottom end">
                        <template #activator="{ props }">
                            <v-btn icon="mdi-dots-vertical" variant="text" color="grey-darken-1" v-bind="props"></v-btn>
                        </template>
                        <v-list density="compact" class="py-0">
                            <v-list-item @click="exportCSV()" prepend-icon="mdi-tray-arrow-down">
                                <v-list-item-title>Exportar CSV</v-list-item-title>
                            </v-list-item>

                        </v-list>
                    </v-menu>
                </v-col>

                <button type="submit" class="d-none"></button>
            </v-row>
        </v-form>
    </v-card>

    <!-- TOTAL DE PRODUCTOS -->
    
    <v-btn color="primary" variant="flat" class="me-2" prepend-icon="mdi-plus" @click="nuevoProducto()">
        Nuevo
    </v-btn>
    <v-chip color="primary">{{ totalProductos }} Productos</v-chip>
    <!-- TABLA DE PRODUCTOS -->
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>U/M</th>
                    <th>Proveedor</th>
                    <th>IVA</th>
                    <th>Precio final</th>
                    <th>Ganancias</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <!-- DIALOGO DE IMAGEN -->
            <v-dialog v-model="dialog2" max-width="400">
                <v-card>
                    <v-card-text class="d-flex justify-center">
                        <img :src="imgview ? url + 'archivos/folder_img_product/' + imgview : url + 'archivos/folder_img_product/sinimagen.png'"
                            width="400" height="400" alt="Imagen del producto" />
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn color="dark" @click="dialog2 = false">X Cerrar</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <tbody>
                <!-- CARGANDO -->
                <tr v-show="trLoading">
                    <td colspan="11">
                        <v-skeleton-loader type="article" class="mx-2" v-for="n in 11" :key="n" />
                    </td>
                </tr>

                <!-- LISTADO DE PRODUCTOS -->
                <tr v-for="pro in productosList" :key="pro.id">
                    <td>
                        <a class="clickable-element" @click="dialog2 = true; imgview = pro.img1">
                            <img :src="pro.img1 ? url + 'archivos/folder_img_product/' + pro.img1 : url + 'archivos/folder_img_product/sinimagen.png'"
                                width="40" height="40" />
                        </a>
                    </td>
                    <td><small>{{ pro.codigo_barras }}</small></td>
                    <td><small>
                            {{ pro.nombre }}
                            <v-chip color="primary" size="x-small" class="ma-2"> <small>{{ pro.categoria?.nombre || ''
                                    }}</small></v-chip>
                        </small></td>
                    <td><small>{{ pro.unidad_medida }}</small></td>
                    <td><small>{{ pro.proveedor?.nombres || '' }}</small></td>
                    <td><small>{{ pro.iva ? parseFloat(pro.iva.valor).toLocaleString('es-ES') + '%' : '0%' }}</small>
                    </td>
                    <td><small>{{ parseFloat(pro.precio_final).toLocaleString('es-ES') }}</small></td>
                    <td><small>{{ parseFloat(pro.ganancia).toLocaleString('es-ES') }}</small></td>
                    <td><small>{{ pro.stock }}</small></td>
                    <td>
                        <v-btn color="dark" icon="mdi mdi-square-edit-outline" title="Editar"
                            @click="selecProducto(pro.id); dialogEdit = true" />
                        <v-btn color="dark" icon="mdi mdi-delete-forever" title="Eliminar"
                            @click="deleteProducto(pro.id)" />
                    </td>
                </tr>

                <!-- RESULTADO INDIVIDUAL -->
                <tr v-show="resultTable">
                    <td>
                        <a class="clickable-element" @click="dialog2 = true; imgview = txtregdata.img1">
                            <img :src="txtregdata.img1 ? url + 'archivos/folder_img_product/' + txtregdata.img1 : url + 'archivos/folder_img_product/sinimagen.png'"
                                width="40" height="40" />
                        </a>
                    </td>
                    <td><small>{{ txtregdata.codigo_barras }}</small></td>
                    <td><small>{{ txtregdata.nombre }}</small></td>

                    <td><small>{{ txtregdata.unidad_medida }}</small></td>
                    <td><small>{{ txtregdata.proveedor_id || '' }}</small></td>
                    <td><small>iva</small></td>
                    <td><small>{{ parseFloat(txtregdata.precio_final).toLocaleString('es-ES') }}</small></td>
                    <td><small>{{ parseFloat(txtregdata.ganancia).toLocaleString('es-ES') }}</small></td>
                    <td><small>{{ txtregdata.stock }}</small></td>
                    <td>
                        <v-btn color="dark" icon="mdi mdi-square-edit-outline" title="Editar"
                            @click="selecProducto(txtregdata.id); dialogEdit = true" />
                        <v-btn color="dark" icon="mdi mdi-delete-forever" title="Eliminar"
                            @click="deleteProducto(txtregdata.id)" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <br />
    <v-pagination v-model="currentPage" :length="lastPage" :total-visible="10" @update:modelValue="getProductos" />

    <!-- PAGINACIÓN -->


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
import { ref, onMounted, watch, nextTick } from 'vue'
import axiosInst from '@/components/axiosins'
import UnidadesMedida from '../configurar/UnidadesMedida.vue'
const url = import.meta.env.VITE_APP_API_URL

const precioventaimpuestos = ref(0)
const txtregdata = ref({
    id: '', nombre: '', unidad_medida: '', descripcion: '',
    categoria_id: '', precio_venta: 0, precio_compra: 0,
    precio_final: 0, porcentajeGanancia: 0, ganancia: 0,
    iva_id: null, ibua_id: null, ipc_id: null,
    stock: 0, stock_minimo: 0, proveedor_id: '',
    codigo_barras: '', img1: '', precio_venta_ajustado: 0
})
const archivo = ref(null)
const mensaje = ref('')
const ImpuestosList = ref([]);
const ivaList = ref([]);
const ibuaList = ref([]);
const ipcList = ref([]);
const totalProductos = ref('');
const isStockDisabled = ref(true);
const resultTable = ref(false)
const trLoading = ref(true)
const dialogAddmedida = ref(false)
const medidasRef = ref(null)
const nomBuscar = ref('')
const selectedId = ref('')
const codigoBarrasInput = ref(null);
const productResults = ref([])
const productoEncontrado = ref([])
const marcasList = ref([])
const medidasList = ref([])
const proveedoresList = ref([])
const categoriasList = ref([])
const productosList = ref([])
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(10)


const nombreRules = ref([(v) => !!v || 'El campo es requerido'])
const dialog2 = ref(false)
const imgview = ref('')
const snackbarReg = ref(false)
const snackbarUpd = ref(false)
const timeout = 4000
const dialogEdit = ref(false)
const editando = ref(false);
const regerrormsg = ref('')
const regsuccessmsg = ref('')
const upderrormsg = ref('')
const updsuccessmsg = ref('')
const filters = ref({
    categoria_id: null,
    proveedor_id: null,
});


function handleFileChange(event) {
    archivo.value = event.target.files[0]
}

async function importarArchivo() {
    if (!archivo.value) {
        mensaje.value = 'Selecciona un archivo.'
        return
    }

    const formData = new FormData()
    formData.append('archivo', archivo.value)

    try {
        const response = await axiosInst.post(url + 'api/importproductoexcel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        console.log(response)
        mensaje.value = response.data.message || 'Importación exitosa'
    } catch (error) {
        console.error(error)
        if (error.response && error.response.data.errors) {
            mensaje.value = Object.values(error.response.data.errors).flat().join(', ')
        } else {
            mensaje.value = 'Error al importar el archivo'
        }
    }
}

const nuevoProducto = () => {
    editando.value = true;
    dialogEdit.value = true
    txtregdata.value.id = ''
    txtregdata.value.nombre = ''
    txtregdata.value.unidad_medida = '',
        txtregdata.value.cantidad = ''
    txtregdata.value.descripcion = ''
    txtregdata.value.marca_id = ''
    txtregdata.value.categoria_id = ''
    txtregdata.value.precio_venta = ''
    txtregdata.value.precio_compra = ''
    txtregdata.value.precio_final = '',
        txtregdata.value.porcentajeGanancia = '',
        txtregdata.value.ganancia = ''
    txtregdata.value.stock = ''
    txtregdata.value.stock_minimo = ''
    txtregdata.value.iva_id = ''
    txtregdata.value.ibua_id = ''
    txtregdata.value.ipc_id = ''
    txtregdata.value.proveedor_id = ''
    txtregdata.value.img1 = ''
    precioventaimpuestos.value = ''
    isStockDisabled.value = false
    precioventaimpuestos.value = ''
    txtregdata.value.precio_venta_ajustado = ''
}

const register = async () => {
    const formData = new FormData();
    formData.append('nombre', txtregdata.value.nombre);
    formData.append('cantidad', txtregdata.value.cantidad);
    formData.append('unidad_medida', txtregdata.value.unidad_medida);
    formData.append('descripcion', txtregdata.value.descripcion);
    formData.append('marca_id', txtregdata.value.marca_id ?? '');
    formData.append('categoria_id', txtregdata.value.categoria_id ?? '');
    formData.append('precio_venta', txtregdata.value.precio_venta_ajustado);
    formData.append('precio_compra', txtregdata.value.precio_compra);
    formData.append('precio_final', txtregdata.value.precio_final = precioventaimpuestos.value);
    formData.append('ganancia', txtregdata.value.ganancia);
    formData.append('iva_id', txtregdata.value.iva_id ?? '');
    formData.append('ibua_id', txtregdata.value.ibua_id ?? '');
    formData.append('ipc_id', txtregdata.value.ipc_id ?? '');
    formData.append('stock', txtregdata.value.stock);
    formData.append('stock_minimo', txtregdata.value.stock_minimo);
    formData.append('proveedor_id', txtregdata.value.proveedor_id ?? '');
    formData.append('codigo_barras', txtregdata.value.codigo_barras);

    if (txtregdata.value.img1) formData.append('img1', txtregdata.value.img1);

    try {
        const res = await axiosInst.post(url + 'api/productos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        regsuccessmsg.value = 'Registro éxitoso'
        regerrormsg.value = ''
        dialogEdit.value = false
        for (const key in txtregdata.value) {
            txtregdata.value[key] = '';
        }
        getProductos()
    } catch (error) {
        regsuccessmsg.value = ''
        regerrormsg.value = error.response.data.message

    }
    snackbarReg.value = true
    editando.value = true;
}

const getProductos = async (page = 1) => {
    try {
        const res = await axiosInst.get(url + `api/productos`, {
            params: {
                page,
                ...filters.value,
            },
        });
        trLoading.value = false
        productosList.value = res.data.productos.data
        totalProductos.value = res.data.total
        resultTable.value = false
        currentPage.value = res.data.productos.current_page;
        lastPage.value = res.data.productos.last_page;
        perPage.value = res.data.productos.per_page;
        window.scrollTo({
            top: 0,
            behavior: "smooth", // Agrega un efecto suave
        });
    } catch (error) {

    }
};

const dataMarcas = async () => {
    const res = await axiosInst.get(url + "api/marcaslist")
    marcasList.value = res.data

}
const dataProveedores = async () => {
    const res = await axiosInst.get(url + "api/proveedoreslist");

    proveedoresList.value = res.data.map(proveedor => ({
        id: proveedor.id,
        nombreCompleto: `${proveedor.nombres} ${proveedor.apellidos || ''}`.trim()
    }));
};
const dataCategorias = async () => {
    const res = await axiosInst.get(url + "api/categoriaslist")
    categoriasList.value = res.data
}

const selecProducto = async (id) => {
    editando.value = false;
    isStockDisabled.value = true;
    try {
        const res = await axiosInst.get(url + 'api/productos/' + id);

        // 1. Cargamos los datos en el modelo
        txtregdata.value = res.data;

        // 2. Calculamos el porcentaje de ganancia basado en lo que viene de la DB
        const compra = parseFloat(txtregdata.value.precio_compra) || 0;
        const venta = parseFloat(txtregdata.value.precio_venta) || 0;

        if (compra > 0) {
            // Calculamos el porcentaje: ((Venta - Compra) / Compra) * 100
            const porcentajeCalculado = ((venta - compra) / compra) * 100;

            // Asignamos al slider (redondeado para que el slider no tenga decimales infinitos)
            txtregdata.value.porcentajeGanancia = Math.round(porcentajeCalculado);
        } else {
            txtregdata.value.porcentajeGanancia = 0;
        }

        // 3. Recalculamos impuestos para la tabla visual
        actualizarImpuestos();

        dialogEdit.value = true;
    } catch (err) {
        console.error(err);
        alert("Error al cargar el producto");
    }
};

const updateProducto = async () => {
    const formData = new FormData();
    formData.append('id', txtregdata.value.id)
    formData.append('img1', txtregdata.value.img1)

    try {
        txtregdata.value.precio_venta = parseFloat(txtregdata.value.precio_venta_ajustado) || 0;
        //txtregdata.value.precio_final = precioventaimpuestos.value
        const res = await axiosInst.put(url + 'api/productos/' + txtregdata.value.id, txtregdata.value)
        const resimg = await axiosInst.post(url + 'api/productos-loadimg', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        regsuccessmsg.value = 'Se actualizó con éxito'
        regerrormsg.value = ''
        for (const key in txtregdata.value) {
            txtregdata.value[key] = '';
        }
        dialogEdit.value = false
        getProductos()
    } catch (error) {
        regsuccessmsg.value = ''
        regerrormsg.value = error.response.data.message
    }
    snackbarReg.value = true
};

const deleteProducto = async (id) => {
    let confirmac = confirm('Eliminar este producto?')
    if (confirmac) {
        try {
            const res = await axiosInst.delete(url + 'api/productos/' + id)

            getProductos()
        } catch (error) {
            alert('Producto ya está vinculado a una venta no se puede eliminar')
        }
    }
}

const searchProducto = async () => {

    try {
        const res = await axiosInst.get(url + 'api/searchnomproducto/' + nomBuscar.value)
        productResults.value = res.data.map(producto => ({
            codigo_barras: producto.codigo_barras,
            nombre: producto.nombre + ' $ ' + producto.precio_final
        }));


    } catch (error) {

    }
}

const searchCodigo = async () => {
    try {
        const res = await axiosInst.get(url + 'api/searchcodigoproducto/' + txtregdata.value.codigo_barras);
        resultTable.value = true
        txtregdata.value = res.data
        productosList.value = []
        selectedId.value = ''
        productResults.value = ''


    } catch (error) {
        console.error("Error en la búsqueda de código:", error); // Imprime el error en la consola para depuración

        let confirmac = confirm('Este producto no existe ¿desea agregarlo?')
        if (confirmac) {
            nuevoProducto()
            txtregdata.value.nombre.focus()
        }

    }

}

const datosNegocio = async () => {
    const res = await axiosInst.get(url + 'api/settings')

};

const getImpuestos = async () => {
    try {
        const res = await axiosInst.get(url + "api/impuestos");

        // Mapeamos los impuestos con id, nombre, valor y nombreCompleto
        ImpuestosList.value = res.data.map(impuesto => ({
            id: impuesto.id,
            nombre: impuesto.nombre,
            valor: impuesto.valor,
            nombreCompleto: `${impuesto.nombre} ${impuesto.valor || ""}`.trim(),
        }));

        // Filtrar impuestos y mantener id, valor y nombreCompleto
        ivaList.value = ImpuestosList.value
            .filter(impuesto => impuesto.nombre.toLowerCase().includes("iva"))
            .map(impuesto => ({ id: impuesto.id, nombreCompleto: impuesto.nombreCompleto, valor: impuesto.valor }));

        ibuaList.value = ImpuestosList.value
            .filter(impuesto => impuesto.nombre.toLowerCase().includes("ibua"))
            .map(impuesto => ({ id: impuesto.id, nombreCompleto: impuesto.nombreCompleto, valor: impuesto.valor }));

        ipcList.value = ImpuestosList.value
            .filter(impuesto => impuesto.nombre.toLowerCase().includes("impoconsumo"))
            .map(impuesto => ({ id: impuesto.id, nombreCompleto: impuesto.nombreCompleto, valor: impuesto.valor }));

    } catch (error) {
        console.error("Error al obtener los impuestos:", error);
    }
};



const reload = () => {
    getProductos()
    txtregdata.value.codigo_barras = ''
    codigoBarrasInput.value.focus()
}

const getMedidas = async () => {
    try {
        const res = await axiosInst.get(url + 'api/unidadmedidas')
        medidasList.value = res.data.map(item => item.nombre);
    } catch (error) {

    }
};

onMounted(() => {
    dataCategorias(), getProductos(), dataProveedores(), dataMarcas()
    datosNegocio(), getImpuestos(), getMedidas()

})

// --- LÓGICA DE CÁLCULOS (CORRECCIÓN DE FALLAS) ---

const redondearPrecio = (precio) => {
    if (precio < 100) return parseFloat(precio.toFixed(2));
    return Math.round(precio / 50) * 50;
};


// Cálculo cuando cambia Compra o %
const calcularDesdePorcentaje = () => {
    const compra = parseFloat(txtregdata.value.precio_compra) || 0;
    const margen = parseFloat(txtregdata.value.porcentajeGanancia) || 0;

    // Si el precio de compra es 0 o está vacío, limpiamos la venta para que no estorbe
    if (compra <= 0) {
        txtregdata.value.precio_venta = '';
        precioventaimpuestos.value = 0;
        return;
    }

    // Calculamos solo si hay una base de compra
    const ventaSugerida = compra * (1 + (margen / 100));
    txtregdata.value.precio_venta = parseFloat(ventaSugerida.toFixed(2));
    actualizarImpuestos();
};

// Cálculo cuando el usuario digita la Venta Base manualmente
const calcularDesdeVenta = () => {
    const compra = parseFloat(txtregdata.value.precio_compra) || 0;
    const venta = parseFloat(txtregdata.value.precio_venta) || 0;

    if (compra > 0) {
        const nuevoPorcentaje = ((venta - compra) / compra) * 100;
        txtregdata.value.porcentajeGanancia = Math.round(nuevoPorcentaje);
        actualizarImpuestos();
    }
};

// Cálculo Final de Impuestos y Redondeo
const actualizarImpuestos = () => {
    const ventaBase = parseFloat(txtregdata.value.precio_venta) || 0;
    const compra = parseFloat(txtregdata.value.precio_compra) || 0;

    const getP = (id, lista) => {
        const item = lista.find(i => Number(i.id) === Number(id));
        return (item ? parseFloat(item.valor) : 0) / 100;
    };

    const pIva = getP(txtregdata.value.iva_id, ivaList.value);
    const pIbua = getP(txtregdata.value.ibua_id, ibuaList.value);
    const pIpc = getP(txtregdata.value.ipc_id, ipcList.value);

    const totalImpuestosP = pIva + pIbua + pIpc;
    const precioConImpuestos = ventaBase * (1 + totalImpuestosP);

    // Aplicar redondeo al PVP Final
    const finalRedondeado = redondearPrecio(precioConImpuestos);
    precioventaimpuestos.value = finalRedondeado;

    // Recalcular hacia atrás el precio base neto tras el redondeo
    const nuevoPrecioBaseNeto = finalRedondeado / (1 + totalImpuestosP);
    txtregdata.value.precio_venta_ajustado = nuevoPrecioBaseNeto.toFixed(2);

    // Ganancia real basada en el precio ajustado
    txtregdata.value.ganancia = (nuevoPrecioBaseNeto - compra).toFixed(2);

    // Guardar para el envío al servidor
    txtregdata.value.precio_final = finalRedondeado;
};





watch(nomBuscar, () => {
    if (nomBuscar.value.length >= 4) {
        searchProducto();
    }
});

watch(selectedId, (newVal) => {
    if (newVal) {
        txtregdata.value.codigo_barras = newVal.codigo_barras;
        if (txtregdata.value.codigo_barras >= 1) {
            searchCodigo();

        }
    }

});



watch(dialogAddmedida, async (value) => {
    if (value) {
        await nextTick(); // Esperar a que el DOM se actualice completamente
        if (medidasRef.value?.nuevaUnidad) {
            medidasRef.value.nuevaUnidad();
        }
    }
});

watch(dialogAddmedida, (value) => {
    if (!value) {
        getMedidas();
    }
});

watch([filters], getProductos, { deep: true });

</script>
<style lang="scss">
.registerBox {
    max-width: 1000px;
    margin: 0 auto;
}

.clickable-element {
    cursor: pointer;
}
</style>