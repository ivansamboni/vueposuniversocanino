<template>
    <v-alert text="Cree clientes que podrá agregar a las facturas de venta" title="Creación de Clientes" type="primary"
        icon="mdi-account-multiple-outline"></v-alert>
    <v-row class="bg-containerBg position-relative" no-gutters>

        <div class="text-center pa-4">
            <v-dialog width="600" v-model="dialogEdit">
                <v-card max-width="600">
                    <v-card-text class="pa-sm-10 pa-6">
                        <v-form @submit.prevent="registrar()" class="mt-1 logprimaryrm">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-select v-model="txtregdata.tipoidentificacion" :rules="nombreRules"
                                        label="Tipo de Identificación" variant="underlined" color="primary" :items="[
                                            'NIT',
                                            'CÉDULA DE CIUDADANÍA',
                                            'CÉDULA DE EXTRANJERÍA',
                                            'NÚMERO DE IDENTIFICACIÓN DE EXTRANJERO',
                                            'OTRO'
                                        ]"></v-select>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.numidentificacion" required hide-details="auto"
                                        variant="underlined" color="primary" label="No Identificación"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.nombres" :rules="nombreRules" required
                                        hide-details="auto" variant="underlined" color="primary" label="Nombres"
                                        @input="txtregdata.nombres = $event.target.value.toUpperCase()"></v-text-field>

                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.apellidos" hide-details="auto"
                                        variant="underlined" color="primary" label="Apellidos"
                                        @input="txtregdata.apellidos = $event.target.value.toUpperCase()"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.telefono" :rules="telefonoRules" required
                                        hide-details="auto" variant="underlined" color="primary" label="Teléfono"
                                        @input="txtregdata.telefono = $event.target.value.replace(/\D/g, '')"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.email" :rules="emailRules" required
                                        hide-details="auto" variant="underlined" color="primary"
                                        label="Correo Electrónico"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.ubicacion" hide-details="auto"
                                        variant="underlined" color="primary" label="Ubicación"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-card-actions>
                                <v-btn class="ms-auto" text="Cerrar" @click="dialogEdit = false"></v-btn>
                                <v-btn v-if="!editando" color="success" @click="actualizar">Actualizar</v-btn>
                                <v-btn v-if="editando" color="success" type="submit">Crear</v-btn>
                            </v-card-actions>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </div>
    </v-row>
    <v-chip color="primary" close>Crear Cliente
        <v-btn @click="nuevoCliente" icon="mdi mdi-plus" density="compact"></v-btn>
    </v-chip>
    <br><br>
    <v-row>
        <SearchComponent v-model="search" label="Nombre, apellido, cédula..." :min-chars="3" @search="buscarCliente" />
        <v-col cols="12" md="3">
            <v-btn color="primary" @click="getclientes()">Todos</v-btn>
        </v-col>
    </v-row>
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th class="text-left">
                        Tipo de Identificación
                    </th>
                    <th class="text-left">
                        No Identificación
                    </th>
                    <th class="text-left">
                        Nombres
                    </th>
                    <th class="text-left">
                        Apellidos
                    </th>
                    <th class="text-left">
                        Telefono
                    </th>
                    <th class="text-left">
                        Correo
                    </th>
                    <th class="text-left">
                        Ubicación
                    </th>
                    <th class="text-left">
                        Acciones
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="cli in clintesList.data" :key="cli.id">
                    <td><small>{{ cli.tipoidentificacion }}</small></td>
                    <td><small>{{ cli.numidentificacion }}</small></td>
                    <td><small>{{ cli.nombres }}</small></td>
                    <td><small>{{ cli.apellidos }}</small></td>
                    <td><small>{{ cli.telefono }}</small></td>
                    <td><small>{{ cli.email }}</small></td>
                    <td><small>{{ cli.ubicacion }}</small></td>
                    <td><small>
                            <v-btn color="dark" @click="selecCliente(cli.id), dialogEdit = true" density="comfortable"
                                icon="mdi mdi-square-edit-outline" title="Editar"></v-btn>
                            <v-btn color="dark" @click="deleteCliente(cli.id)" density="comfortable"
                                icon="mdi mdi-delete-forever" title="Eliminar"></v-btn>
                        </small></td>
                </tr>
            </tbody>
        </table>
    </div>
    <br>
    <div class="text-center">
        <v-btn @click="getclientes(clintesList.prev_page_url)" :disabled="!clintesList.prev_page_url"
            icon="mdi mdi-chevron-left" density="comfortable">
        </v-btn>
        <span>&nbsp;Página {{ clintesList.current_page }} / {{ clintesList.last_page }}&nbsp;</span>
        <v-btn @click="getclientes(clintesList.next_page_url)" :disabled="!clintesList.next_page_url"
            icon="mdi mdi-chevron-right" density="comfortable">
        </v-btn>
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
import useRegister from '@/composables/useRegister'
import useUpdate from '@/composables/useUpdate'
import SearchComponent from '@/components/SearchComponent.vue'


const { register, regsuccessmsg, regerrormsg } = useRegister();
const { update, upderrormsg, updsuccessmsg } = useUpdate();
const url = import.meta.env.VITE_APP_API_URL

const txtregdata = ref({
    id: '', tipoidentificacion: '', numidentificacion: '', nombres: '', apellidos: '', telefono: '', email: '', ubicacion: '',
})
const clintesList = ref({
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
const search = ref('');

const nuevoCliente = () => {
    editando.value = true;
    dialogEdit.value = true
    for (const key in txtregdata.value) {
        txtregdata.value[key] = ''
    }
}

defineExpose({ nuevoCliente });

const buscarCliente = async () => {
    try {
        const res = await axiosInst.post(url + 'api/clientesearch', { search: search.value }); // Enviar como objeto
        clintesList.value = res.data;
    } catch (error) {
        console.error("Error al obtener los clientes", error);
    }
};

const registrar = async () => {
    await register(url + 'api/clientes', txtregdata.value);
    getclientes()
    dialogEdit.value = false
    snackbarReg.value = true
    editando.value = true;
    for (const key in txtregdata.value) {
        txtregdata.value[key] = ''
    }

}

const actualizar = async () => {
    await update(url + 'api/clientes/' + txtregdata.value.id, txtregdata.value, getclientes);
    dialogEdit.value = false
    snackbarUpd.value = true
    editando.value = false;
    for (const key in txtregdata.value) {
        txtregdata.value[key] = ''
    }

}

const selecCliente = async (id) => {
    editando.value = false;
    try {
        const res = await axiosInst.get(url + 'api/clientes/' + id)
        txtregdata.value = res.data
    } catch (err) {
        alert(err)
    }
}

const getclientes = async (urls = url + 'api/clientes?page=1') => {
    search.value = ''
    try {
        const res = await axiosInst.get(urls)
        clintesList.value = res.data
    } catch (error) {

    }
};

const deleteCliente = async (id) => {
    let confirmac = confirm('Eliminar este cliente?');
    if (confirmac) {
        const res = await axiosInst.delete(url + 'api/clientes/' + id);
        getclientes()
    }
}

onMounted(() => {
    getclientes()
})
</script>
<style lang="scss">
.registerBox {
    max-width: 1000px;
    margin: 0 auto;
}
</style>