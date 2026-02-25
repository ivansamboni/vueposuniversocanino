<template>
    <v-container>
      <v-row dense class="mb-4">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="searchBenf"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por nombre, identificación o dueño..."
            variant="solo"
            hide-details
            clearable
            @keyup.enter="getPets()"
          />
        </v-col>
        <v-col cols="12" md="4" class="d-flex ga-2">
          <v-btn icon="mdi-refresh" variant="tonal" color="primary" @click="reload()" />
        </v-col>
      </v-row>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        class="text-none"
        rounded="lg"
        @click="nuevoCliente()"
      >
        Nueva Mascota
      </v-btn>
      <v-row v-if="petsList.data && petsList.data.length > 0">
        <v-col v-for="cli in petsList.data" :key="cli.id" cols="12">
          <v-card border flat class="rounded-xl pet-card transition-swing">
            <v-card-text class="pa-4">
              <v-row align="center" no-gutters>
                <v-col cols="12" md="4" class="d-flex align-center">
                  <v-dialog max-width="500">
                    <template v-slot:activator="{ props: activatorProps }">
                      <v-btn v-bind="activatorProps" variant="flat" icon="mdi-dog">
                        <v-avatar size="60" class="mr-15">
                          <v-img
                            v-if="cli.photo"
                            :src="`${url}${cli.photo}`"
                            width="100%"
                          />
                          <v-icon v-else icon="mdi-dog"></v-icon>
                        </v-avatar>
                      </v-btn>
                    </template>
                    <template v-slot:default="{ isActive }">
                      <v-card :title="cli.name">
                        <v-card-text>
                          <v-img
                            v-if="cli.photo"
                            :src="`${url}${cli.photo}`"
                            width="100%"
                          />
                          <v-icon v-else icon="mdi-dog" color="primary" size="32" />
                        </v-card-text>
  
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn text="X" @click="isActive.value = false"></v-btn>
                        </v-card-actions>
                      </v-card>
                    </template>
                  </v-dialog>
                  <p class="text-center pa-4">{{ cli.name }}</p>
  
                  <div class="text-center pa-4">
                    <v-btn @click="dialogQr = cli.id" icon="mdi mdi-qrcode-scan"> </v-btn>
  
                    <v-dialog
                      :model-value="dialogQr === cli.id"
                      @update:model-value="dialogQr = null"
                      width="auto"
                    >
                      <v-card>
                        <div :id="'print-' + cli.id" class="pa-4">
                          <v-img :src="cli.identifier" width="400px" class="mx-auto" />
                          <h3 class="text-center">{{ cli.name }}</h3>
                        </div>
  
                        <v-btn color="primary" class="ma-4" @click="imprimirQR(cli)">
                          Imprimir
                        </v-btn>
  
                        <template v-slot:actions>
                          <v-btn
                            class="ms-auto"
                            text="Cerrar"
                            @click="dialogQr = null"
                          ></v-btn>
                        </template>
                      </v-card>
                    </v-dialog>
                  </div>
  
                  <div class="text-center pa-4">
                    <v-btn
                      @click="(dialogLog = true), getLogs(cli.id)"
                      icon="mdi mdi-book-edit-outline"
                    >
                    </v-btn>
                    <v-dialog v-model="dialogLog" max-width="600px">
                      <v-card class="rounded-xl">
                        <v-card-title class="pa-4 d-flex align-center">
                          <v-icon icon="mdi-notebook" class="mr-2" />
                          Bitácora de Seguimiento
                        </v-card-title>
  
                        <v-card-text>
                          <v-row dense>
                            <v-col cols="8">
                              <v-text-field
                                v-model="logForm.title"
                                label="Título del reporte"
                                density="compact"
                                variant="outlined"
                              />
                            </v-col>
                            <v-col cols="4">
                              <v-select
                                v-model="logForm.type"
                                :items="logTypes"
                                label="Tipo"
                                density="compact"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-textarea
                                v-model="logForm.description"
                                label="Descripción detallada"
                                rows="2"
                                density="compact"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-btn
                                block
                                color="primary"
                                @click="guardarLog()"
                                :disabled="!logForm.title"
                                >Agregar Entrada</v-btn
                              >
                            </v-col>
                          </v-row>
  
                          <v-divider class="my-4"></v-divider>
  
                          <v-timeline density="compact" align="start">
                            <v-timeline-item
                              v-for="log in petLogs"
                              :key="log.id"
                              size="x-small"
                            >
                              <div class="mb-4">
                                <div class="d-flex justify-space-between align-center">
                                  <strong>{{ log.title }}</strong>
                                  <span class="text-caption grey--text"
                                    >-{{ new Date(log.created_at).toLocaleString() }}</span
                                  >
                                </div>
                                <div class="text-body-2">{{ log.description }}</div>
                              </div>
                            </v-timeline-item>
                          </v-timeline>
                        </v-card-text>
                      </v-card>
                    </v-dialog>
                  </div>
                </v-col>
  
                <v-col cols="12" md="3" class="mt-2 mt-md-0">
                  <div class="text-caption text-grey">Responsable</div>
                  <div class="text-body-2 font-weight-medium">
                    <v-icon icon="mdi-account" size="14" class="mr-1" />
                    {{ cli.client.nombres }} {{ cli.client.apellidos }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ cli.client.numidentificacion }}
                  </div>
                </v-col>
  
                <v-col cols="12" md="2" class="mt-2 mt-md-0">
                  <div class="text-caption text-grey">Raza / Tipo</div>
                  <v-chip size="small" variant="outlined" color="grey-darken-2">{{
                    cli.type
                  }}</v-chip>
                </v-col>
  
                <v-col cols="6" md="1" class="mt-2 mt-md-0">
                  <div class="text-caption text-grey">Edad</div>
                  <div class="text-body-2 font-weight-bold">{{ cli.year_old }} años</div>
                </v-col>
  
                <v-col cols="12" md="2" class="text-right mt-3 mt-md-0">
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    color="blue-darken-2"
                    @click="selecCliente(cli.id), (dialogEdit = true)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    @click="deleteCliente(cli.id)"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <v-row v-else justify="center" class="mt-10">
        <v-col cols="12" md="4" class="text-center">
          <v-icon icon="mdi-paw-off" size="64" color="grey-lighten-1" />
          <div class="text-h6 text-grey-darken-1 mt-4"></div>
          <v-btn color="primary" variant="text" @click="reload()">Ver todos</v-btn>
        </v-col>
      </v-row>
  
      <v-row justify="center" class="mt-6">
        <v-pagination
          v-model="page"
          :length="petsList.last_page"
          :total-visible="5"
          density="comfortable"
          @update:model-value="getPets(null)"
        />
      </v-row>
  
      <v-dialog width="700" v-model="dialogEdit" persistent>
        <v-card rounded="xl" class="pa-2">
          <v-toolbar
            :color="editando ? 'success' : 'primary'"
            flat
            rounded="lg"
            class="px-4 text-white"
          >
            <v-icon start size="large">{{
              editando ? "mdi-plus-circle" : "mdi-pencil-box"
            }}</v-icon>
            <v-toolbar-title class="font-weight-bold">
              {{ editando ? "Actualizar Información" : "Registrar Nueva Mascota" }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" @click="dialogEdit = false"></v-btn>
          </v-toolbar>
  
          <v-card-text class="pa-6">
            <v-form ref="petForm">
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-2">mdi-account-star</v-icon>
                <span class="text-subtitle-1 font-weight-bold"
                  >Información del Responsable</span
                >
              </div>
  
              <v-row dense class="mb-6">
                <v-col cols="12">
                  <v-combobox
                    v-model="search"
                    :items="clientResults"
                    item-title="nombre"
                    item-value="id"
                    variant="outlined"
                    v-model:search="buscarCliente"
                    @update:model-value="
                      (val) => {
                        txtregdata.client_id = val ? val.id : null;
                      }
                    "
                    label="Buscar responsable por nombre o NIT"
                    prepend-inner-icon="mdi-account-search"
                    color="primary"
                    rounded="lg"
                    density="comfortable"
                    hint="Escribe para buscar en la base de datos de clientes"
                    persistent-hint
                  />
                </v-col>
  
                <v-col cols="12" v-if="search">
                  <v-alert
                    color="primary"
                    variant="tonal"
                    icon="mdi-card-account-details-outline"
                    rounded="lg"
                    class="mt-2"
                  >
                    <div class="text-body-2">
                      <strong>Cliente Seleccionado:</strong> {{ search.nombre }}<br />
                      <strong>Identificación:</strong> {{ search.numidentificacion }}
                    </div>
                  </v-alert>
                </v-col>
              </v-row>
  
              <v-divider class="mb-6"></v-divider>
  
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-2">mdi-paw</v-icon>
                <span class="text-subtitle-1 font-weight-bold">Datos de la Mascota</span>
              </div>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="txtregdata.name"                  
                    label="Nombre de la Mascota"
                    variant="outlined"
                    rounded="lg"
                    color="primary"
                    maxlength="30"
                    counter="30"
                    :rules="[(v) => (v || '').length <= 30 || 'Máximo 30 caracteres']"
                    @input="txtregdata.name = $event.target.value.toUpperCase()"
                  />
                </v-col>
  
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="txtregdata.type"
                    label="Género / Raza / Especie"
                    variant="outlined"
                    rounded="lg"
                    color="primary"
                    placeholder="Ej: Golden Retriever"
                    maxlength="30"
                    counter="30"
                    :rules="[(v) => (v || '').length <= 30 || 'Máximo 30 caracteres']"
                    @input="txtregdata.type = $event.target.value.toUpperCase()"
                  />
                </v-col>
  
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="txtregdata.year_old"
                    label="Edad Estimada"
                    variant="outlined"
                    rounded="lg"
                    color="primary"
                    suffix="años"
                    type="number"
                    @input="txtregdata.year_old = $event.target.value.replace(/\D/g, '')"
                  />
                </v-col>
  
                <v-col cols="12">
                  <v-textarea
                    v-model="txtregdata.observations"
                    label="Observaciones Especiales (Alergias, conducta, etc.)"
                    variant="outlined"
                    rounded="lg"
                    color="primary"
                    rows="3"
                    prepend-inner-icon="mdi-clipboard-text-outline"
                  />
                </v-col>
              </v-row>
              <v-col cols="12">
                <v-file-input
                  label="Foto de la mascota"
                  variant="outlined"
                  rounded="lg"
                  prepend-inner-icon="mdi-camera"
                  accept="image/*"
                  @change="handleFileUpload"
                  density="comfortable"
                ></v-file-input>
              </v-col>
  
              <v-card-actions class="mt-6 pa-0">
                <v-btn
                  variant="text"
                  @click="dialogEdit = false"
                  class="text-none px-6"
                  rounded="lg"
                >
                  Cancelar
                </v-btn>
  
                <v-spacer></v-spacer>
  
                <v-btn
                  v-if="editando"
                  color="success"
                  variant="elevated"
                  @click="actualizar()"
                  class="text-none px-10 font-weight-bold"
                  rounded="xl"
                  size="large"
                >
                  Actualizar Cambios
                </v-btn>
  
                <v-btn
                  v-else
                  color="primary"
                  variant="elevated"
                  @click="registrar()"
                  class="text-none px-10 font-weight-bold"
                  rounded="xl"
                  size="large"
                >
                  Crear Registro
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
  
      <v-snackbar v-model="snackbarReg" :timeout="timeout">
        <h3 v-if="regerrormsg" class="text-error">{{ regerrormsg }}</h3>
        <h3 v-if="regsuccessmsg" class="text-success">{{ regsuccessmsg }}</h3>
        <template v-slot:actions>
          <v-btn color="blue" variant="text" @click="snackbarReg = false"> Cerrar </v-btn>
        </template>
      </v-snackbar>
      <v-snackbar v-model="snackbarUpd" :timeout="timeout">
        <h3 v-if="upderrormsg" class="text-error">{{ upderrormsg }}</h3>
        <h3 v-if="updsuccessmsg" class="text-success">{{ updsuccessmsg }}</h3>
        <template v-slot:actions>
          <v-btn color="blue" variant="text" @click="snackbarUpd = false"> Cerrar </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from "vue";
  import axiosInst from "@/components/axiosins";
  import SearchComponent from "@/components/SearchComponent.vue";
  
  const url = import.meta.env.VITE_APP_API_URL;
  
  const txtregdata = ref({
    id: "",
    client_id: "",
    identifier: "",
    name: "",
    type: "",
    year_old: "",
    observations: "",
    photo: "",
    is_active: 1,
  });
  
  const logForm = ref({
    pet_id: null,
    title: "",
    description: "",
    type: "General",
  });
  const logTypes = ["Médico", "Vacuna", "Alimentación", "Higiene", "General"];
  const petsList = ref({ data: [], last_page: 1 });
  const nombreRules = ref([(v) => !!v || "El campo es requerido"]);
  const snackbarReg = ref(false);
  const snackbarUpd = ref(false);
  const timeout = 4000;
  const dialogEdit = ref(false);
  const editando = ref(false);
  const dialogQr = ref(false);
  const dialogLog = ref(false);
  const search = ref("");
  const searchBenf = ref("");
  const clientResults = ref([]);
  const petLogs = ref([]);
  const page = ref(1);
  const fotoSeleccionada = ref(null);
  const regerrormsg = ref("");
  const regsuccessmsg = ref("");
  const upderrormsg = ref("");
  const updsuccessmsg = ref("");
  
  const handleFileUpload = (event) => {
    fotoSeleccionada.value = event.target.files[0];
  };
  
  const nuevoCliente = () => {
    editando.value = false;
    dialogEdit.value = true;
    txtregdata.value.client_id = "";
    txtregdata.value.id = "";
    txtregdata.value.identifier = "";
    txtregdata.value.name = "";
    txtregdata.value.type = "";
    txtregdata.value.year_old = null;
    txtregdata.value.observations = "";
    txtregdata.value.photo = "";
    fotoSeleccionada.value = null;
    search.value = "";
  };
  const buscarCliente = async () => {
    try {
      const res = await axiosInst.post(url + "api/clientesearch", { search: search.value });
      clientResults.value = res.data.data.map((clien) => ({
        id: clien.id,
        numidentificacion: clien.numidentificacion,
        nombre: clien.nombres + " " + (clien.apellidos ?? ""),
      }));
    } catch (error) {
      console.error("Error al obtener los clientes", error);
    }
  };
  
  const registrar = async () => {
    const formData = new FormData();
  
    Object.keys(txtregdata.value).forEach((key) => {
      if (txtregdata.value[key] !== null) {
        formData.append(key, txtregdata.value[key]);
      }
    });
  
    if (fotoSeleccionada.value) {
      formData.append("photo", fotoSeleccionada.value);
    }
  
    try {
      await axiosInst.post(url + "api/pet", formData);
      snackbarReg.value = true;
      regsuccessmsg.value = "Registro éxitoso";
      regerrormsg.value = "";
      dialogEdit.value = false;
  
      editando.value = false;
      txtregdata.value.client_id = "";
      txtregdata.value.id = "";
      txtregdata.value.identifier = "";
      txtregdata.value.name = "";
      txtregdata.value.type = "";
      txtregdata.value.year_old = "";
      txtregdata.value.observations = "";
      txtregdata.value.photo = "";
      fotoSeleccionada.value = null;
      getPets();
    } catch (error) {
      regsuccessmsg.value = "";
      regerrormsg.value = error.response.data.message;
    }
    snackbarReg.value = true;
  };
  
  const actualizar = async () => {
    const formData = new FormData();
  
    // Pasamos los datos del objeto al FormData
    Object.keys(txtregdata.value).forEach((key) => {
      if (txtregdata.value[key] !== null) {
        formData.append(key, txtregdata.value[key]);
      }
    });
  
    // Añadimos la foto si se seleccionó una nueva
    if (fotoSeleccionada.value) {
      formData.append("photo", fotoSeleccionada.value);
    }
  
    formData.append("_method", "PUT");
  
    try {
      // IMPORTANTE: Usamos .post aunque sea una actualización,
      // debido al comportamiento de FormData con archivos.
      await axiosInst.post(`${url}api/pet/${txtregdata.value.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      snackbarUpd.value = true;
      updsuccessmsg.value = "Se actualizó con éxito";
      upderrormsg.value = "";
      dialogEdit.value = false;
      fotoSeleccionada.value = null;
      txtregdata.value.pet_id = "";
      txtregdata.value.client_id = "";
      txtregdata.value.identifier = "";
      txtregdata.value.name = "";
      txtregdata.value.type = "";
      txtregdata.value.year_old = "";
      txtregdata.value.observations = "";
      txtregdata.value.photo = "";
      fotoSeleccionada.value = null;
      getPets();
    } catch (error) {
      updsuccessmsg.value = "";
      upderrormsg.value = error.response.data.message;
    }
    snackbarUpd.value = true;
  };
  
  const selecCliente = async (id) => {
    editando.value = true;
    try {
      const res = await axiosInst.get(url + "api/pet/" + id);
      txtregdata.value = res.data;
      if (res.data.client) {
        search.value = {
          id: res.data.client.id,
          nombre: res.data.client.nombres + " " + (res.data.client.apellidos ?? ""),
          numidentificacion: res.data.client.numidentificacion,
        };
      }
    } catch (err) {
      console.error("Error al obtener mascota:", err);
    }
  };
  
  const getPets = async () => {
    try {
      const res = await axiosInst.get(`${url}api/pet`, {
        params: { page: page.value, searchBenf: searchBenf.value },
      });
      petsList.value = res.data;
    } catch (error) {
      console.error("Error cargando pets", error);
    }
  };
  
  const getLogs = async (petId) => {
    try {
      petLogs.value = [];
      const res = await axiosInst.get(`${url}api/petlog`, {
        params: { pet_id: petId },
      });
      console.log("Respuesta del servidor:", res.data);
      petLogs.value = res.data;
      logForm.value.pet_id = petId;
    } catch (error) {
      console.error("Error cargando logs", error);
    }
  };
  
  const guardarLog = async () => {
    try {
      const response = await axiosInst.post(`${url}api/petlog`, logForm.value);
      petLogs.value.unshift(response.data);
      const currentPetId = logForm.value.pet_id;
      logForm.value = {
        pet_id: currentPetId,
        title: "",
        description: "",
        type: "General",
      };
    } catch (error) {
      alert("Error al guardar");
    }
  };
  
  const deleteCliente = async (id) => {
    let confirmac = confirm("Eliminar?");
    if (confirmac) {
      const res = await axiosInst.delete(url + "api/pet/" + id);
      getPets();
    }
  };
  watch(search, () => {
    if (search.value.length >= 3) {
      buscarCliente();
    }
  });
  
  const reload = () => {
    searchBenf.value = "";
    getPets();
  };
  
  onMounted(() => {
    getPets();
  });
  
  const imprimirQR = (cliente) => {
    // 1. Creamos una ventana nueva (blank)
    const ventana = window.open("", "_blank", "height=600,width=800");
  
    // 1. Escribimos el contenido
    ventana.document.write(`
      <html>
        <head>
          <title>Imprimir QR - ${cliente.name || ""}</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 90vh; 
              margin: 0; 
              font-family: sans-serif;
            }
            img { width: 350px; height: auto; }
            h2 { margin-top: 15px; }
          </style>
        </head>
        <body>
          <img src="${cliente.identifier}" />
          <h2>${cliente.name || ""}</h2>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 300); // Pequeña pausa para que Chrome procese la imagen
            };
            // Se cierra solo DESPUÉS de imprimir o cancelar
            window.onafterprint = function() {
              window.close();
            };
          <\/script>
        </body>
      </html>
    `);
  
    // 2. ¡ESTA LÍNEA ES CLAVE!
    // Le avisa al navegador que termine de cargar el documento.
    ventana.document.close();
  };
  </script>
  <style lang="scss">
  .registerBox {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .pet-card {
    transition: all 0.2s ease-in-out;
  }
  </style>
  