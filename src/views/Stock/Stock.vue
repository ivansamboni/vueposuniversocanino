<template>

    <v-tabs v-model="tab" bg-color="primary">
        <v-tab value="one">Gestión de Stock</v-tab>
    </v-tabs>

    <v-window v-model="tab">
        <v-window-item value="one">
            <v-card>
                <v-card-title>Stock de productos</v-card-title>
                <!-- Filtros -->
                <v-container>
                    <v-row>
                        <v-col cols="12" md="3">
                            <v-text-field v-model="search" label="Codigo de barras o nombre" variant="underlined"
                                color="primary" clearable />
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-autocomplete v-model="filters.categoria_id" :items="categoriasList" item-title="nombre"
                                clearable item-value="id" variant="underlined" color="primary" label="Categoria">
                                <template v-slot:item="{ props }">
                                    <v-list-item v-bind="props"></v-list-item>
                                </template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-autocomplete v-model="filters.proveedor_id" :items="proveedoresList"
                                item-title="nombreCompleto" item-value="id" variant="underlined" color="primary"
                                label="Proveedor" clearable>
                                <template v-slot:item="{ props }">
                                    <v-list-item v-bind="props"></v-list-item>
                                </template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-radio-group v-model="filters.minimos" inline>
                                <v-radio label="Minimo" value="minimos" color="primary"></v-radio>
                                <v-radio label="Todo" value="" color="primary"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-btn @click="fetchProductos" color="primary" hidden block>Filtrar</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
                <div class="table-responsive">
                    <table class="table">

                        <thead>
                            <tr>
                                <th class="text-left">
                                    Codigo de barras
                                </th>
                                <th class="text-left">
                                    Nombre
                                </th>
                                <th class="text-left">
                                    U/M
                                </th>
                                <th class="text-left">
                                    Categoría
                                </th>
                                <th class="text-left">
                                    Proveedor
                                </th>
                                <th class="text-left">
                                    Stock actual
                                </th>
                                <th class="text-left">
                                    Stock minimo
                                </th>
                                <th class="text-left">
                                    Unidades faltantes
                                </th>

                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in productosList" :key="item.id">
                                <td><small>{{ item.codigo_barras }}</small></td>
                                <td><small>{{ item.nombre }}</small></td>
                                <td><small>{{ item.unidad_medida }}</small></td>
                                <td><small>{{ item.categoria?.nombre ?? '' }}</small></td>
                                <td><small>{{ item.proveedor?.nombres ?? '' }} {{ item.proveedor?.apellidos
                                    ?? '' }}</small></td>
                                <td><small>{{ item.stock }}</small></td>
                                <td><small>{{ item.stock_minimo }}</small></td>
                                <td><small class="text-error"> {{ Math.max(item.stock_minimo - item.stock, 0) }}</small>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <br>

                <v-pagination v-model="currentPage" :length="lastPage" :total-visible="10"
                    @update:modelValue="fetchProductos" />
            </v-card>
        </v-window-item>
    </v-window>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axiosInst from '@/components/axiosins'

const url = import.meta.env.VITE_APP_API_URL
const tab = ref(null);
const productosList = ref([]);
const currentPage = ref(1);
const lastPage = ref(1);
const totalItems = ref(0);
const perPage = ref(10);
const loading = ref(false);
const search = ref("");
const proveedoresList = ref([])
const categoriasList = ref([])
const filters = ref({
    categoria_id: null,
    proveedor_id: null,
    minimos: 'minimos',
});

// Obtener datos de la API
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
        window.scrollTo({
            top: 0,
            behavior: "smooth", // Agrega un efecto suave
        });
    } catch (error) {
        console.error("Error al obtener productos", error);
    } finally {
        loading.value = false;
    }
};

const dataCategorias = async () => {
    const res = await axiosInst.get(url + "api/categoriaslist")
    categoriasList.value = res.data
}
const dataProveedores = async () => {
    const res = await axiosInst.get(url + "api/proveedoreslist");

    proveedoresList.value = res.data.map(proveedor => ({
        id: proveedor.id,
        nombreCompleto: `${proveedor.nombres} ${proveedor.apellidos || ''}`.trim()
    }));
}




// Llamar a la API cuando cambian los filtros
watch([search, filters], fetchProductos, { deep: true });

fetchProductos();

onMounted(() => {
    dataCategorias(), dataProveedores()
})
</script>