<template>
    <v-alert text="Cree usuarios administradores o cajeros vendedores" title="Creación de Usuarios" type="primary"
        icon="mdi-account-plus-outline"></v-alert>
    <br>
    <v-chip label color="primary" text-color="primary">
        <v-btn @click="nuevoUser" icon="mdi mdi-plus" density="compact"></v-btn>
        Nuevo Usuario
    </v-chip>
    <br>
    <br>

    <v-row>
        <SearchComponent v-model="search" label="Nombre, apellido, cédula..." :min-chars="3" @search="buscarUsuario" />
        <v-col cols="12" md="3">
            <v-btn color="primary" @click="getUsers()">Todos</v-btn>
        </v-col>
    </v-row>
    <div class="d-flex justify-center align-center pa-4">
        <v-dialog width="600" v-model="dialogEdit" persistent>
            <v-card>
                <v-card-text class="pa-6">
                    <v-form @submit.prevent="registrar()">
                        <v-container>
                            <h3 class="text-primary text-center mb-4">Registro de Usuario</h3><br>
                            <div class="text-center mb-4">
                                <v-progress-circular v-show="spinnerload" color="primary"
                                    indeterminate></v-progress-circular>
                            </div>
                            <v-row justify="center">
                                <v-col cols="12" md="6">
                                    <v-select v-model="txtregdata.tipoidentificacion" :rules="nombreRules"
                                        label="Tipo de Identificación" variant="underlined" color="primary"
                                        :items="['CÉDULA DE CIUDADANÍA', 'NIT']"></v-select>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.numidentificacion" :rules="nombreRules" required
                                        hide-details="auto" variant="underlined" color="primary"
                                        label="Número de Identificación"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row justify="center">
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
                            <v-row justify="center">
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
                            <v-row justify="center">
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.direccion" :rules="nombreRules" required
                                        hide-details="auto" variant="underlined" color="primary"
                                        label="Dirección domicilio"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select :items="['ADMIN', 'CAJERO']" v-model="txtregdata.role" label="Rol"
                                        variant="underlined" color="primary"></v-select>
                                </v-col>
                            </v-row>
                            <v-row justify="center" v-show="inputPass">
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.password" :rules="passwordRules" required
                                        :type="txtregdata.Showpassword ? 'text' : 'password'" hide-details="auto"
                                        variant="underlined" color="primary" label="Contraseña"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.password_confirmation"
                                        :rules="confirmpasswordRules" required
                                        :type="txtregdata.Showpassword ? 'text' : 'password'" hide-details="auto"
                                        variant="underlined" color="primary"
                                        label="Confirmar Contraseña"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row justify="center" class="mt-4">
                                <v-col cols="12" class="text-center">
                                    <v-btn text="Cerrar" @click="dialogEdit = false" class="me-2"></v-btn>
                                    <v-btn v-if="!editando" color="success" @click="actualizar">Actualizar</v-btn>
                                    <v-btn v-if="editando" type="submit" color="success">Crear cuenta</v-btn>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>

    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th class="text-left">
                        Rol
                    </th>
                    <th class="text-left">
                        Nombres
                    </th>
                    <th class="text-left">
                        Apellidos
                    </th>
                    <th class="text-left">
                        Tipo de Identificación
                    </th>
                    <th class="text-left">
                        No Identificación
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
                <tr v-for="cli in usersList.data" :key="cli.id">
                    <td><small>{{ cli.role }}</small></td>
                    <td><small>{{ cli.nombres }}</small></td>
                    <td><small>{{ cli.apellidos }}</small></td>
                    <td><small>{{ cli.tipoidentificacion }}</small></td>
                    <td><small>{{ cli.numidentificacion }}</small></td>
                    <td><small>{{ cli.telefono }}</small></td>
                    <td><small>{{ cli.email }}</small></td>
                    <td><small>{{ cli.direccion }}</small></td>
                    <td>
                        <v-btn color="dark" @click="selecUser(cli.id), dialogEdit = true" density="comfortable"
                            icon="mdi mdi-square-edit-outline" title="Editar"></v-btn>
                        <v-btn color="dark" @click="deleteUser(cli.id)" density="comfortable"
                            icon="mdi mdi-delete-forever" title="Eliminar"></v-btn>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="text-center">
        <v-btn @click="getUsers(usersList.prev_page_url)" :disabled="!usersList.prev_page_url"
            icon="mdi mdi-chevron-left" density="comfortable">
        </v-btn>
        <span>&nbsp;Página {{ usersList.current_page }} / {{ usersList.last_page }}&nbsp;</span>
        <v-btn @click="getUsers(usersList.next_page_url)" :disabled="!usersList.next_page_url"
            icon="mdi mdi-chevron-right" density="comfortable">
        </v-btn>
    </div>

    <v-snackbar v-model="snackbarReg" :timeout="timeout">
        <h3 v-if="errormsg" class="text-error">{{ errormsg }}</h3>
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
import { ref, onMounted } from 'vue'
import axiosInst from '@/components/axiosins'
import useUpdate from '@/composables/useUpdate'
import SearchComponent from '@/components/SearchComponent.vue'

const { update, upderrormsg, updsuccessmsg } = useUpdate();
const url = import.meta.env.VITE_APP_API_URL
const inputPass = ref(false)
const editando = ref(false)
const dialogEdit = ref(false)
const snackbarUpd = ref(false)
const snackbarReg = ref(false)
const errormsg = ref('')
const regsuccessmsg = ref('')
const search = ref('');
const timeout = 4000
const txtregdata = ref({
    id: '', role: '', tipoidentificacion: '', numidentificacion: '', nombres: '', apellidos: '', telefono: '', email: '', direccion: '',
    role: '',
    password: '',
    password_confirmation: '',
    Showpassword: false
})
const usersList = ref({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
})
const nombreRules = ref([(v) => !!v || 'El campo es requerido']);
const telefonoRules = ref([(v) => !!v || 'El campo es requerido']);
const emailRules = ref([(v) => !!v || 'El campo es requerido', (v) => /.+@.+\..+/.test(v) || 'E-mail debe ser valido']);
const passwordRules = ref([
    (v) => !!v || 'Contraseña es requerida',
    (v) => (v && v.length <= 12) || 'La contraseña debe tener 8 o mas caracteres',
    (v) => (v && v.length >= 8) || 'La contraseña debe tener 8 o mas caracteres'
]);
const confirmpasswordRules = ref([
    (v) => !!v || 'Confirme la contraseña ',
    (v) => v === txtregdata.value.password || 'La contraseña no coincide  '
]);


const registrar = async () => {
    try {
        await axiosInst.post(url + 'api/users', txtregdata.value)
        dialogEdit.value = false
        snackbarReg.value = true
        editando.value = true
        errormsg.value = ''
        regsuccessmsg.value = 'Registro éxitoso'
        for (const key in txtregdata.value) {
            txtregdata.value[key] = ''
        }
        getUsers()
    } catch (error) {
        snackbarReg.value = true
        errormsg.value = error.response.data.message
    }
}

const actualizar = async () => {
    await update(url + 'api/users/' + txtregdata.value.id, txtregdata.value, getUsers);
    dialogEdit.value = false
    snackbarUpd.value = true
    for (const key in txtregdata.value) {
        txtregdata.value[key] = ''
    }

}

const selecUser = async (id) => {
    inputPass.value = false;
    editando.value = false;
    try {
        const res = await axiosInst.get(url + 'api/users/' + id)
        txtregdata.value = res.data
    } catch (err) {
        alert(err)
    }
}

const buscarUsuario = async () => {
    try {
        const res = await axiosInst.post(url + 'api/usersearch', { search: search.value }); // Enviar como objeto
        usersList.value = res.data;
    } catch (error) {
        console.error("Error al obtener los usuarios", error);
    }
};

const getUsers = async () => {
    try {
        const res = await axiosInst.get(url + 'api/users')
        usersList.value = res.data
    } catch (error) {

    }
};

const deleteUser = async (id) => {
    let confirmac = confirm('Eliminar esta Usuario?');
    if (confirmac) {
        const res = await axiosInst.delete(url + 'api/users/' + id);
        getUsers()
    }
}

const nuevoUser = () => {
    inputPass.value = true;
    editando.value = true;
    dialogEdit.value = true
    for (const key in txtregdata.value) {
        txtregdata.value[key] = ''
    }
}

onMounted(() => {
    getUsers()
})

</script>
<style lang="scss">
.registerBox {
    max-width: 1000px;
    margin: 0 auto;
}
</style>
