<template>
  <v-container>
    <v-alert title="Configuración del negocio" type="primary" variant="tonal" icon="mdi-cog-outline"
      class="mb-6 rounded-xl">
      Administra los datos principales de tu negocio. Estos aparecerán en facturas y tickets de venta.
    </v-alert>

    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-row>
        <v-col cols="12" lg="12">
          <v-card class="pa-6 rounded-xl elevation-3 h-100">
            <v-card-title class="d-flex align-center mb-4 px-0">
              <v-icon color="primary" size="32" class="mr-2">mdi-domain</v-icon>
              <span class="text-h5 font-weight-bold">Información General</span>
            </v-card-title>

            <v-divider class="mb-6"></v-divider>

            <v-row dense>
              <v-col cols="12" md="7">
                <v-text-field v-model="empresa.nombre" label="Nombre del Negocio" variant="outlined" color="primary"
                  prepend-inner-icon="mdi-store" density="comfortable" />
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field v-model="empresa.nit" label="NIT / RUT" variant="outlined" color="primary"
                  prepend-inner-icon="mdi-card-account-details" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="empresa.telefonos" label="Teléfonos de contacto" variant="outlined"
                  color="primary" prepend-inner-icon="mdi-phone" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="empresa.email" label="Correo Electrónico" type="email" variant="outlined"
                  color="primary" prepend-inner-icon="mdi-email" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete v-model="departamentoSeleccionado" :items="departamentos" item-title="nombre"
                  item-value="id" label="Departamento" variant="outlined" prepend-inner-icon="mdi-map-marker"
                  @update:model-value="limpiarMunicipio" density="comfortable" clearable></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete v-model="empresa.ciudad" :items="municipiosFiltrados"
                  :disabled="!departamentoSeleccionado" item-title="nombre" item-value="id" label="Municipio"
                  variant="outlined" prepend-inner-icon="mdi-city" density="comfortable" clearable></v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="empresa.direccion" label="Dirección Completa" variant="outlined" color="primary"
                  prepend-inner-icon="mdi-map-marker-radius" density="comfortable" />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="12">
          <v-card class="pa-6 rounded-xl elevation-3 d-flex flex-column h-100">
            <v-card-title class="d-flex align-center mb-4 px-0">
              <v-icon color="primary" size="32" class="mr-2">mdi-image-filter-center-focus</v-icon>
              <span class="text-h5 font-weight-bold">Identidad</span>
            </v-card-title>
            <v-divider class="mb-6"></v-divider>

            <div class="d-flex flex-column align-center justify-center flex-grow-1 border-dashed rounded-lg pa-4 mb-4"
              style="border: 2px dashed #ccc">
              <v-avatar size="150" class="mb-4 rounded-lg" v-if="imageUrl || empresa.logotipo" elevation="2">
                <v-img :src="imageUrl || (url + 'archivos/images/' + empresa.logotipo)" cover />
              </v-avatar>
              <v-icon v-else size="80" color="grey-lighten-1">mdi-image-plus</v-icon>

              <v-file-input v-model="empresa.logotipo" accept="image/*" @change="previewImage" label="Cargar Logotipo"
                variant="outlined" density="compact" class="w-100" prepend-icon="" prepend-inner-icon="mdi-camera"
                hide-details />
              <span class="text-caption text-grey mt-2 text-center">Tamaño recomendado: 512x512px (PNG/JPG)</span>
            </div>

            <v-btn color="success" block size="x-large" @click="registrar" class="rounded-lg elevation-2">
              <v-icon start>mdi-content-save</v-icon>
              Guardar Cambios
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-form>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card class="pa-2 rounded-xl elevation-2">
          <Impuestos />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-2 rounded-xl elevation-2">
          <UnidadesMedida />
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbarReg" :timeout="timeout" rounded="pill">
      <div class="d-flex align-center">
        <v-icon :color="regerrormsg ? 'error' : 'success'" class="mr-2">
          {{ regerrormsg ? 'mdi-alert-circle' : 'mdi-check-circle' }}
        </v-icon>
        <span v-if="regerrormsg">{{ regerrormsg }}</span>
        <span v-if="regsuccessmsg">{{ regsuccessmsg }}</span>
      </div>
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbarReg = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>


<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axiosInst from '@/components/axiosins'
import useRegister from '@/composables/useRegister'
import Impuestos from '@/views/configurar/Impuestos.vue'
import UnidadesMedida from './UnidadesMedida.vue'
import municipiosDian from '@/composables/municipiosDian.json'

const url = import.meta.env.VITE_APP_API_URL

const { register, regsuccessmsg, regerrormsg } = useRegister()
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
const isValid = ref(false)
const snackbarReg = ref(false)
const timeout = 4000
const imageUrl = ref(null)
const imageFile = ref(null)

const departamentos = [
  { id: "05", nombre: "Antioquia" }, { id: "08", nombre: "Atlántico" }, { id: "11", nombre: "Bogotá D.C." },
  { id: "13", nombre: "Bolívar" }, { id: "15", nombre: "Boyacá" }, { id: "17", nombre: "Caldas" },
  { id: "18", nombre: "Caquetá" }, { id: "19", nombre: "Cauca" }, { id: "20", nombre: "Cesar" },
  { id: "23", nombre: "Córdoba" }, { id: "25", nombre: "Cundinamarca" }, { id: "27", nombre: "Chocó" },
  { id: "41", nombre: "Huila" }, { id: "44", nombre: "La Guajira" }, { id: "47", nombre: "Magdalena" },
  { id: "50", nombre: "Meta" }, { id: "52", nombre: "Nariño" }, { id: "54", nombre: "Norte de Santander" },
  { id: "63", nombre: "Quindío" }, { id: "66", nombre: "Risaralda" }, { id: "68", nombre: "Santander" },
  { id: "70", nombre: "Sucre" }, { id: "73", nombre: "Tolima" }, { id: "76", nombre: "Valle del Cauca" },
  { id: "81", nombre: "Arauca" }, { id: "85", nombre: "Casanare" }, { id: "86", nombre: "Putumayo" },
  { id: "88", nombre: "San Andrés" }, { id: "91", nombre: "Amazonas" }, { id: "94", nombre: "Guainía" },
  { id: "95", nombre: "Guaviare" }, { id: "97", nombre: "Vaupés" }, { id: "99", nombre: "Vichada" }
];

const municipiosColombia = municipiosDian;
const departamentoSeleccionado = ref(null);
const municipioSeleccionado = ref(null);


watch(() => empresa.value.ciudad, (nuevoMunicipio) => {
  if (nuevoMunicipio) {
    // Si el municipio es "05001", extraemos el "05" para el departamento
    const depId = nuevoMunicipio.substring(0, 2);

    // Solo actualizamos si es diferente para evitar bucles infinitos
    if (departamentoSeleccionado.value !== depId) {
      departamentoSeleccionado.value = depId;
    }
  }
}, { immediate: true });

const municipiosFiltrados = computed(() => {
  if (!departamentoSeleccionado.value) return [];

  return municipiosColombia.filter(
    m => m.depId === departamentoSeleccionado.value
  );
});

// Resetear el municipio si se cambia el departamento
const limpiarMunicipio = () => {
  municipioSeleccionado.value = null;
};

const previewImage = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    imageUrl.value = URL.createObjectURL(file)
  }
}

const registrar = async () => {
  const formData = new FormData()
  formData.append('id', empresa.value.id)
  formData.append('logotipo', empresa.value.logotipo)
  formData.append('nombre', empresa.value.nombre)
  formData.append('nit', empresa.value.nit)
  formData.append('telefonos', empresa.value.telefonos)
  formData.append('email', empresa.value.email)
  formData.append('direccion', empresa.value.direccion)
  formData.append('ciudad', empresa.value.ciudad)

  await register(url + 'api/settings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  snackbarReg.value = true
  imageUrl.value = ''
  datosNegocio()
}

const datosNegocio = async () => {
  const res = await axiosInst.get(url + 'api/settings')
  empresa.value = res.data
}

onMounted(() => {
  datosNegocio()
})
</script>