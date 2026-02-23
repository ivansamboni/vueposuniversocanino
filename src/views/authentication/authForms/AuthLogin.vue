<script setup lang="ts">
import { ref } from 'vue';
// icons
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { Form } from 'vee-validate';


const checkbox = ref(false);
const valid = ref(false);
const show1 = ref(false);
const password = ref('');
const email = ref('');
const passwordRules = ref([
  (v: string) => !!v || 'Introduce una contraseña',
  (v: string) => (v && v.length <= 10) || 'La contraseña debe tener 8 o mas caracteres '
]);
const emailRules = ref([(v: string) => !!v || 'Introduce una dirección de correo', (v: string) => /.+@.+\..+/.test(v) || 'Correo electrónico   debe ser valido']);

/* eslint-disable @typescript-eslint/no-explicit-any */
function validate(values: any, { setErrors }: any) {
  const authStore = useAuthStore();
  return authStore.login(email.value, password.value).catch((error) => setErrors({ apiError: error }));
}
</script>

<template>
  <div class="login-wrapper">
    <div class="text-center mb-8">      
        <v-img src="/src/assets/images/users/logo.png" alt="Logo PatoPos"></v-img>          
    </div>
<br>
    <Form @submit="validate" class="loginForm" v-slot="{ errors, isSubmitting }">
      <div class="field-container mb-8">
        <v-text-field v-model="email" label="Correo electrónico" placeholder="ejemplo@correo.com" :rules="emailRules"
          prepend-inner-icon="mdi-email-outline" variant="outlined" color="primary" rounded="lg" persistent-placeholder
          hide-details="auto"></v-text-field>
      </div>

      <div class="field-container mb-2">
        <v-text-field v-model="password" label="Contraseña" placeholder="••••••••" :rules="passwordRules"
          :type="show1 ? 'text' : 'password'" prepend-inner-icon="mdi-shield-key-outline"
          :append-inner-icon="show1 ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" variant="outlined" color="primary"
          rounded="lg" persistent-placeholder hide-details="auto" @click:append-inner="show1 = !show1"></v-text-field>
      </div>

      <div class="d-flex justify-end mb-6">
        <router-link to="/auth/olvidepassword" class="forgot-link">
          ¿Olvidaste tu contraseña?
        </router-link>
      </div>

      <v-btn type="submit" color="primary" block size="x-large" rounded="lg" elevation="4" :loading="isSubmitting"
        :disabled="valid" class="login-btn">
        Iniciar Sesión
        <v-icon end icon="mdi-arrow-right" class="ml-2"></v-icon>
      </v-btn>

      <v-slide-y-transition>
        <div v-if="errors.apiError" class="mt-4 error-container">
          <v-icon icon="mdi-alert-circle-outline" size="small" class="mr-2"></v-icon>
          <span>El correo o la contraseña son incorrectos</span>
        </div>
      </v-slide-y-transition>
    </Form>
  </div>
</template>
<style lang="scss" scoped>
.login-wrapper {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.field-container {
  transition: transform 0.2s ease;

  &:focus-within {
    transform: translateY(-2px);
  }
}

.forgot-link {
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
}

.login-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.error-container {
  background-color: #fff5f5;
  color: #d32f2f;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #d32f2f;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

/* Ajuste para los iconos de Vuetify dentro de los inputs */
:deep(.v-field__prepend-inner) {
  opacity: 0.7;
  color: rgb(var(--v-theme-primary));
}

:deep(.v-field--outlined) {
  background: white;
}
</style>