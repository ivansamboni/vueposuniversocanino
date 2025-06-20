<template>
    <v-alert text="Cree Productos, edite precios, stock, impuestos " title="Creación de Productos" type="info"
        icon="mdi-shape"></v-alert>
    <!--modalregistroedicionproductos-->
    <div class="text-center pa-1">
        <v-dialog v-model="dialogEdit" @update:model-value="onDialogToggle">
            <v-card>
                <v-container>
                    <v-row>
                        <!-- Sección Izquierda: Formulario -->
                        <v-col cols="12" md="12">
                            <v-container>
                                <v-alert title="Registro de Productos" type="info" icon="mdi-shape"></v-alert>
                                <br>
                                <v-row>
                                    <v-col cols="12" md="3">
                                        <h4 class="text-success">Margen de Ganancia: ${{ txtregdata.ganancia }}</h4>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-slider v-model="txtregdata.porcentajeGanancia" :min="1" :max="100" step="1"
                                            :label="'Porcentaje de Ganancia ' + (txtregdata.porcentajeGanancia) + ' %'"
                                            color="primary" tick-size="4"></v-slider>
                                    </v-col>
                                </v-row>
                                <v-form>
                                    <v-row>
                                        <v-col cols="12" md="3">
                                            <v-textarea v-model="txtregdata.nombre" label="Producto" row-height="20"
                                                rows="1" variant="outlined" auto-grow shaped color="info"
                                                @input="txtregdata.nombre = $event.target.value.toUpperCase()"
                                                clearable></v-textarea>
                                        </v-col>
                                        <v-col cols="12" md="1">
                                            <v-text-field v-model="txtregdata.cantidad" required type="number"
                                                hide-details="auto" variant="underlined" color="info" label="Cantidad"
                                                clearable></v-text-field>
                                        </v-col>

                                        <v-col cols="12" md="2">
                                            <v-combobox v-model="txtregdata.unidad_medida" :items="medidasList"
                                                label="Selecciona" variant="outlined" color="info"
                                                clearable></v-combobox>
                                        </v-col>
                                        <v-col cols="12" md="2">
                                            <v-chip close color="primary">
                                                <v-btn @click="dialogAddmedida = true" icon="mdi mdi-plus"
                                                    density="compact"></v-btn>Unidad/Medida
                                            </v-chip>
                                        </v-col>
                                        <v-col cols="12" md="2">
                                            <v-text-field v-model="txtregdata.precio_compra" required type="number"
                                                hide-details="auto" variant="underlined" color="info"
                                                label="Precio de compra" clearable></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="2">
                                            <v-text-field label="Precio unitario" v-model="txtregdata.precio_venta"
                                                type="number" hide-details="auto" variant="underlined" color="info" clearable/>
                                            <v-text-field v-model="txtregdata.precio_venta_ajustado" 
                                                type="number" hidden></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12" md="2">
                                            <v-text-field v-model="txtregdata.stock" required
                                                :disabled="isStockDisabled" type="number" hide-details="auto"
                                                variant="underlined" color="info" label="Stock Inicial"
                                                clearable></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="2">
                                            <v-text-field type="number" v-model="txtregdata.stock_minimo" required
                                                hide-details="auto" variant="underlined" color="info"
                                                label="Stock Mínimo" clearable></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="2">
                                            <v-select v-model="txtregdata.iva_id" :items="ivaList"
                                                item-title="nombreCompleto" hide-details="auto" variant="underlined"
                                                color="info" item-value="id" label="IVA %" clearable></v-select>
                                        </v-col>
                                        <v-col cols="12" md="2">
                                            <v-select v-model="txtregdata.ibua_id" :items="ibuaList"
                                                item-title="nombreCompleto" item-value="id" label="IBUA %"
                                                hide-details="auto" variant="underlined" color="info"
                                                clearable></v-select> </v-col>
                                        <v-col cols="12" md="2">
                                            <v-select v-model="txtregdata.ipc_id" :items="ipcList"
                                                item-title="nombreCompleto" hide-details="auto" variant="underlined"
                                                color="info" item-value="id" label="IMPOCONSUMO %" clearable></v-select>
                                        </v-col>
                                    </v-row>
                                    <br>
                                    <v-row>
                                        <v-col cols="12" md="3">
                                            <v-autocomplete v-model="txtregdata.categoria_id" :items="categoriasList"
                                                item-title="nombre" item-value="id" variant="underlined" color="info"
                                                label="Categoría" clearable></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" md="3">
                                            <v-autocomplete v-model="txtregdata.proveedor_id" :items="proveedoresList"
                                                item-title="nombreCompleto" item-value="id" variant="underlined"
                                                color="info" label="Proveedor" clearable></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" md="2">
                                            <v-autocomplete v-model="txtregdata.marca_id" :items="marcasList"
                                                item-title="nombre" item-value="id" variant="underlined" color="info"
                                                label="Marca" clearable></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" md="2">
                                            <v-text-field v-model="txtregdata.codigo_barras" hide-details="auto"
                                                variant="underlined" color="info" label="Código de Barras"
                                                clearable></v-text-field>
                                            <v-btn color="primary" size="small" @click="activarEscaner">
                                                Escanear Código
                                            </v-btn>
                                            <div v-show="mostrarEscaner" id="reader"
                                                style="width: 100%; margin-top: 10px;"></div>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12" md="3">
                                            <v-file-input v-model="txtregdata.img1" prepend-icon="mdi-camera"
                                                label="Imagen del Producto" clearable></v-file-input>
                                        </v-col>
                                        <v-col cols="12" md="8">
                                            <v-textarea v-model="txtregdata.descripcion" label="Descripción"
                                                row-height="10" rows="2" variant="outlined" auto-grow shaped
                                                color="info" clearable></v-textarea>
                                        </v-col>
                                    </v-row>
                                </v-form>

                                <v-dialog v-model="dialogAddmedida" max-width="auto">
                                    <v-card>
                                        <v-card-actions class="justify-end">
                                            <v-btn text="X Cerrar" color="primary"
                                                @click="dialogAddmedida = false"></v-btn>
                                        </v-card-actions>
                                        <v-container>
                                            <UnidadesMedida ref="medidasRef" />
                                        </v-container>
                                    </v-card>
                                </v-dialog>

                                <v-divider></v-divider><br>
                                <h4 class="text-center">Factura Final</h4>
                                <br>
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>PRODUCTO</th>
                                            <th>PRECIO UNITARIO</th>
                                            <th>IVA %</th>
                                            <th>IBUA %</th>
                                            <th>IMPOCONSUMO %</th>
                                            <th>PRECIO FINAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{ txtregdata.nombre }}</td>
                                            <td>$ {{ parseFloat(txtregdata.precio_venta).toLocaleString('es-ES')
                                            }}</td>
                                            <td>{{ getImpuestoValor(txtregdata.iva_id, ivaList) }}</td>
                                            <td>{{ getImpuestoValor(txtregdata.ibua_id, ibuaList) }}</td>
                                            <td>{{ getImpuestoValor(txtregdata.ipc_id, ipcList) }}</td>
                                            <td>$ {{ parseFloat(precioventaimpuestos).toLocaleString('es-ES') }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </v-container>
                        </v-col>
                    </v-row>
                </v-container>
                <v-card-actions>
                    <v-btn class="ms-auto" text="Cerrar"
                        @click="nuevoProducto(), getProductos(), dialogEdit = false"></v-btn>
                    <v-btn @click="register()" v-if="editando" color="success">
                        <i class="bi bi-person-plus-fill"></i> Agregar
                    </v-btn>
                    <v-btn v-if="!editando" color="success" @click="updateProducto">Actualizar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>

    <v-card max-width="auto" class="text-center pa-4">
        <v-form @submit.prevent="searchCodigo()" class="mt-1 loginForm">
            <v-row>
                <v-col cols="12" md="2">
                    <v-text-field ref="codigoBarrasInput" v-model="txtregdata.codigo_barras" hide-details="auto"
                        variant="underlined" color="info" label="Codigo" clearable></v-text-field><br>
                    <v-btn color="primary" size="small" @click="activarEscaner">
                        Escanear Código
                    </v-btn>
                    <div v-show="mostrarEscaner" id="reader" style="width: 100%; margin-top: 10px;"></div>
                </v-col>
                <v-col cols="12" md="1">
                    <v-btn size="small" @click="searchCodigo()">
                        <span class="mdi mdi-magnify"></span>
                    </v-btn>
                    <br>

                </v-col>
                <v-col cols="12" md="5">
                    <v-combobox v-model="selectedId" :items="productResults" item-title="nombre"
                        item-value="codigo_barras" variant="underlined" v-model:search="nomBuscar" label="Buscar"
                        hide-details="auto" clearable></v-combobox>
                </v-col>
                <v-col cols="12" md="1">
                    <v-btn color="success" hidden type="submit">Buscar</v-btn>
                </v-col>
                <v-col cols="12" md="1">
                    <v-btn @click="nuevoProducto()" icon="mdi mdi-plus" density="default" title="Recargar"></v-btn>
                </v-col>
                <v-col cols="12" md="1">
                    <v-btn @click="reload()" icon="mdi mdi-reload" density="default" title="Nuevo producto">
                    </v-btn>
                </v-col>
                <v-col cols="12" md="1">
                    <v-menu>
                        <template #activator="{ props }">
                            <v-btn color="dark" v-bind="props">
                                <span class="mdi mdi-menu"></span>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item>
                                <v-btn @click="reload()"><span class="mdi mdi-tray-arrow-down"></span> Exportar
                                    CSV</v-btn>
                            </v-list-item>
                            <v-list-item>

                            </v-list-item>

                        </v-list>
                    </v-menu>
                    <!-- <form @submit.prevent="importarArchivo">
                        <input type="file" @change="handleFileChange" accept=".csv,.xlsx" />
                        <v-btn type="submit">Importar</v-btn>
                        <p v-if="mensaje">{{ mensaje }}</p>
                    </form>-->
                </v-col>
            </v-row>
        </v-form>
        <br>
    </v-card>

    <v-alert color="info">
        <h5>{{ totalProductos }} Productos</h5>
    </v-alert>
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th class="text-left">
                        Imagen
                    </th>
                    <th class="text-left">
                        Código
                    </th>
                    <th class="text-left">
                        Producto
                    </th>
                    <th class="text-left">
                        Cantidad
                    </th>
                    <th class="text-left">
                        U/M
                    </th>

                    <th class="text-left">
                        Proveedor
                    </th>
                    <th class="text-left">
                        Iva
                    </th>
                    <th class="text-left">
                        Precio final
                    </th>
                    <th class="text-left">
                        Ganancia sin impuestos
                    </th>

                    <th class="text-left">
                        Stock
                    </th>
                    <th class="text-left">
                        Acciones
                    </th>
                </tr>
            </thead>
            <div class="text-center pa-4">
                <v-dialog v-model="dialog2" max-width="400">
                    <v-card>
                        <v-card-text class="d-flex justify-center">
                            <img :src="imgview ? url + 'archivos/folder_img_product/' + imgview : url + 'archivos/folder_img_product/sinimagen.png'"
                                width="200" height="200" alt="Imagen del producto" />
                        </v-card-text>

                        <v-card-actions class="justify-end">
                            <v-btn color="dark" @click="dialog2 = false">X Cerrar</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </div>

            <tbody>
                <tr v-show="trLoading">
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                    <td><v-skeleton-loader type="article"></v-skeleton-loader></td>
                </tr>
                <tr v-for="pro in productosList" :key="pro.id">
                    <td><a class="clickable-element" @click="dialog2 = true, imgview = pro.img1"><img
                                :src="pro.img1 ? url + 'archivos/folder_img_product/' + pro.img1 : url + 'archivos/folder_img_product/sinimagen.png'"
                                width="80" height="80" /></a></td>
                    <td><small>{{ pro.codigo_barras }}</small></td>
                    <td><small>{{ pro.nombre }}</small></td>
                    <td><small>{{ pro.cantidad }}</small></td>
                    <td><small>{{ pro.unidad_medida }}</small></td>

                    <td><small>{{ pro.proveedor?.nombres || '' }}</small></td>
                    <td><small>{{ pro.iva ? parseFloat(pro.iva.valor).toLocaleString('es-ES') + '%' : '0'
                    }}</small></td>
                    <td><small>{{ parseFloat(pro.precio_final).toLocaleString('es-ES') }}</small></td>
                    <td><small>{{ parseFloat(pro.ganancia).toLocaleString('es-ES') }}</small></td>
                    <td><small>{{ pro.stock }}</small></td>
                    <!--<td><small>{{ pro.proveedor?.nombres || '' }}</small></td>-->
                    <td><small>
                            <v-btn color="dark" v-bind="activatorProps" density="comfortable"
                                icon="mdi mdi-square-edit-outline" title="Editar"
                                @click="selecProducto(pro.id), dialogEdit = true"></v-btn>
                            <v-btn color="dark" @click="deleteProducto(pro.id)" density="comfortable"
                                icon="mdi mdi-delete-forever" title="Eliminar"></v-btn>
                        </small></td>
                </tr>
                <tr v-show="resultTable">
                    <td><small><a class="clickable-element" @click="dialog2 = true, imgview = txtregdata.img1"><img
                                    :src="txtregdata.img1 ? url + 'archivos/folder_img_product/' + txtregdata.img1 : url + 'archivos/folder_img_product/sinimagen.png'"
                                    width="80" height="80" /></a></small></td>
                    <td><small>{{ txtregdata.codigo_barras }}</small></td>
                    <td><small>{{ txtregdata.nombre }}</small></td>
                    <td><small>{{ txtregdata.cantidad }}</small></td>
                    <td><small>{{ txtregdata.unidad_medida }}</small></td>
                    <td><small>{{ txtregdata.proveedor_id || '' }}</small></td>
                    <td><small>{{ txtregdata.iva ? parseFloat(pro.iva.valor).toLocaleString('es-ES') + '%' : 'Iva'
                    }}</small></td>
                    <td><small>{{ parseFloat(txtregdata.precio_final).toLocaleString('es-ES') }}</small></td>
                    <td><small>{{ parseFloat(txtregdata.ganancia).toLocaleString('es-ES') }}</small></td>
                    <td><small>{{ txtregdata.stock }}</small></td>
                    <!--<td><small>{{ pro.proveedor?.nombres || '' }}</small></td>-->
                    <td>
                        <v-btn color="dark" v-bind="activatorProps" density="comfortable"
                            icon="mdi mdi-square-edit-outline" title="Editar"
                            @click="selecProducto(txtregdata.id), dialogEdit = true"></v-btn>

                        <v-btn color="dark" @click="deleteProducto(txtregdata.id)" density="comfortable"
                            icon="mdi mdi-delete-forever" title="Eliminar"></v-btn>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <br>

    <v-pagination v-model="currentPage" :length="lastPage" :total-visible="10" @update:modelValue="getProductos" />

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
import { Html5Qrcode } from "html5-qrcode"
import UnidadesMedida from '../configurar/UnidadesMedida.vue'
const url = import.meta.env.VITE_APP_API_URL

const precioventaimpuestos = ref('')
const txtregdata = ref({
    id: '',
    nombre: '',
    cantidad: '',
    unidad_medida: '',
    descripcion: '',
    marca_id: '',
    categoria_id: '',
    precio_venta: '',
    precio_compra: '',
    precio_final: '',
    porcentajeGanancia: '',
    ganancia: '',
    iva_id: '',
    ibua_id: '',
    ipc_id: '',
    stock: '',
    stock_minimo: '',
    proveedor_id: '',
    codigo_barras: '',
    img1: '',
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
const mostrarEscaner = ref(false)

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
                page
            },
        });
        console.log(res.data)
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
    nuevoProducto()
    try {
        const res = await axiosInst.get(url + 'api/productos/' + id);

        const producto = res.data;
        isStockDisabled.value = true;
        // Aseguramos que precio_base y precio_venta sean numéricos
        const base = parseFloat(producto.precio_base) || 0;
        const venta = parseFloat(producto.precio_venta) || 0;

        // Calculamos el porcentaje de ganancia
        let porcentajeGanancia = 0;
        if (base > 0 && venta >= base) {
            porcentajeGanancia = Math.round(((venta - base) / base) * 100);
        }

        // Asignamos todo a txtregdata, incluyendo el porcentaje
        txtregdata.value = {
            ...producto,
            porcentajeGanancia
        };

    } catch (err) {
        alert(err);
    }

    editando.value = false;
};

const updateProducto = async () => {
    const formData = new FormData();
    formData.append('id', txtregdata.value.id)
    formData.append('img1', txtregdata.value.img1)

    try {
        txtregdata.value.precio_venta = parseFloat(txtregdata.value.precio_venta_ajustado) || 0;
        txtregdata.value.precio_final = precioventaimpuestos.value
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
        const res = await axiosInst.delete(url + 'api/productos/' + id)

        getProductos()
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


const getImpuestoValor = (id, list) => {
    const impuesto = list.find(item => Number(item.id) === Number(id));
    return impuesto ? impuesto.valor : "N/A";
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

watch(
    txtregdata,
    (nuevoValor) => {
        const nuevoCompra = parseFloat(nuevoValor.precio_compra) || 0;
        const nuevoVenta = parseFloat(nuevoValor.precio_venta) || 0;

        if (nuevoVenta > 0 && nuevoCompra > 0) {
            txtregdata.value.ganancia = (nuevoVenta - nuevoCompra).toFixed(2);
        } else {
            txtregdata.value.ganancia = "0.00";
        }

    },
    { deep: true }
);

// Watch 1: Si cambia el porcentaje, se actualiza precio_venta
watch(
  () => txtregdata.value.porcentajeGanancia,
  (nuevoPorcentaje) => {
    const precioBase = parseFloat(txtregdata.value.precio_compra) || 0;
    const porcentaje = parseFloat(nuevoPorcentaje) || 0;

    if (precioBase > 0 && porcentaje >= 0) {
      const precioConGanancia = precioBase + (precioBase * (porcentaje / 100));
      const precioRedondeado = parseFloat(precioConGanancia.toFixed(2));

      // Evita rebote si el precio ya es el esperado
      if (parseFloat(txtregdata.value.precio_venta) !== precioRedondeado) {
        txtregdata.value.precio_venta = precioRedondeado;
      }
    }
  }
);

// Watch 2: Si cambia el precio_venta manualmente, recalcula porcentajeGanancia
watch(
  () => txtregdata.value.precio_venta,
  (nuevoPrecioVenta) => {
    const base = parseFloat(txtregdata.value.precio_compra) || 0;
    const venta = parseFloat(nuevoPrecioVenta) || 0;

    if (base > 0 && venta >= base) {
      const nuevoPorcentaje = ((venta - base) / base) * 100;
      const porcentajeRedondeado = Math.round(nuevoPorcentaje);

      // Evita rebote si el porcentaje ya coincide
      if (txtregdata.value.porcentajeGanancia !== porcentajeRedondeado) {
        txtregdata.value.porcentajeGanancia = porcentajeRedondeado;
      }
    }
  }
);

// Watch 3: Al cambiar cualquier campo de txtregdata, calcula impuestos y redondea precio
watch(
  txtregdata,
  (nuevoValor) => {
    const nuevoVenta = parseFloat(nuevoValor.precio_venta) || 0;
    if (!nuevoVenta) return;

    const ivaObj = ImpuestosList.value.find(item => Number(item.id) === Number(nuevoValor.iva_id));
    const ibuaObj = ImpuestosList.value.find(item => Number(item.id) === Number(nuevoValor.ibua_id));
    const ipcObj = ImpuestosList.value.find(item => Number(item.id) === Number(nuevoValor.ipc_id));

    const ivaPorcentaje = (ivaObj ? parseFloat(ivaObj.valor) : 0) / 100;
    const ibuaPorcentaje = (ibuaObj ? parseFloat(ibuaObj.valor) : 0) / 100;
    const ipcPorcentaje = (ipcObj ? parseFloat(ipcObj.valor) : 0) / 100;

    const totalPorcentajeImpuestos = ivaPorcentaje + ibuaPorcentaje + ipcPorcentaje;
    const divisor = 1 + totalPorcentajeImpuestos;
    if (divisor === 0) return;

    // Función para redondear
    const redondearPrecio = (precio) => {
      if (precio < 100) {
        return parseFloat(precio.toFixed(2));
      }
      return Math.round(precio / 100) * 100;
    };

    const precioFinalRedondeado = redondearPrecio(nuevoVenta * divisor);
    const nuevoPrecioBase = precioFinalRedondeado / divisor;

    const iva = nuevoPrecioBase * ivaPorcentaje;
    const ibua = nuevoPrecioBase * ibuaPorcentaje;
    const ipc = nuevoPrecioBase * ipcPorcentaje;

    txtregdata.value.precio_venta_ajustado = nuevoPrecioBase.toFixed(2);
    txtregdata.value.iva_calculado = iva.toFixed(2);
    txtregdata.value.ibua_calculado = ibua.toFixed(2);
    txtregdata.value.ipc_calculado = ipc.toFixed(2);

    precioventaimpuestos.value = precioFinalRedondeado;
  },
  { deep: true }
);



let qrScanner = null

const activarEscaner = () => {
    mostrarEscaner.value = true

    if (!qrScanner) {
        qrScanner = new Html5Qrcode("reader")
    }

    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            txtregdata.value.codigo_barras = decodedText
            detenerEscaner()
        },
        (error) => {
            // Puedes ignorar errores si son muchos
        }
    )
}

const detenerEscaner = () => {
    if (qrScanner) {
        qrScanner.stop()
            .then(() => {
                qrScanner.clear()
                mostrarEscaner.value = false
            })
            .catch(err => {
                console.error('Error al detener el escáner', err)
            })
    }
}

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