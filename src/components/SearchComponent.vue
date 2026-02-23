<template>
    <v-col :cols="cols" :md="md">
      <v-text-field
        v-model="searchText"
        :label="label"
        :color="color"
        :variant="variant"
        :append-inner-icon="icon"        
      />
    </v-col>
  </template>
  
  <script setup>
  import { ref, watch } from "vue";
  
  const props = defineProps({
    modelValue: String, // para v-model
    label: { type: String, default: "Buscar..." },
    icon: { type: String, default: "mdi-magnify" },
    color: { type: String, default: "primary" },
    variant: { type: String, default: "underlined" },
    cols: { type: Number, default: 12 },
    md: { type: Number, default: 3 },
    minChars: { type: Number, default: 3 }, // mínimo de caracteres antes de emitir
  });
  
  const emit = defineEmits(["update:modelValue", "search"]);
  
  const searchText = ref(props.modelValue || "");
  
  // Sincroniza con el padre
  watch(searchText, (val) => {
    emit("update:modelValue", val);
  
    if (val.length >= props.minChars) {
      emit("search", val); // dispara el evento con el texto
    }
  });
  
  // Para mantener v-model reactivo
  watch(
    () => props.modelValue,
    (val) => {
      if (val !== searchText.value) {
        searchText.value = val;
      }
    }
  );
  </script>