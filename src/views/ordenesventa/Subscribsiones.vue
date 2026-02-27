<template>
    <v-container fluid>
        <v-card>
            <v-card-title class="d-flex align-center ga-4">
                <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Buscar cliente o mascota..."
                    variant="solo-filled" density="compact" hide-details @keyup.enter="getSubscriptions()" />
                <v-icon icon="mdi-card-membership" color="primary" />
                Gestión de Suscripciones
                <v-spacer />  
                <v-btn icon="mdi-reload" variant="text" color="grey-darken-1" title="Recargar" @click="reload()"></v-btn>              
            </v-card-title>            
            <v-divider />

            <v-table density="comfortable">
                <thead>
                    <tr class="bg-grey-lighten-4">
                        <th>Cliente</th>
                        <th>Mascota</th>
                        <th>Plan</th>
                        <th>Vigencia</th>
                        <th>Estado</th>
                        <th>Pagado</th>                        
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="sub in subscriptions.data" :key="sub.id">
                        <td>
                            <div class="font-weight-bold">{{ sub.client?.nombres }}</div>
                            <div class="text-caption text-grey">{{ sub.client?.numidentificacion }}</div>
                        </td>
                        <td>{{ sub.pet?.name }}</td>
                        <td>
                            <v-chip size="small" variant="outlined" color="primary" @click="">
                                {{ sub.plan?.name }} 
                            </v-chip><br>
                            {{ sub.plan?.description }} por  {{ sub.plan?.duration_days }} días
                        </td>
                        <td>
                            <div class="text-caption">
                                <strong>Desde:</strong> {{ formatDate(sub.starts_at) }}<br>
                                <strong>Hasta:</strong> {{ formatDate(sub.ends_at) }}
                            </div>
                        </td>
                        <td>
                            <v-chip :color="getStatusColor(sub.status)" size="x-small" class="text-uppercase">
                                {{ sub.status }}
                            </v-chip>
                        </td>
                        <td class="font-weight-bold text-success">
                            ${{ Number(sub.amount_paid).toLocaleString('es-ES') }}
                        </td>                        
                    </tr>
                </tbody>
            </v-table>
            <v-card-actions class="justify-center">
                <v-pagination v-model="page" :length="subscriptions.last_page" @update:model-value="getSubscriptions" />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInst from '@/components/axiosins'
const url = import.meta.env.VITE_APP_API_URL

const subscriptions = ref({ data: [], last_page: 1 })
const search = ref('')
const page = ref(1)
const dialogPlan = ref(false)

const getSubscriptions = async () => {
    try {
        const res = await axiosInst.get(`${url}api/supscription`, {
            params: { page: page.value, search: search.value }
        })
        subscriptions.value = res.data
    } catch (error) {
        console.error("Error cargando suscripciones", error)
    }
}

const getStatusColor = (status) => {
    const colors = {
        active: 'success',
        expired: 'error',
        cancelled: 'grey',
        pending: 'warning'
    }
    return colors[status] || 'grey'
}

const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
}

const cancelSubscription = async (id) => {
    if (confirm('¿Estás seguro de cancelar esta suscripción?')) {
        await axiosInst.delete(`${url}api/supscription/${id}`)
        getSubscriptions()
    }
}

const reload = () => {
    search.value=''
    getSubscriptions()
}


onMounted(() => {
    getSubscriptions()
})
</script>