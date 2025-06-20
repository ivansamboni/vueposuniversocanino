<template>
    <v-alert
      text=""
      title="Configuración del negocio"
      type="info"
      icon="mdi-cog"
    ></v-alert>
  
    <v-container>
      <!-- Datos del negocio -->
      <v-card class="pa-5 mb-6" elevation="4">
        <v-card-title class="text-h5">Datos del negocio</v-card-title>
        <br>
        <v-form ref="form" v-model="isValid" lazy-validation>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="empresa.nombre"
                label="Nombre"
                variant="underlined"
                color="info"
                clearable
                hide-details="auto"
              />
            </v-col>
  
            <v-col cols="12" md="4">
              <v-text-field
                v-model="empresa.nit"
                label="NIT"
                variant="underlined"
                color="info"
                clearable
                hide-details="auto"
              />
            </v-col>
  
            <v-col cols="12" md="4">
              <v-text-field
                v-model="empresa.telefonos"
                label="Teléfonos"
                variant="underlined"
                color="info"
                clearable
                hide-details="auto"
              />
            </v-col>
  
            <v-col cols="12" md="4">
              <v-text-field
                v-model="empresa.email"
                label="Correo Electrónico"
                type="email"
                variant="underlined"
                color="info"
                clearable
                hide-details="auto"
              />
            </v-col>
  
            <v-col cols="12" md="4">
              <v-text-field
                v-model="empresa.direccion"
                label="Dirección"
                variant="underlined"
                color="info"
                clearable
                hide-details="auto"
              />
            </v-col>
  
            <v-col cols="12" md="4">
              <v-text-field
                v-model="empresa.ciudad"
                label="Ciudad"
                variant="underlined"
                color="info"
                clearable
                hide-details="auto"
              />
            </v-col>
  
            <v-col cols="12" md="4">
              <v-img
                v-if="imageUrl"
                :src="imageUrl"
                class="mt-4"
                max-height="100"
              />
              <v-file-input
                v-model="empresa.logotipo"
                prepend-icon="mdi-camera"
                accept="image/*"
                @change="previewImage"
                name="logotipo"
              />
              <img
                :src="url + 'archivos/images/' + empresa.logotipo"
                width="80"
                height="80"
                name="img"
              />
            </v-col>
  
            <v-col cols="12" md="8">
              <v-alert type="info" :value="true">
                Esta información se verá reflejada en las facturas y tickets de venta
              </v-alert>
            </v-col>
          </v-row>
  
          <v-card-actions class="mt-4">
            <v-spacer />
            <v-btn color="success" variant="outlined" @click="registrar">
              Guardar
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
  
      <!-- Configuración adicional -->
      <v-card class="pa-5" max-width="1000px" elevation="4">
        <v-row>
          <v-col>
            <Impuestos />
          </v-col>
          <v-col>
            <UnidadesMedida />
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  
    <!-- Snackbar -->
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
  import { ref, onMounted } from 'vue'
  import axiosInst from '@/components/axiosins'
  import useRegister from '@/composables/useRegister'
  import Impuestos from '@/views/configurar/Impuestos.vue'
  import UnidadesMedida from './UnidadesMedida.vue'
  
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
  })
  
  const isValid = ref(false)
  const snackbarReg = ref(false)
  const timeout = 4000
  const imageUrl = ref(null)
  const imageFile = ref(null)
  
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
    console.log(res.data)
  }
  
  onMounted(() => {
    datosNegocio()
  })
  </script>
  