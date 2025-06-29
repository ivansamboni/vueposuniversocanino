<template>
    <v-alert text="Ajuste stock de productos" title="Ajustes" type="primary" icon="mdi-archive-edit-outline"></v-alert>
    <br>
    <v-chip label color="primary" text-color="primary">
        <v-btn @click="nuevaCompra" icon="mdi mdi-plus" name="compra" title="Nueva compra" density="compact"></v-btn>
        Nuevo
        Ajuste
    </v-chip>
    <div class="text-center pa-4">
        <v-dialog v-model="dialogEdit" fullscreen>
            <v-card max-width="auto">
                <v-card-text class="pa-sm-10 pa-6">
                    <v-row>
                        <v-col cols="12" md="2">
                            <v-text-field v-model="search" label="Codigo de barras o nombre" variant="underlined"
                                color="info" clearable />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-autocomplete v-model="filters.proveedor_id" :items="proveedoresList"
                                item-title="nombreCompleto" :rules="nombreRules" item-value="id" variant="underlined"
                                color="info" label="Proveedor" clearable required>
                                <template v-slot:item="{ props }">
                                    <v-list-item v-bind="props"></v-list-item>
                                </template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-autocomplete v-model="filters.categoria_id" :items="categoriasList" item-title="nombre"
                                clearable item-value="id" variant="underlined" color="info" label="Categoria">
                                <template v-slot:item="{ props }">
                                    <v-list-item v-bind="props"></v-list-item>
                                </template>
                            </v-autocomplete>
                        </v-col>                       
                        <v-btn class="ml-auto" text="X" @click="dialogEdit = false"></v-btn>
                    </v-row>

                    <v-expansion-panels v-model="panelAbierto">
                        <v-expansion-panel value="productos">
                            <v-expansion-panel-title>
                                <strong>Productos</strong>
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <v-container>
                                    <v-card>
                                        <v-card-title>
                                            <div class="d-flex justify-end">
                                                <v-btn color="success" density="comfortable" @click="agregarTodos">
                                                    Agregar todos
                                                </v-btn>
                                            </div>
                                        </v-card-title>
                                        
                                        <v-table density="comfortable" fixed-header height="200px">
                                            <thead>
                                                <tr>
                                                    <th>Código</th>
                                                    <th>Nombre</th>
                                                    <th>Stock actual</th>
                                                    <th>Stock Minimo</th>
                                                    <th>Agregar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="item in productosList" :key="item.id">
                                                    <td><small>{{ item.codigo_barras }}</small></td>
                                                    <td><small>{{ item.nombre }}</small></td>
                                                    <td><small
                                                            :class="{ 'text-error': item.stock <= item.stock_minimo }">
                                                            {{
                                                                item.stock
                                                            }}</small>
                                                    </td>
                                                    <td><small>{{ item.stock_minimo }}</small></td>
                                                    <td>
                                                        <v-btn icon="mdi-plus" color="success" density="comfortable"
                                                            @click="agregarASeleccionados(item)">
                                                        </v-btn>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </v-table>
                                        <v-pagination v-model="currentPage" :length="lastPage" :total-visible="5"
                                            @update:modelValue="fetchProductos" />
                                    </v-card>
                                </v-container>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
                    <br>
                    <div class="text-center">
                        <v-progress-circular v-show="spinner" color="primary" indeterminate
                            :size="75">Espere..</v-progress-circular>
                    </div>
                    <v-container>
                        <v-row>
                            <v-col cols="10" md="2">
                                <v-select :items="['Ajuste', 'Devolución']" v-model="datosCompra.status"
                                    label="Tipo de ajuste" variant="underlined" color="info"></v-select>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="datosCompra.descripcion" label="Descripción" variant="underlined"
                                    color="info" clearable></v-text-field>
                            </v-col>
                            <v-col cols="12" md="4">
                                <h4>Seleccionados {{ itemselected.length }}</h4>
                            </v-col>
                            <v-col cols="12" md="1">
                                <v-btn color="success" density="comfortable" @click="crearOrden()">Ajustar</v-btn>
                            </v-col>
                        </v-row>

                        <v-card>
                            <v-card-title>
                                <div class="d-flex justify-end mb-2">
                                    <v-btn color="dark" density="comfortable" @click="quitarTodos()">
                                        Quita Todos
                                    </v-btn>
                                </div>
                            </v-card-title>
                            <v-table density="comfortable" fixed-header height="300px">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Nombre</th>
                                        <th>Ajustar Stock actual</th>
                                        <th>Cantidad ajustada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in itemselected" :key="item.id">
                                        <td><small>{{ item.codigo_barras }}</small></td>
                                        <td><small>{{ item.nombre }}</small></td>
                                        <td><small><v-text-field type="number" v-model="item.stock" variant="underlined"
                                                    min="1" color="info" clearable></v-text-field></small></td>
                                        <td>
                                            <h4> {{ item.stock_cambio > 0 ? `+${item.stock_cambio}` : item.stock_cambio
                                                }}</h4>
                                        </td>
                                        <td><small>
                                                <v-btn color="dark" @click="deleteItem(item.id)" density="comfortable"
                                                    icon="mdi mdi-delete-forever" title="Quitar"></v-btn></small>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-card><br>


                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
    <v-snackbar v-model="snackbarReg" :timeout="timeout">
        <h3 v-if="regerrormsg" class="text-error">{{ regerrormsg }}</h3>
        <template v-slot:actions>
            <v-btn color="blue" variant="text" @click="snackbarReg = false">
                Cerrar
            </v-btn>
        </template>
    </v-snackbar>
    <AjusteDetalle ref="childAjustes" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axiosInst from '@/components/axiosins';
import { useAuthStore } from '@/stores/auth';
import AjusteDetalle from '@/views/Ajustes/AjusteDetalle.vue';


const nombreRules = ref([(v) => !!v || 'El campo es requerido'])
const panelAbierto = ref(["productos"]);
const authStore = useAuthStore();
const url = import.meta.env.VITE_APP_API_URL;
const regerrormsg = ref('')
const spinner = ref(false)
const timeout = 4000
const snackbarReg = ref(false)
const dialogEdit = ref(false);
const editando = ref(false);
const search = ref("");
const currentPage = ref(1);
const lastPage = ref(1);
const totalItems = ref(0);
const perPage = ref(10);
const loading = ref(false);
const filters = ref({ proveedor_id: null, categoria_id: null });
const productosList = ref([]);
const categoriasList = ref([])
const proveedoresList = ref([]);
const datosCompra = ref({
    factura_numero: '',
    user_id: authStore.user.id,
    status: 'Ajuste',
    descripcion: '',
});
const itemselected = ref([]);
const childAjustes = ref(null);



const dataProveedores = async () => {
    const res = await axiosInst.get(url + "api/proveedoreslist");

    proveedoresList.value = res.data.map(proveedor => ({
        id: proveedor.id,
        nombreCompleto: `${proveedor.nombres} ${proveedor.apellidos || ''}`.trim()
    }));
}

const dataCategorias = async () => {
    const res = await axiosInst.get(url + "api/categoriaslist")
    categoriasList.value = res.data
}

const nuevaCompra = () => {
    editando.value = true;
    dialogEdit.value = true

}

const fetchProductos = async (page = 1) => {
    loading.value = true;
    try {
        const res = await axiosInst.get(url + `api/stock`, {
            params: {
                page,
                search: search.value,
                ...filters.value, // Agregar filtros dinámicamente
            },
        });
        productosList.value = res.data.data;
        currentPage.value = res.data.current_page;
        lastPage.value = res.data.last_page;
        totalItems.value = res.data.total;
        perPage.value = res.data.per_page;
    } catch (error) {
        console.error("Error al obtener productos", error);
    } finally {
        loading.value = false;
    }
};

const fetchProductosCompletos = async () => {
    loading.value = true;
    let allProducts = [];
    let page = 1;
    try {
        while (true) {
            const res = await axiosInst.get(url + `api/stock`, {
                params: {
                    page,
                    search: search.value,
                    ...filters.value,
                },
            });
            allProducts = [...allProducts, ...res.data.data];

            if (page >= res.data.last_page) break; // Salimos si ya estamos en la última página
            page++;
        }
        return allProducts; // Devolvemos todos los productos
    } catch (error) {
        console.error("Error al obtener todos los productos", error);
        return [];
    } finally {
        loading.value = false;
    }
};


const agregarTodos = async () => {
    spinner.value = true
    const allProducts = await fetchProductosCompletos(); // Traer todos los productos

    allProducts.forEach(producto => {
        const index = itemselected.value.findIndex(item => item.id === producto.id);
        if (index === -1) {
            itemselected.value.push({
                id: producto.id,
                codigo_barras: producto.codigo_barras,
                nombre: producto.nombre,
                precio_venta: producto.precio_venta,
                precio_compra: producto.precio_compra,
                iva: producto.iva,
                stock: producto.stock,
                stock_minimo: producto.stock_minimo,
                stock_cambio: 0

            });
            spinner.value = false
        } else {
            itemselected.value[index].cantidad++;
            spinner.value = false
        }
    });
};


const quitarTodos = () => {
    itemselected.value = [];
};

const agregarASeleccionados = (producto) => {
    const index = itemselected.value.findIndex(item => item.id === producto.id);
    if (index === -1) {
        itemselected.value.push({
            id: producto.id,
            codigo_barras: producto.codigo_barras,
            nombre: producto.nombre,
            precio_venta: producto.precio_venta,
            precio_compra: producto.precio_compra,
            iva: producto.iva,
            stock: producto.stock,
            stock_minimo: producto.stock_minimo,
            stock_cambio: 0
        });
    } else {
        itemselected.value[index].cantidad++;
    }
};


const deleteItem = (id) => {
    const index = itemselected.value.findIndex(item => item.id === id);
    if (index !== -1) {
        itemselected.value.splice(index, 1);

    }
};

const crearOrden = async () => {
    spinner.value = true
    try {
        const purchase = {
            datosCompra: datosCompra.value,
            itemselected: itemselected.value
        };
        const res = await axiosInst.post(url + 'api/ajuste', purchase);
        itemselected.value = []
        filters.value.proveedor_id = ''
        filters.value.categoria_id = ''
        filters.value.minimos = 'minimos'
        datosCompra.value.factura_numero = ''
        datosCompra.value.descripcion = ''
        spinner.value = false
        fetchProductos();
        childAjustes.value.getAjustes()
        dialogEdit.value = false

    } catch (error) {
        snackbarReg.value = true
        regerrormsg.value = error.response.data.message
        spinner.value = false
    }

}


watch(() => filters.value.proveedor_id, (newValue) => {
    datosCompra.value.seller_id = newValue;
    search.value = ''
});

watch([search, filters], async () => {
    await fetchProductos();
}, { deep: true });

watch(
    () => itemselected.value.map(item => item.stock), // Observa los valores de stock
    (newValues, oldValues) => {
        newValues.forEach((newStock, index) => {
            const oldStock = oldValues[index];
            const diff = newStock - oldStock;

            if (diff !== 0) {
                // Usamos Vue.set o reasignamos la propiedad para que Vue lo detecte
                itemselected.value[index] = {
                    ...itemselected.value[index],
                    stock_cambio: (itemselected.value[index].stock_cambio || 0) + diff
                };
            }
        });
    },
    { deep: true } // Necesario para detectar cambios dentro del array
);



onMounted(() => {
    fetchProductos()
    dataProveedores()
    dataCategorias()
});
</script>