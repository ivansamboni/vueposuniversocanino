<template>
    <v-row class="bg-containerBg position-relative" no-gutters>
        <!-- FORMULARIO DE BÚSQUEDA -->
        <v-col cols="12">
            <v-card class="text-center pa-4">
                <v-form @submit.prevent="searchCodigo()" class="mt-1 loginForm">
                    <v-row>
                        <v-col cols="12" md="2">
                            <v-text-field ref="codigoBarrasInput" v-model="txtregdata.codigo_barras"
                                variant="underlined" color="info" label="Código" hide-details="auto" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-combobox v-model="selectedId" :items="productResults" item-title="nombre"
                                item-value="codigo_barras" variant="underlined" v-model:search="nomBuscar"
                                label="Buscar" hide-details="auto" clearable />
                        </v-col>

                        <v-col cols="12" md="2">
                            <v-btn color="success" hidden type="submit">Agregar</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card>
        </v-col>
        <!-- TABLA DE PRODUCTOS AGREGADOS -->
        <v-col cols="12" md="6" class="pa-2">
  <v-table density="compact" class="text-caption">
    <thead>
      <tr>
        <th class="text-left py-1">
          <span class="text-success">Productos: {{ itemsVenta.length }}</span>
        </th>
        <th class="text-left py-1">U/M</th>
        <th class="text-left py-1">Cantidad</th>
        <th class="text-left py-1">Precio</th>
        <th class="text-left py-1">Quitar</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in itemsVenta" :key="item.id" class="py-0">
        <td><small>{{ item.nombre }}</small></td>
        <td><small>{{ item.unidad_medida }}</small></td>
        <td>
          <v-text-field
            v-model="item.cantidad"
            type="number"
            min="1"
            variant="underlined"
            density="compact"
            hide-details
            class="ma-0 pa-0"
            style="max-width: 60px;"
          />
        </td>
        <td>
          <small>$ {{ parseFloat(item.precio_final).toLocaleString('es-ES') }}</small>
        </td>
        <td>
          <v-btn
            icon="mdi-delete-forever"
            color="dark"
            density="compact"
            class="ma-0 pa-0"
            @click="deleteItem(item.id)"
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</v-col>

        <br>

        <!--dialog editcliente-->
        <v-dialog v-model="dialogEdit" max-width="800px">
            <v-card>
                <v-form class="mt-5 px-4">
                    <v-container>
                        <h3 class="text-primary text-center">Crear factura a nombre del cliente</h3>
                        <v-divider class="my-4"></v-divider>

                        <v-row>
                            <v-col cols="12" md="6">
                                <v-combobox v-model="search" :items="clientResults" item-title="nombre" item-value="id"
                                    variant="underlined" v-model:search="buscarCliente" label="Buscar cliente"
                                    hide-details="auto" append-inner-icon="mdi-magnify"></v-combobox>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-chip color="primary" close>Crear Cliente
                                    <v-btn @click="dialogAddclient = true" icon="mdi mdi-plus"
                                        density="compact"></v-btn>
                                </v-chip>
                            </v-col>
                        </v-row>
                        <br>
                        <br>
                        <v-row>
                            <v-col cols="12" md="6">
                                <strong>NOMBRE:</strong> {{ search.nombre || '' }}
                            </v-col>
                            <v-col cols="12" md="6">
                                <strong>CC/NIT:</strong> {{ search.numidentificacion || '' }}
                            </v-col>
                            <v-col cols="12" md="6">
                                <strong>EMAIL:</strong> {{ search.email || '' }}
                            </v-col>
                            <v-col cols="12" md="6">
                                <strong>TEL:</strong> {{ search.telefono || '' }}
                            </v-col>
                            <v-col cols="12" md="6">
                                <strong>DIRECCIÓN:</strong> {{ search.ubicacion || '' }}
                            </v-col>
                        </v-row><br>
                        <v-alert type="info" :value="true">
                            La factura se enviará al cliente a su email
                        </v-alert>
                    </v-container>

                    <v-card-actions class="justify-end px-4 pb-4">
                        <v-btn text="Cancelar" @click="clienteFinal(222222222222), dialogEdit = false"></v-btn>
                        <v-btn color="success" @click="clienteFinal(search.numidentificacion); dialogEdit = false"
                            :disabled="search.length === 0">
                            <v-icon left>mdi-account-plus</v-icon>
                            Agregar
                        </v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogAddclient" max-width="auto">
            <v-card>
                <v-card-actions class="justify-end">
                    <v-btn text="X Cerrar" color="primary" @click="dialogAddclient = false"></v-btn>
                </v-card-actions>
                <v-container>
                    <Clientes ref="clientesRef" />
                </v-container>
            </v-card>
        </v-dialog>

        <v-col cols="12" md="6"><br>
            <v-card class="mx-auto pa-1" max-width="400" title="Pagar">
                <v-container>
                    <v-row align="center">
                        <v-col>
                            <h6>CC/NIT: {{ datosVenta.numidentificacion }}</h6>
                            <h6>{{ datosVenta.nombres }}</h6>
                        </v-col>
                        <v-col class="ml-auto text-right">
                            <v-btn color="dark" v-bind="activatorProps" density="comfortable"
                                icon="mdi mdi-square-edit-outline" title="Editar" @click="dialogEdit = true">
                            </v-btn>
                        </v-col>
                    </v-row>

                    <v-select v-model="datosVenta.tipo_pago" :items="tipoPagos" label="Forma de Pago"
                        variant="underlined" class="mt-4" dense></v-select>

                    <v-text-field v-model="efectivoRecibidoFormatted" @input="updateEfectivoRecibido" color="primary"
                        label="Efectivo recibido" variant="underlined" class="mt-4" dense>
                    </v-text-field>
                    <h4 :class="colorMensaje">{{ mensajeDevolver }}</h4>

                    <v-row class="mt-4">
                        <v-col class="text-center">
                            <h2>Total: <span class="mdi mdi-currency-usd"></span> {{
                                parseFloat(total).toLocaleString('es-ES') }}</h2>
                        </v-col>
                    </v-row>

                    <v-btn @click="finishSale()" color="success" :disabled="itemsVenta.length === 0" block class="mt-4">
                        Realizar Pago
                    </v-btn>
                </v-container>
            </v-card>

        </v-col>
    </v-row>


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

    <v-dialog max-width="400" v-model="dialogImp">
        <v-card>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="dark" @click="dialogImp = false">X Cerrar</v-btn>
            </v-card-actions>
            <v-card-text>
                <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="600px" frameborder="0"></iframe>
            </v-card-text>

        </v-card>
    </v-dialog>

</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import axiosInst from '@/components/axiosins'
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router'
import useRegister from '@/composables/useRegister'
import Clientes from '../Clientes/Clientes.vue';

const router = useRouter()
const url = import.meta.env.VITE_APP_API_URL;
const authStore = useAuthStore();
const { register } = useRegister();
const search = ref('');
const clientesRef = ref(null);
const codigoBarrasInput = ref(null);
const dialogAddclient = ref(false)
const dialogEdit = ref(false)
const dialogImp = ref(false)
const pdfUrl = ref("");
const nomBuscar = ref('');
const selectedId = ref('');
const efectivoRecibido = ref('');
const clientResults = ref([]);
const productResults = ref([]);
const itemsVenta = ref([]);
const cedula = ref('222222222222');
const datosVenta = ref({
    cliente_id: '',
    user_id: authStore.user.id,
    nombres: '',
    numidentificacion: '',
    tipo_pago: 'Efectivo',
    impuesto: '',
    total: '',
});
const tipoPagos = ref(['Efectivo', 'Transferencia Bancaria', 'Tarjeta'])
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
});

// Cargar datos desde localStorage
const loadStorageList = () => {
    const productosStorage = JSON.parse(localStorage.getItem('listaProductos'));
    if (productosStorage) {
        itemsVenta.value = productosStorage;
    }
};

// Guardar datos en localStorage
const saveToLocalStorage = () => {
    localStorage.setItem('listaProductos', JSON.stringify(itemsVenta.value));
};

const efectivoRecibidoFormatted = computed(() => {
    return efectivoRecibido.value.toLocaleString('es-CO');
});
// Computed para calcular el total
const total = computed(() => {
    return itemsVenta.value.reduce((acumulado, producto) => {
        return acumulado + producto.precio_final * producto.cantidad;
    }, 0);
});

const totalDevolver = computed(() => {
    return efectivoRecibido.value - total.value;
});

const mensajeDevolver = computed(() => {
    const cantidadFormateada = Math.abs(totalDevolver.value).toLocaleString('es-CO');
    return totalDevolver.value >= 0 ? `Devolver: $${cantidadFormateada}` : `Debe: $${cantidadFormateada}`;
});

const colorMensaje = computed(() => {
    return totalDevolver.value >= 0 ? 'text-success' : 'text-error';
});

const updateEfectivoRecibido = (event) => {
    const value = event.target.value.replace(/\D/g, ''); // Quita todo lo que no sea número
    efectivoRecibido.value = Number(value);
};
// Buscar producto por nombre
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

// Buscar producto por código de barras
const searchCodigo = async () => {
    try {
        const res = await axiosInst.get(url + 'api/searchcodigoproducto/' + txtregdata.value.codigo_barras);
        const stockDisponible = res.data.stock;

        if (stockDisponible === 0) {
            alert('Producto agotado');
            return;
        }

        const productoExistente = itemsVenta.value.find(item => item.id === res.data.id || item.codigo_barras === txtregdata.value.codigo_barras);

        if (productoExistente) {
            productoExistente.cantidad += txtregdata.value.cantidad;
        } else {
            itemsVenta.value.push({
                id: res.data.id,
                nombre: res.data.nombre,
                unidad_medida: res.data.unidad_medida,
                precio_venta: res.data.precio_venta,
                precio_final: res.data.precio_final,
                stock: res.data.stock,
                cantidad: txtregdata.value.cantidad,
                codigo_barras: txtregdata.value.codigo_barras

            });
        }

        saveToLocalStorage(); // Guardar cambios en localStorage

        // Reset inputs
        txtregdata.value.cantidad = 1;
        txtregdata.value.codigo_barras = '';
        selectedId.value = '';
        productResults.value = [];
        codigoBarrasInput.value.focus();
    } catch (error) {
        alert('Código no encontrado');
        txtregdata.value.codigo_barras = '';

    }
};

const finishSale = async () => {

    try {
        const payload = {
            datosVenta: datosVenta.value,
            itemsVenta: itemsVenta.value
        };
        const res = await axiosInst.post(url + 'api/vender', payload);
        pdfUrl.value = res.data.ticket_url
        dialogImp.value = true; // Abre el modal
        efectivoRecibido.value = ''
        itemsVenta.value = []
        saveToLocalStorage()
        clienteFinal(cedula.value)

    } catch (error) {
        console.log(error)
        alert('algo falló')
    }

}

// Eliminar un producto de la lista
const deleteItem = (id) => {
    const index = itemsVenta.value.findIndex(item => item.id === id);
    if (index !== -1) {
        itemsVenta.value.splice(index, 1);
        saveToLocalStorage(); // Guardar cambios en localStorage
    }
    codigoBarrasInput.value.focus();
};

// Aumentar cantidad de un producto
const addcantItem = (id) => {
    const index = itemsVenta.value.findIndex(item => item.id === id);
    if (index !== -1) {
        itemsVenta.value[index].cantidad++;
        saveToLocalStorage(); // Guardar cambios en localStorage
    }
    codigoBarrasInput.value.focus();
};

// Reducir cantidad de un producto
const restcantItem = (id) => {
    const index = itemsVenta.value.findIndex(item => item.id === id);
    if (index !== -1 && itemsVenta.value[index].cantidad > 1) {
        itemsVenta.value[index].cantidad--;
        saveToLocalStorage(); // Guardar cambios en localStorage
    }
    codigoBarrasInput.value.focus();
};


const clienteFinal = async (cedula) => {
    const txtregdata = {
        tipoidentificacion: 'CÉDULA DE CIUDADANÍA',
        numidentificacion: cedula,
        nombres: 'CONSUMIDOR',
        apellidos: 'FINAL',
    };

    try {
        let res;

        try {
            // Intentar obtener el cliente final
            res = await axiosInst.get(url + 'api/clientefinal/' + cedula);
        } catch (error) {
            // Si no existe (404), lo crea
            if (error.response && error.response.status === 404) {
                await register(url + 'api/clientes', txtregdata);

                // Luego vuelve a buscarlo para obtener el ID y demás datos actualizados
                res = await axiosInst.get(url + 'api/clientefinal/' + cedula);
            } else {
                throw error; // Si es otro error diferente, lo lanza
            }
        }

        // Asignar los datos al formulario
        datosVenta.value.cliente_id = res.data.id;
        datosVenta.value.numidentificacion = res.data.numidentificacion;
        datosVenta.value.nombres = `${res.data.nombres} ${res.data.apellidos}`;
        search.value = [];

    } catch (err) {
        alert('Error procesando el cliente final. Redirigiendo al módulo de clientes.');
        router.push('/clientes');
    }
};



const buscarCliente = async () => {
    try {
        const res = await axiosInst.post(url + 'api/clientesearch', { search: search.value });
        clientResults.value = res.data.data.map(clien => ({
            id: clien.id,
            numidentificacion: clien.numidentificacion,
            nombre: clien.nombres + ' ' + (clien.apellidos ?? ''),
            email: clien.email,
            telefono: clien.telefono,
            ubicacion: clien.ubicacion || ''

        }));

    } catch (error) {
        console.error("Error al obtener los clientes", error);
    }
};

// Cargar datos cuando se monta el componente
onMounted(() => {
    codigoBarrasInput.value.focus();
    loadStorageList();
    clienteFinal(cedula.value)
});

watch(nomBuscar, () => {
    if (nomBuscar.value.length >= 3) {
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

watch(search, () => {
    if (search.value.length >= 3) {
        buscarCliente();
    }
});

watch(dialogAddclient, async (value) => {
    if (value) {
        await nextTick(); // Esperar a que el DOM se actualice completamente
        if (clientesRef.value?.nuevoCliente) {
            clientesRef.value.nuevoCliente();
        }
    }
});

</script>
<style lang="scss">
.registerBox {
    max-width: 1000px;
    margin: 0 auto;
}
</style>