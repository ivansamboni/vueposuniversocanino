<template>
  <v-container fluid class="bg-grey-lighten-4 pa-6">
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-black text-grey-darken-3">
        <span class="text-primary text-h6 font-weight-medium">Resumen de Negocio</span>
        </h1>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" sm="6" md="4" lg="2" v-for="card in resumen" :key="card.title">
        <v-card :color="card.color" theme="dark" elevation="4" class="rounded-xl overflow-hidden mb-4">
          <div class="pa-4 d-flex flex-column h-100 position-relative">
            <v-icon class="card-background-icon">{{ card.icon }}</v-icon>
            <div class="text-overline text-white-70 font-weight-bold">{{ card.title }}</div>
            <div class="text-h5 font-weight-black mt-1">
              $ {{ parseFloat(card.value || 0).toLocaleString('es-ES') }}
            </div>
            <v-progress-linear color="white" opacity="0.2" class="mt-4 rounded-pill"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="1" class="rounded-xl">
          <v-tabs v-model="tab" color="primary" align-tabs="start" class="px-4 pt-2">
            <v-tab value="semana" class="text-none font-weight-bold">Vista Semanal</v-tab>
            <v-tab value="mes" class="text-none font-weight-bold">Vista Mensual</v-tab>
          </v-tabs>

          <v-window v-model="tab" class="pa-4">
            <v-window-item value="semana">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="text-subtitle-1 font-weight-bold mb-4 ml-2"><v-icon color="success" class="mr-1">mdi-trending-up</v-icon> Ganancias Semanales</div>
                  <apexchart height="300" type="area" :options="getChartOptions('Ganancias', '#4CAF50', Object.keys(gananciasDia))" :series="[{name: 'Ganancias', data: Object.values(gananciasDia)}]" />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-subtitle-1 font-weight-bold mb-4 ml-2"><v-icon color="success" class="mr-1">mdi-cart-check</v-icon> Ventas Semanales</div>
                  <apexchart height="300" type="area" :options="getChartOptions('Ventas', '#3FC469', Object.keys(ventasDia))" :series="[{name: 'Ventas', data: Object.values(ventasDia)}]" />
                </v-col>
              </v-row>
            </v-window-item>

            <v-window-item value="mes">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="text-subtitle-1 font-weight-bold mb-4 ml-2"><v-icon color="primary" class="mr-1">mdi-calendar-check</v-icon> Ganancias del Mes</div>
                  <apexchart height="300" type="area" :options="getChartOptions('Ganancias', '#2196F3', Object.keys(gananciasDiaMes))" :series="[{name: 'Ganancias', data: Object.values(gananciasDiaMes)}]" />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-subtitle-1 font-weight-bold mb-4 ml-2"><v-icon color="primary" class="mr-1">mdi-chart-bar</v-icon> Ventas del Mes</div>
                  <apexchart height="300" type="area" :options="getChartOptions('Ventas', '#27BBF5', Object.keys(ventasDiaMes))" :series="[{name: 'Ventas', data: Object.values(ventasDiaMes)}]" />
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card elevation="1" class="rounded-xl overflow-hidden h-100">
          <v-toolbar color="white" flat>
            <v-icon color="primary" class="ml-4">mdi-star-face</v-icon>
            <v-toolbar-title class="font-weight-bold text-subtitle-1">Top Productos Vendidos</v-toolbar-title>
          </v-toolbar>
          <v-table hover density="comfortable">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th class="text-overline">Producto</th>
                <th class="text-overline text-right">Cant. Vendida</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pro in topProdVendido" :key="pro.producto_id">
                <td class="font-weight-medium text-grey-darken-2">{{ pro.producto.nombre }}</td>
                <td class="text-right">
                  <v-chip size="small" color="primary" variant="flat">
                    {{ Number(pro.total_vendido) % 1 === 0 ? Number(pro.total_vendido) : Number(pro.total_vendido).toFixed(2) }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="1" class="rounded-xl overflow-hidden h-100 border-error">
          <v-toolbar color="white" flat>
            <v-icon color="error" class="ml-4">mdi-alert-octagon</v-icon>
            <v-toolbar-title class="font-weight-bold text-subtitle-1">Alerta de Stock Bajo</v-toolbar-title>
          </v-toolbar>
          <v-table hover density="comfortable">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th class="text-overline">Producto</th>
                <th class="text-overline text-right">Stock Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pro in topStockBajo" :key="pro.producto_id">
                <td class="font-weight-medium text-grey-darken-2">{{ pro.nombre }}</td>
                <td class="text-right">
                  <v-chip size="small" color="error" variant="tonal" class="font-weight-bold">
                    {{ pro.stock }} unidades
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import axiosInst from '@/components/axiosins';

const url = import.meta.env.VITE_APP_API_URL;
const tab = ref('semana');

// Refs de datos
const ganHoy = ref(0); const ganSem = ref(0); const ganMes = ref(0);
const ventaHoy = ref(0); const ventaSem = ref(0); const ventaMes = ref(0);
const gananciasDia = ref({}); const gananciasDiaMes = ref({});
const ventasDia = ref({}); const ventasDiaMes = ref({});
const topProdVendido = ref([]); const topStockBajo = ref([]);

const resumen = computed(() => [
  { title: 'Ganancia Hoy', value: ganHoy.value, color: 'info', icon: 'mdi-currency-usd' },
  { title: 'Venta Hoy', value: ventaHoy.value, color: 'success', icon: 'mdi-cart' },
  { title: 'Ganancia Sem.', value: ganSem.value, color: 'info', icon: 'mdi-chart-line' },
  { title: 'Venta Sem.', value: ventaSem.value, color: 'success', icon: 'mdi-cart-arrow-down' },
  { title: 'Ganancia Mes', value: ganMes.value, color: 'info', icon: 'mdi-calendar-check' },
  { title: 'Venta Mes', value: ventaMes.value, color: 'success', icon: 'mdi-calendar-range' }
]);

// Función maestra para opciones de gráficas
const getChartOptions = (label, color, categories) => ({
  chart: { 
    toolbar: { show: false },
    fontFamily: 'inherit',
    zoom: { enabled: false }
  },
  colors: [color],
  stroke: { curve: 'smooth', width: 3 },
  dataLabels: { 
    enabled: true,
    style: { fontSize: '10px' },
    background: { enabled: true, foreColor: '#000', borderRadius: 2, padding: 4, opacity: 0.9 },    
  },
  xaxis: { categories, labels: { style: { fontSize: '10px', fontWeight: 500 } } },
  yaxis: { labels: { show: false } }, // Ocultamos yaxis para ganar espacio
  grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] }
  }
});

const fetchData = async () => {
  try {
    const [resGan, resVen] = await Promise.all([
      axiosInst.get(url + 'api/gananciasfecha'),
      axiosInst.get(url + 'api/ventasfecha')
    ]);
    console.log(resGan)

    // Asignación de ganancias
    ganHoy.value = resGan.data.gananciaHoy || 0;
    ganSem.value = resGan.data.gananciaSemana || 0;
    ganMes.value = resGan.data.gananciaMes || 0;
    gananciasDia.value = resGan.data.gananciasPorDia || {};
    gananciasDiaMes.value = resGan.data.gananciasPorDiaMes || {};
    topProdVendido.value = resGan.data.masVendido || [];
    topStockBajo.value = resGan.data.topStockBajo || [];

    // Asignación de ventas
    ventaHoy.value = resVen.data.ventaHoy || 0;
    ventaSem.value = resVen.data.ventaSemana || 0;
    ventaMes.value = resVen.data.ventaMes || 0;
    ventasDia.value = resVen.data.ventasPorDia || {};
    ventasDiaMes.value = resVen.data.ventasPorDiaMes || {};
  } catch (error) {
    console.error("Error cargando dashboard:", error);
  }
};

onMounted(() => {
  nextTick(fetchData);
});
</script>

<style scoped>
.card-background-icon {
  position: absolute;
  right: -10px;
  bottom: -10px;
  font-size: 5rem !important;
  opacity: 0.2;
  transform: rotate(-10deg);
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}

/* Animación suave al cambiar pestañas */
.v-window {
  transition: all 0.3s ease-in-out;
}

/* Bordes para alertas de stock */
.border-error {
  border-top: 4px solid #ff5252 !important;
}
</style>