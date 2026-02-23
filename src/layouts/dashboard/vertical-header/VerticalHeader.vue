<script setup>
import { useCustomizerStore } from '../../../stores/customizer';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

import { useRouter } from 'vue-router';
import menuItem from '../vertical-sidebar/menuItem';
// icons
import {
  MenuFoldOutlined, SearchOutlined, UserOutlined, LogoutOutlined,
  EditOutlined,
  ProfileOutlined,
} from '@ant-design/icons-vue';
const router = useRouter();

const navigateTo = (path, dialogState) => {
  if (path) {
    router.push(path);
    dialogState.value = false; 
  }
};

const authStore = useAuthStore();
const tab = ref(null);
const customizer = useCustomizerStore();
const menu = ref(false);
const sticky = false;

</script>

<template>
  <v-app-bar elevation="2" height="60">
    <v-btn class="hidden-md-and-down text-secondary mr-3" color="darkText" icon rounded="sm" variant="text"
      @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)" size="small">
      <MenuFoldOutlined :style="{ fontSize: '16px' }" />
    </v-btn>
    <v-btn class="hidden-lg-and-up text-secondary ms-3" color="darkText" icon rounded="sm" variant="text"
      @click.stop="customizer.SET_SIDEBAR_DRAWER" size="small">
      <MenuFoldOutlined :style="{ fontSize: '16px' }" />
    </v-btn>
    <!---/Search part -->
    <v-spacer />


    <v-dialog max-width="1000px" scrollable>
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        color="primary"
        size="large"
        prepend-icon="mdi-apps"
      >      
      </v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-center text-h5 font-weight-bold">
       Acceso Rápido
        </v-card-title>
        
        <v-divider class="mb-4"></v-divider>

        <v-card-text>
          <v-row dense justify="center">
            <v-col 
              v-for="item in menuItem" 
              :key="item.title" 
              cols="6" sm="4" md="2"
              class="d-flex justify-center"
            >
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  :elevation="isHovering ? 8 : 2"
                  :color="isHovering ? 'primary-darken-1' : 'surface'"
                  class="menu-card d-flex flex-column align-center justify-center pa-4 mb-4"
                  width="130"
                  height="130"
                  @click="navigateTo(item.to, isActive)"
                >
                  <component 
                    :is="item.icon" 
                    :style="{ fontSize: '40px', color: isHovering ? 'white' : 'inherit' }" 
                  />
                  
                  <span 
                    class="text-center text-caption mt-3 font-weight-bold"
                    :class="isHovering ? 'text-white' : 'text-grey-darken-3'"
                  >
                    {{ item.title }}
                  </span>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="isActive.value = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>



    <div class="text-center">
      <v-menu v-model="menu" :close-on-content-click="false" location="end">

        <v-card class="overflow-auto mx-auto" max-height="300" width="448">

          <v-card-text class="bg-grey-lighten-4">
            <v-sheet class="mx-auto" height="auto"></v-sheet>
          </v-card-text>

        </v-card>
      </v-menu>
    </div>
    <v-menu :close-on-content-click="true" offset="8, 0">
      <template v-slot:activator="{ props }">
        <v-btn class="profileBtn" variant="text" rounded="sm" v-bind="props" color="primary">
          <div class="d-flex align-center">

            <v-avatar class="mr-sm-2 mr-0 py-2" color="primary">
              <UserOutlined />
            </v-avatar>
            {{ authStore.user.nombres + ' ' + (authStore.user?.apellidos || '') }}
          </div>
        </v-btn>
      </template>
      <v-sheet rounded="md" width="290">
        <v-list class="py-0" aria-label="profile list" aria-busy="false">
          <v-list-item router-link to="/editarperfil" color="primary" rounded="0" value="Edit profile">
            <template v-slot:prepend>
              <EditOutlined :style="{ fontSize: '14px' }" class="mr-4" />
            </template>
            <v-list-item-title class="text-subtitle-2">Editar Perfil</v-list-item-title>
          </v-list-item>


          <v-list-item @click="authStore.logout()" color="secondary" rounded="0">
            <template v-slot:prepend>
              <LogoutOutlined :style="{ fontSize: '14px' }" class="mr-4" />
            </template>

            <v-list-item-title class="text-subtitle-2"> Cerrar Sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-menu>
  </v-app-bar>
</template>


<style scoped>
.menu-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 16px !important;
}

/* Evita que el texto se corte si es muy largo */
.text-caption {
  line-height: 1.2;
  word-wrap: break-word;
}
</style>