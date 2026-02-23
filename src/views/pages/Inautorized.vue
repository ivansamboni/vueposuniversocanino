   <template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-6 text-center" elevation="10" max-width="400">
      <v-icon size="80" color="error">mdi-alert-circle</v-icon>
      <v-card-title class="text-h5 mt-2">Acceso No Autorizado</v-card-title>
      <v-card-text class="text-body-2">
        No tienes permiso para acceder a esta página. Si crees que esto es un error, contacta al administrador.
      </v-card-text>
      <v-btn color="primary" block class="mt-4" @click="$router.push('/vender')">
        Volver al inicio
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
// No es necesario agregar lógica adicional en este caso
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>

