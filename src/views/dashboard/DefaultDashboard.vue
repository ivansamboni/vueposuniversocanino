<template>
    <v-container>
        <v-row>
            <v-col cols="12" sm="4">
                <v-card class="custom-card success">
                    <div class="card-content">
                        <v-icon class="card-icon">mdi-cash-multiple</v-icon>
                        <div>
                            <v-card-title class="text-white">Ganancias de Hoy</v-card-title>
                            <v-card-text class="text-h4 font-weight-bold text-white">
                                ${{ parseFloat(ganHoy).toLocaleString('es-ES') }}
                            </v-card-text>
                        </div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4">
                <v-card class="custom-card info">
                    <div class="card-content">
                        <v-icon class="card-icon">mdi-chart-line</v-icon>
                        <div>
                            <v-card-title class="text-white">Ganancias de la Semana</v-card-title>
                            <v-card-text class="text-h4 font-weight-bold text-white">
                                ${{ parseFloat(ganSem).toLocaleString('es-ES') }}
                            </v-card-text>
                        </div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4">
                <v-card class="custom-card primary">
                    <div class="card-content">
                        <v-icon class="card-icon">mdi-calendar-month</v-icon>
                        <div>
                            <v-card-title class="text-white">Ganancias del Mes</v-card-title>
                            <v-card-text class="text-h4 font-weight-bold text-white">
                                ${{ parseFloat(ganMes).toLocaleString('es-ES') }}
                            </v-card-text>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-card class="custom-card success">
                    <div class="card-content">
                        <v-icon class="card-icon">mdi-cash-multiple</v-icon>
                        <div>
                            <v-card-title class="text-white">Ventas de Hoy</v-card-title>
                            <v-card-text class="text-h4 font-weight-bold text-white">
                                ${{ parseFloat(ventaHoy).toLocaleString('es-ES') }}
                            </v-card-text>
                        </div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4">
                <v-card class="custom-card info">
                    <div class="card-content">
                        <v-icon class="card-icon">mdi-chart-line</v-icon>
                        <div>
                            <v-card-title class="text-white">Ventas de la Semana</v-card-title>
                            <v-card-text class="text-h4 font-weight-bold text-white">
                                ${{ parseFloat(ventaSem).toLocaleString('es-ES') }}
                            </v-card-text>
                        </div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4">
                <v-card class="custom-card primary">
                    <div class="card-content">
                        <v-icon class="card-icon">mdi-calendar-month</v-icon>
                        <div>
                            <v-card-title class="text-white">Ventas del Mes</v-card-title>
                            <v-card-text class="text-h4 font-weight-bold text-white">
                                ${{ parseFloat(ventaMes).toLocaleString('es-ES') }}
                            </v-card-text>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <br>
        <br>
        <v-row>
            <v-col cols="12" sm="12">
                <h3 class="text-center">Ganancias de la semana</h3>
                <apexchart type="bar" height="300" :options="ganSemchart" :series="Semchart"></apexchart>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12">
                <h3 class="text-center">Ventas de la semana</h3>
                <apexchart type="bar" height="300" :options="ventaSemchart" :series="venSemchart"></apexchart>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3 class="text-center">Ganancias del mes</h3>
                <apexchart type="bar" height="300" :options="optionsVentas" :series="ganMeschart"></apexchart>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3 class="text-center">Ventas del mes</h3>
                <apexchart type="bar" height="300" :options="optionsGanVentas" :series="ventMeschart"></apexchart>
            </v-col>
        </v-row>
        <br>
        <v-row>
            <v-col cols="12" sm="6">
                <table>
                    <thead>
                        <tr>
                            <th class="text-left">
                                Producto mas vendidos del mes
                            </th>
                            <th class="text-left">
                                Cant. vendida
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="pro in topProdVendido" :key="pro.producto_id">
                            <td><small>{{ pro.producto.nombre }}</small></td>
                            <td><small>{{ pro.total_vendido }}</small></td>
                        </tr>
                    </tbody>
                </table>
            </v-col>

            <v-col cols="12" sm="6">
                <table>
                    <thead>
                        <tr>
                            <th class="text-left">
                                Productos con stock bajo
                            </th>
                            <th class="text-left">
                                Stock
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="pro in topStockBajo" :key="pro.producto_id">
                            <td><small>{{ pro.nombre }}</small></td>
                            <td><small class="text-error">{{ pro.stock }}</small></td>
                        </tr>
                    </tbody>
                </table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import axiosInst from '@/components/axiosins';

const url = import.meta.env.VITE_APP_API_URL;

const ganHoy = ref('');
const ganSem = ref('');
const ganMes = ref('');
const ventaHoy = ref('');
const ventaSem = ref('');
const ventaMes = ref('');
const gananciasDia = ref([{ "2024-03-01": 0, "2024-03-02": 0, "2024-03-03": 0 }]);
const gananciasDiaMes = ref([{ "2024-03-01": 0, "2024-03-02": 0, "2024-03-03": 0 }]);
const ventasDia = ref([{ "2024-03-01": 0, "2024-03-02": 0, "2024-03-03": 0 }]);
const ventasDiaMes = ref([{ "2024-03-01": 0, "2024-03-02": 0, "2024-03-03": 0 }]);
const topProdVendido = ref([]);
const topStockBajo = ref([]);

/////// chart ganancias de la semana
const ganSemchart = computed(() => ({
    chart: { id: 'vuechart-example' },
    xaxis: { categories: Object.keys(gananciasDia.value) },
    colors: ['#4CAF50'],
    dataLabels: { style: { colors: ['#FFFFFF'] } }
}));

const Semchart = computed(() => [
    { name: 'Ganancias', data: Object.values(gananciasDia.value) }
]);
////////////////////////////////////


/////// chart ganancias del mes
const optionsVentas = computed(() => ({
    chart: { id: 'ganancia-chart' },
    xaxis: { categories: Object.keys(gananciasDiaMes.value) },
    colors: ['#007bff'],
}));

const ganMeschart = computed(() => [
    { name: 'Ganancias', data: Object.values(gananciasDiaMes.value) }
]);
////////////////////////////////

/////// chart ventas de la semana
const ventaSemchart = computed(() => ({
    chart: { id: 'venta-semana' },
    xaxis: { categories: Object.keys(ventasDia.value) },
    colors: ['#007bff'],
    dataLabels: { style: { colors: ['#FFFFFF'] } }
}));

const venSemchart = computed(() => [
    { name: 'Ventas', data: Object.values(ventasDia.value) }
]);
////////////////////////////////////


/////// chart ventas del mes
const optionsGanVentas = computed(() => ({
    chart: { id: 'ventas-chart' },
    xaxis: { categories: Object.keys(ventasDiaMes.value) },
    colors: ['#4CAF50'],
}));

const ventMeschart = computed(() => [
    { name: 'Ventas', data: Object.values(ventasDiaMes.value) }
]);
////////////////////////////////





const gananciaStats = async () => {

    const res = await axiosInst.get(url + 'api/gananciasfecha')
    console.log(res.data)
    ganHoy.value = res.data.gananciaHoy
    ganSem.value = res.data.gananciaSemana
    ganMes.value = res.data.gananciaMes
    gananciasDia.value = res.data.gananciasPorDia
    topProdVendido.value = res.data.masVendido
    gananciasDiaMes.value = res.data.gananciasPorDiaMes
    topStockBajo.value = res.data.topStockBajo
}

const ventasStats = async () => {

    const res = await axiosInst.get(url + 'api/ventasfecha')
    console.log(res.data)
    ventaHoy.value = res.data.ventaHoy
    ventaSem.value = res.data.ventaSemana
    ventaMes.value = res.data.ventaMes
    ventasDia.value = res.data.ventasPorDia
    ventasDiaMes.value = res.data.ventasPorDiaMes
}

onMounted(async () => {
    await nextTick();
    gananciaStats(), ventasStats()
});


</script>

<style scoped>
.custom-card {
    position: relative;
    padding: 20px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    z-index: 2;
}

.card-icon {
    position: absolute;
    right: 10px;
    bottom: 10px;
    font-size: 5rem;
    opacity: 0.2;
}

.success {
    background: rgba(76, 175, 80, 0.9);
}

.info {
    background: rgba(33, 150, 243, 0.9);
}

.primary {
    background: rgba(63, 81, 181, 0.9);
}
</style>
