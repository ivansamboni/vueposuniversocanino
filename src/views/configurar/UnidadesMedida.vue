<template>
    <v-row class="bg-containerBg position-relative" no-gutters>
        <v-card-title class="text-h5">Unidades de Medida</v-card-title>
        <div class="text-center pa-4">
            <v-dialog width="600" v-model="dialogEdit">
                <v-card max-width="600">
                    <v-card-text class="pa-sm-10 pa-6">
                        <v-form @submit.prevent="registrar()" class="mt-1 loginForm">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="txtregdata.nombre" :rules="nombreRules" required
                                        hide-details="auto" variant="underlined" color="info"
                                        label="Nombre de la unidad de medidad"
                                        @input="txtregdata.nombre = $event.target.value.toUpperCase()"></v-text-field>
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
    <v-chip close color="primary">
        <v-btn @click="nuevaUnidad" icon="mdi mdi-plus" density="compact"></v-btn>Nuevo
    </v-chip>
    <br>
    <br>
    <table>
        <thead>
            <tr>                
                <th class="text-left">
                   Unidades de Medida
                </th>               
                <th class="text-left">
                    Acciones
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="mac in medidasList" :key="mac.id">              
                <td>{{ mac.nombre }}</td>
              
                <td>
                    <v-btn color="dark" @click="selecMedida(mac.id), dialogEdit = true" density="comfortable"
                        icon="mdi mdi-square-edit-outline" title="Editar"></v-btn>
                    <v-btn color="dark" @click="deleteMedida(mac.id,mac.nombre)" density="comfortable"
                        icon="mdi mdi-delete-forever" title="Eliminar"></v-btn>
                </td>
            </tr>
        </tbody>
    </table>
    <br>
    
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
import { ref, onMounted } from 'vue'
import axiosInst from '@/components/axiosins'
import useRegister from '@/composables/useRegister'
import useUpdate from '@/composables/useUpdate'

const url = import.meta.env.VITE_APP_API_URL
const { register, regsuccessmsg, regerrormsg } = useRegister();
const { update, upderrormsg, updsuccessmsg } = useUpdate();
const txtregdata = ref({ id: '', nombre: '' })
const medidasList = ref([])
const snackbarReg = ref(false)
const snackbarUpd = ref(false)
const timeout = 4000
const dialogEdit = ref(false)
const nombreRules = ref([(v) => !!v || 'El campo es requerido'])
const editando = ref(false);

const nuevaUnidad = () => {
    editando.value = true;
    dialogEdit.value = true
    txtregdata.value.nombre = ''
   
}

const registrar = async () => {
    await register(url + 'api/unidadmedidas', txtregdata.value);
    dialogEdit.value = false
    snackbarReg.value = true
    txtregdata.value.nombre = '' 
    editando.value = true;
    getMedidas()
}

const actualizar = async () => {
    await update(url + 'api/unidadmedidas/' + txtregdata.value.id, txtregdata.value);
    dialogEdit.value = false
    snackbarUpd.value = true
    txtregdata.value.nombre = ''    
    editando.value = false;
    getMedidas()
}

const selecMedida = async (id) => {
    editando.value = false;
    try {
        const res = await axiosInst.get(url + 'api/unidadmedidas/' + id)
        txtregdata.value = res.data        
    } catch (err) {
        alert(err)
    }
}

const getMedidas = async ( ) => {
    try {
        const res = await axiosInst.get(url + 'api/unidadmedidas')
        medidasList.value = res.data
    } catch (error) {

    }
};

const deleteMedida = async (id,Medida) => {
    let confirmac = confirm('Eliminar? ' + Medida);
    if (confirmac) {
        const res = await axiosInst.delete(url + 'api/unidadmedidas/' + id);
        getMedidas()
    }
}

onMounted(() => {
    getMedidas()
})
</script>
<style lang="scss">
.registerBox {
    max-width: 1000px;
    margin: 0 auto;
}
</style>