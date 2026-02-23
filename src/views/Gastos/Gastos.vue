<template>
    <v-chip label color="primary" text-color="primary">
        <v-btn @click="nuevoGasto" icon="mdi mdi-plus" density="compact"></v-btn>
        Nueva
    </v-chip>
    <br>
    <br>
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">Responsable</th>
                    <th scope="col">Tipo de Gasto</th>
                    <th scope="col">Descripción</th>
                    <th scope="col">Monto</th>
                    <th scope="col">Fecha</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="gas in gastosList" :key="gas.id">
                    <td><small>{{ gas.user.nombres }} {{ gas.user.apellidos || '' }}</small></td>
                    <td><small>{{ gas.tipo_gasto }}</small></td>
                    <td><small>{{ gas.descripcion }}</small></td>
                    <td><small class="text-error">-${{ gas.monto ? parseFloat(gas.monto).toLocaleString('es-ES')
                            : '0' }}</small></td>
                    <td><small>{{ gas.fecha }}</small></td>
                </tr>
            </tbody>
        </table>
        <v-pagination v-model="currentPage" :length="lastPage" :total-visible="10" @update:modelValue="getGastos" />
    </div>

    <div class="text-center pa-4">
        <v-dialog width="600" v-model="dialogEdit">
            <v-btn icon @click="dialogEdit = false" style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-card max-width="600">
                <v-card-text class="pa-sm-10 pa-6">
                    <v-card-title class="text-h6">Registrar Gasto</v-card-title>
                    <v-card-text>
                        <br>
                        <v-form @submit.prevent="registrar" v-model="formValid" ref="form">
                            <v-row>
                                <!-- Tipo de gasto -->
                                <v-col cols="12" sm="8">
                                    <v-text-field v-model="expense.tipo_gasto" label="Tipo de gasto" required
                                        hide-details="auto" variant="underlined" color="primary" />
                                </v-col>

                                <!-- Monto -->
                                <v-col cols="12" sm="4">
                                    <v-text-field v-model="expense.monto" label="Monto" type="number" required
                                        hide-details="auto" variant="underlined" color="primary"
                                        @input="expense.monto = expense.monto.replace(/[^0-9]/g, '')" />
                                </v-col>

                                <!-- Fecha -->
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="expense.fecha" label="Fecha" type="date" required
                                        hide-details="auto" variant="underlined" color="primary" />
                                </v-col>

                                <!-- Descripción -->
                                <v-col cols="12">
                                    <v-textarea v-model="expense.descripcion" label="Descripción" rows="3" auto-grow
                                        variant="outlined" color="primary" hide-details="auto" />
                                </v-col>
                            </v-row>
                            <br>
                            <!-- Botón -->
                            <v-btn type="submit" block color="primary" :disabled="!formValid">
                                Registrar gasto
                            </v-btn>
                        </v-form>
                    </v-card-text>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>

    <v-snackbar v-model="snackbarReg" :timeout="timeout">
        <h3 v-if="regerrormsg" class="text-error">{{ regerrormsg }}</h3>
        <h3 v-if="regsuccessmsg" class="text-success">{{ regsuccessmsg }}</h3>
        <template v-slot:actions>
            <v-btn color="blue" variant="text" @click="snackbarReg = false">
                Cerrar
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosInst from '@/components/axiosins'
import useRegister from '@/composables/useRegister'
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const snackbarReg = ref(false)
const timeout = 4000
const url = import.meta.env.VITE_APP_API_URL
const { register, regsuccessmsg, regerrormsg } = useRegister();
const dialogEdit = ref(false)
const formValid = ref(false);
const gastosList = ref([]);
const search = ref('');
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(10)
const expense = ref({
    user_id: authStore.user.id,
    tipo_gasto: "",
    monto: "",
    fecha: "",
    descripcion: "",
    purchase_order_id: null, // opcional si viene de una factura
});
const nuevoGasto = () => {
    dialogEdit.value = true
    expense.value.tipo_gasto = ''
    expense.value.monto = null
    expense.value.fecha = ''
    expense.value.descripcion = ''
}

const registrar = async () => {
    let confirmar = window.confirm('¿Registrar gasto? revisar bien los datos antes de registar')
    if (confirmar) {
        await register(url + 'api/expenses', expense.value);
        snackbarReg.value = true
        dialogEdit.value = false
        getGastos()
    }
}


const getGastos = async (page = 1) => {
    try {
        const res = await axiosInst.get(url + `api/expenses`, {
            params: {
                page,
                search: search.value || '',
            },
        });       
        currentPage.value = res.data.current_page;
        lastPage.value = res.data.last_page;
        perPage.value = res.data.per_page;
        gastosList.value = res.data.data
    } catch (error) {
        console.error("Error al obtener créditos:", error);
    }
};

onMounted(() => {
    getGastos()
})

</script>