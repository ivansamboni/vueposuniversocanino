<template>
  <v-row class="bg-containerBg position-relative" no-gutters>
    <v-col cols="10" class="d-flex align-center">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="9">
            <v-card elevation="12" class="pa-6">
              <v-form @submit.prevent="update()" class="logprimaryrm">
                <v-alert type="primary" class="text-center mb-8">
                  Datos de usuario
                </v-alert>

                <v-alert color="error" v-show="errormsg" class="mb-3">
                  <p>{{ errortext }}</p>
                </v-alert>

                <div class="text-center mb-3">
                  <v-progress-circular v-show="spinnerload" color="primary" indeterminate />
                </div>

                <!-- Tipo y Número de Identificación -->
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select v-model="txtregdata.tipoidentificacion" :rules="nombreRules"
                      label="Tipo de Identificación" variant="underlined" color="primary" :items="[
                        'CÉDULA DE CIUDADANÍA',
                        'CÉDULA DE EXTRANJERÍA',
                        'TARJETA DE IDENTIDAD',
                        'REGISTRO CIVIL',
                        'PASAPORTE',
                        'NÚMERO DE IDENTIFICACIÓN DE EXTRANJERO'
                      ]" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field v-model="txtregdata.numidentificacion" :rules="nombreRules" required
                      hide-details="auto" variant="underlined" color="primary" label="Número de Identificación" />
                    <v-text-field v-show="numnit" v-model="txtregdata.numidentificacion" :rules="nombreRules" required
                      hide-details="auto" variant="underlined" color="primary" label="NIT" />
                  </v-col>
                </v-row>

                <!-- Nombres y Apellidos -->
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="txtregdata.nombres" :rules="nombreRules" required hide-details="auto"
                      variant="underlined" color="primary" label="Nombres"
                      @input="txtregdata.nombres = $event.target.value.toUpperCase()" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field v-model="txtregdata.apellidos" hide-details="auto" variant="underlined" color="primary"
                      label="Apellidos" @input="txtregdata.apellidos = $event.target.value.toUpperCase()" />
                  </v-col>
                </v-row>
<br>
                <!-- Teléfono y Email -->
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="txtregdata.telefono" :rules="telefonoRules" required hide-details="auto"
                      variant="underlined" color="primary" label="Teléfono"
                      @input="txtregdata.telefono = $event.target.value.replace(/\D/g, '')" />
                  </v-col>
                  <br>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="txtregdata.email" :rules="emailRules" required hide-details="auto"
                      variant="underlined" color="primary" label="Correo Electrónico" />
                  </v-col>
                </v-row>
                <br>
                <!-- Dirección -->
                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="txtregdata.direccion" :rules="nombreRules" required hide-details="auto"
                      variant="underlined" color="primary" label="Dirección domicilio" />
                  </v-col>
                </v-row>

                <!-- Mensaje de éxito -->
                <v-alert color="success" v-show="succesmsg" class="my-4">
                  <p>Se actualizaron los datos</p>
                </v-alert>
                <br>
                <!-- Botón -->
                <v-btn type="submit" color="success">
                  Actualizar
                </v-btn>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-col>
  </v-row>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import axiosInst from '@/components/axiosins';
const url = import.meta.env.VITE_APP_API_URL;

const txtregdata = ref({
  tipoidentificacion: '',
  numidentificacion: null,
  role: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  direccion: '',
  email: ''
});

const nombreRules = ref([(v) => !!v || 'El campo es requerido']);
const emailRules = ref([(v) => !!v || 'El campo es requerido', (v) => /.+@.+\..+/.test(v) || 'E-mail debe ser valido']);
const spinnerload = ref(false);
const errormsg = ref(false);
const succesmsg = ref(false);
const errortext = ref('');


const dataUser = async () => {
  const res = await axiosInst.get(url + "api/datauser");
  txtregdata.value = res.data;
  authStore.user.user = res.data;

};

const update = async () => {
  errormsg.value = false;
  spinnerload.value = true;
  succesmsg.value = false;

  try {
    const res = await axiosInst.put(url + 'api/updateprofile', txtregdata.value);
    spinnerload.value = false;
    errormsg.value = false;
    succesmsg.value = true;
    dataUser();

  } catch (error) {
    dataUser();
    succesmsg.value = false;
    spinnerload.value = false;
    errormsg.value = true;
    errortext.value = error.response.data.message;
  }
};

onMounted(() => {
  dataUser();
});
</script>
<style lang="scss">
.registerBox {
  max-width: 1000px;
  margin: 0 auto;
}
</style>