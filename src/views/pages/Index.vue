<template>
    <v-app>
        <v-app-bar elevation="3" color="white" px-10>
            <v-avatar size="70" class="mr-3">
                <v-img :src="imageUrl || (url + 'archivos/images/' + empresa.logotipo)" />
            </v-avatar>
            <v-toolbar-title class="font-weight-bold text-primary">
                Universo Canino <span class="text-grey-darken-1"></span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn variant="text" class="hidden-sm-and-down">Inicio</v-btn>
            <v-btn variant="text" class="hidden-sm-and-down">Servicios</v-btn>
            <v-btn color="primary" variant="flat" rounded="lg">Contáctanos</v-btn>
        </v-app-bar>

        <v-main class="bg-grey-lighten-5">
            <section class="hero-section py-16 px-6">
                <v-container>
                    <v-row align="center">
                        <v-col cols="12" md="6">
                            <h1 class="text-h2 font-weight-black text-secondary mb-4">
                                <v-avatar size="400" class="mr-3 text-center">
                                    <v-img :src="imageUrl || (url + 'archivos/images/' + empresa.logotipo)" />
                                </v-avatar><br><br>
                                El mejor futuro para tu mejor amigo
                            </h1>
                            <p class="text-h6 text-grey-darken-1 mb-6">
                                Entrenamiento profesional y cuidados veterinarios de primer nivel.
                                Programas diseñados para la felicidad de tu mascota.
                            </p>
                            <v-btn size="x-large" color="primary" rounded="pill" elevation="4">
                                Ver planes de estudio
                            </v-btn>
                        </v-col>
                        <v-col cols="12" md="6" class="text-center">
                            <v-img
                                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800"
                                alt="Perro feliz" class="rounded-xl elevation-12" width="70%"></v-img>
                        </v-col>
                    </v-row>
                </v-container>
            </section>

            <v-container class="py-12">
                <div class="text-center mb-12">
                    <h2 class="text-h3 font-weight-bold mb-2">Nuestros Planes</h2>
                    <v-divider class="mx-auto border-opacity-50" color="primary" width="80" thickness="4"></v-divider>
                    <p class="mt-4 text-grey">Elige el programa que mejor se adapte a las necesidades de tu mascota</p>
                </div>

                <v-row>
                    <v-col v-for="mac in plansList.data" :key="mac.id" cols="12" sm="6" md="4" lg="3">
                        <v-card class="mx-auto h-100 pet-card" elevation="4" border rounded="xl">
                            <v-img height="160"
                                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400"
                                cover class="align-end text-white">
                                <v-chip :color="mac.is_active ? 'success' : 'error'" size="small" variant="flat"
                                    class="ma-3">
                                    {{ mac.is_active ? 'Disponible' : 'Cerrado' }}
                                </v-chip>
                            </v-img>

                            <v-card-item class="pb-0">
                                <div class="text-overline mb-1 text-primary font-weight-bold">PROGRAMA #{{ mac.id }}
                                </div>
                                <v-card-title class="text-h5 font-weight-bold text-wrap">
                                    {{ mac.name }}
                                </v-card-title>
                            </v-card-item>

                            <v-card-text>
                                <p class="text-body-2 text-grey-darken-1 mb-4" style="min-height: 60px;">
                                    {{ mac.description }}
                                </p>

                                <v-list density="compact" bg-color="transparent" class="pa-0">
                                    <v-list-item class="px-0" prepend-icon="mdi-calendar-check" color="primary">
                                        <span class="text-body-2">{{ mac.days_per_week }} días semanales</span>
                                    </v-list-item>
                                    <v-list-item class="px-0" prepend-icon="mdi-clock-fast" color="primary">
                                        <span class="text-body-2">Ciclo de {{ mac.duration_days }} días</span>
                                    </v-list-item>
                                </v-list>

                                <div class="text-h4 font-weight-black text-secondary mt-4 text-center">
                                    ${{ parseFloat(mac.price).toLocaleString('es-ES') }}
                                </div>
                            </v-card-text>

                            <v-divider class="mx-4"></v-divider>

                            <v-card-actions class="pa-4">
                                <v-btn block color="secondary" variant="flat" rounded="lg"
                                    @click="selecPlan(mac.id), dialogEdit = true">
                                    Inscribirse ahora
                                </v-btn>
                            </v-card-actions>

                            <v-btn icon="mdi-delete-outline" size="x-small" color="error" variant="text"
                                position="absolute" style="top: 10px; right: 10px;" @click="deletePlan(mac.id)"></v-btn>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>

        <v-footer class="bg-secondary text-white py-10">
            <v-container>
                <v-row>
                    <v-col cols="12" md="4">
                        <h3 class="text-h6 font-weight-bold mb-4">PetAcademy</h3>
                        <p>Formando las mascotas del mañana, cuidando la salud de hoy.</p>
                    </v-col>
                    <v-col cols="12" md="4">
                        <h3 class="text-h6 font-weight-bold mb-4">Enlaces</h3>
                        <div class="d-flex flex-column">
                            <a href="#" class="text-white text-decoration-none mb-2">Privacidad</a>
                            <a href="#" class="text-white text-decoration-none mb-2">Términos de servicio</a>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4">
                        <h3 class="text-h6 font-weight-bold mb-4">Síguenos</h3>
                        <v-btn icon="mdi-facebook" variant="text"></v-btn>
                        <v-btn icon="mdi-instagram" variant="text"></v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-footer>
    </v-app>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axiosInst from '@/components/axiosins'

const url = import.meta.env.VITE_APP_API_URL
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
const empresa = ref({
    id: '',
    nombre: '',
    nit: '',
    telefonos: '',
    email: '',
    direccion: '',
    ciudad: '',
    logotipo: '',
    pie_pagina_factura: ''
})
const dialogEdit = ref(false)
const editando = ref(false);
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

const datosNegocio = async () => {
    const res = await axiosInst.get(url + 'api/settings')
    empresa.value = res.data
}


onMounted(() => {
    getPlans()
    datosNegocio()
})
</script>

<style scoped>
.hero-section {
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
}

.pet-card {
    transition: transform 0.3s ease;
}

.pet-card:hover {
    transform: translateY(-10px);
}

.text-primary {
    color: #1976D2 !important;
    /* Azul veterinario */
}

.text-secondary {
    color: #2E7D32 !important;
    /* Verde naturaleza/mascotas */
}
</style>