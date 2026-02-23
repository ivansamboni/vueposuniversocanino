<template>
    <v-alert text="Cree Plans y asocielas a productos" title="Creación de Plans" type="primary"
        icon="mdi-apple"></v-alert>
    <v-row class="bg-containerBg position-relative" no-gutters>

        <div class="text-center pa-4">
            <v-dialog width="600" v-model="dialogEdit">
                <v-card max-width="600">
                    <v-card-text class="pa-sm-10 pa-6">
                        <v-form @submit.prevent="registrar()" class="mt-1 logprimaryrm">
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-col cols="12">
                                        <v-text-field v-model="txtregdata.name" label="Nombre del Plan"
                                            placeholder="Ej: Plan Cachorro Silver" prepend-inner-icon="mdi-format-title"
                                            variant="outlined" density="comfortable"></v-text-field>
                                    </v-col>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-col cols="12">
                                        <v-textarea v-model="txtregdata.description" label="Descripción"
                                            placeholder="Incluye alimentación, paseos etc." variant="outlined"
                                            density="comfortable" />
                                    </v-col>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="txtregdata.price" label="Precio" prefix="$" type="number" v-solo-enteros
                                        prepend-inner-icon="mdi-cash" variant="outlined" 
                                        density="comfortable"></v-text-field>
                                </v-col>

                                <v-col cols="12" sm="6">
                                    <v-select v-model="txtregdata.days_per_week" :items="[1, 2, 3, 4, 5, 6, 7]"
                                        label="Días por semana" prepend-inner-icon="mdi-calendar-range"
                                        variant="outlined" density="comfortable"></v-select>
                                </v-col>

                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="txtregdata.duration_days" label="Duración (días)"
                                        type="number" hint="Mensual: 30, Anual: 365" persistent-hint
                                        prepend-inner-icon="mdi-clock-fast" variant="outlined"
                                        density="comfortable"></v-text-field>
                                </v-col>

                                <v-col cols="12" sm="6" class="d-flex align-center">
                                    <v-switch v-model="txtregdata.is_active" :label="txtregdata.is_active ?
                                        'Plan Activo' : 'Plan Inactivo'" color="success" set hide-details></v-switch>
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
    <v-chip label color="primary" text-color="primary">
        <v-btn @click="nuevoPlan" icon="mdi mdi-plus" density="compact"></v-btn>
        Nuevo
    </v-chip>
    <br><br>
    <v-row>
        <v-col v-for="mac in plansList.data" :key="mac.id" cols="12" sm="6" md="4" lg="3">
            <v-card class="mx-auto h-100" elevation="2" border>
                <v-card-subtitle>
                    <v-chip :color="mac.is_active ? 'success' : 'error'" size="x-small" variant="flat" class="mt-1">
                        {{ mac.is_active ? 'Activo' : 'Inactivo' }}
                    </v-chip>
                </v-card-subtitle>
                <v-card-item>
                    <template v-slot:overline>
                        ID: {{ mac.id }}
                    </template>
                    <v-col class="text-h4 font-weight-bold text-primary text-center">
                        {{ mac.name }}
                    </v-col>
                </v-card-item>

                <v-divider></v-divider>
                <v-col class="text-h6  text-center">
                    {{ mac.description }}
                </v-col>
                <v-card-text class="py-4">

                    <v-list density="compact" bg-color="transparent">
                        <v-list-item prepend-icon="mdi-calendar-week">
                            <v-list-item-title>{{ mac.days_per_week }} días a la semana</v-list-item-title>
                        </v-list-item>

                        <v-list-item prepend-icon="mdi-clock-outline">
                            <v-list-item-title>Duración: {{ mac.duration_days }} días</v-list-item-title>
                        </v-list-item>
                    </v-list>
                    <div class="text-h4 mb-4 text-center">
                        Precio ${{ parseFloat(mac.price).toLocaleString('es-ES') }}
                    </div>
                </v-card-text>

                <v-spacer></v-spacer>

                <v-card-actions class="bg-grey-lighten-4 px-4 py-2 d-flex justify-space-between">
                    <v-btn color="error" variant="text" size="small" prepend-icon="mdi-delete-forever"
                        @click="deletePlan(mac.id)" class="flex-grow-1">
                        Eliminar
                    </v-btn>
                    <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-square-edit-outline"
                        @click="selecPlan(mac.id), dialogEdit = true" class="flex-grow-1 mr-2">
                        Editar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>
    <br>
    <div class="text-center">
        <v-btn @click="getPlans(plansList.prev_page_url)" :disabled="!plansList.prev_page_url"
            icon="mdi mdi-chevron-left" density="comfortable">
        </v-btn>
        <span>&nbsp;Página {{ plansList.current_page }} / {{ plansList.last_page }}&nbsp;</span>
        <v-btn @click="getPlans(plansList.next_page_url)" :disabled="!plansList.next_page_url"
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
import { ref, onMounted } from 'vue'
import axiosInst from '@/components/axiosins'
import useRegister from '@/composables/useRegister'
import useUpdate from '@/composables/useUpdate'

const url = import.meta.env.VITE_APP_API_URL
const { register, regsuccessmsg, regerrormsg } = useRegister();
const { update, upderrormsg, updsuccessmsg } = useUpdate();
const txtregdata = ref({
    id: '', name: '', description: '', price: '', days_per_week: '',
    duration_days: '', is_active: true,
})
const plansList = ref({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
})
const snackbarReg = ref(false)
const snackbarUpd = ref(false)
const timeout = 4000
const dialogEdit = ref(false)
const nombreRules = ref([(v) => !!v || 'El campo es requerido'])
const editando = ref(false);

const nuevoPlan = () => {
    editando.value = true;
    dialogEdit.value = true
    txtregdata.value.name = ''
    txtregdata.value.description = ''
    txtregdata.value.price = ''
    txtregdata.value.days_per_week = ''
    txtregdata.value.duration_days = ''
    txtregdata.value.is_active = true
}

const registrar = async () => {
    await register(url + 'api/planes', txtregdata.value);
    dialogEdit.value = false
    snackbarReg.value = true
    txtregdata.value.name = ''
    txtregdata.value.description = ''
    txtregdata.value.price = ''
    txtregdata.value.days_per_week = ''
    txtregdata.value.duration_days = ''
    txtregdata.value.is_active = true
    editando.value = true;
    getPlans()
}

const actualizar = async () => {
    await update(url + 'api/planes/' + txtregdata.value.id, txtregdata.value);
    dialogEdit.value = false
    snackbarUpd.value = true
    txtregdata.value.name = ''
    txtregdata.value.description = ''
    txtregdata.value.price = ''
    txtregdata.value.days_per_week = ''
    txtregdata.value.duration_days = ''
    txtregdata.value.is_active = true
    editando.value = false;
    getPlans()
}

const selecPlan = async (id) => {
    editando.value = false;
    try {
        const res = await axiosInst.get(url + 'api/planes/' + id)
        txtregdata.value = res.data
        console.log(res.data)
    } catch (err) {
        alert(err)
    }
}

const getPlans = async (urls = url + 'api/planes?page=1') => {
    try {
        const res = await axiosInst.get(urls)
        plansList.value = res.data
    } catch (error) {

    }
};

const deletePlan = async (id) => {
    let confirmac = confirm('Eliminar esta plan?');
    if (confirmac) {
        const res = await axiosInst.delete(url + 'api/planes/' + id);
        getPlans()
    }
}


onMounted(() => {
    getPlans()
})
</script>
<style lang="scss">
.registerBox {
    max-width: 1000px;
    margin: 0 auto;
}
</style>