<template>
<v-container>
    <v-row>     
      <v-col cols="12" md="3">
        <v-chip label color="primary" text-color="primary">
          <v-icon left>icon</v-icon> Fecha inicial
        </v-chip>
        <input type="date" v-model="fechaini">
      </v-col>
      <v-col cols="12" md="3">
        <v-chip label color="primary" text-color="primary">
          <v-icon left>icon</v-icon> Fecha final
        </v-chip>
        <input type="date" v-model="fechafin">
      </v-col>
      <v-col cols="12" md="1">
        <v-btn color="primary" @click="fetchBalance()">Filtrar</v-btn>
      </v-col>
           
    </v-row>
  </v-container>

    <v-container fluid>
        <v-row>
            <!-- Ganancia -->
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4" color="green lighten-5" elevation="3">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Ganancia Mes</v-card-title>
                    <v-card-text class="text-h6 text-success">
                        {{ formatCurrency(balance.gananciaMes) }}
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Compras -->
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4" color="blue lighten-5" elevation="3">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Gastos Mes</v-card-title>
                    <v-card-text class="text-h6 text-error">
                        {{ formatCurrency(balance.gastosMes) }}
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Compras -->
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4" color="blue lighten-5" elevation="3">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Compras Mes</v-card-title>
                    <v-card-text class="text-h6 text-error">
                        {{ formatCurrency(balance.comprasMes) }}
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Créditos pendientes -->
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4" color="orange lighten-5" elevation="3">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Créditos Pendientes</v-card-title>
                    <v-card-text class="text-h6 orange--text text-warning">
                        {{ formatCurrency(balance.creditosPendientes) }}
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="6">
                <v-card class="pa-4" color="purple lighten-5" elevation="3">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Balance Mes</v-card-title>
                    <v-card-text class="text-h6" :class="balance.balanceMes >= 0 ? 'text-success' : 'text-error'">
                        {{ formatCurrency(balance.balanceMes) }}
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Balance caja -->
            <v-col cols="12" sm="6" md="6">
                <v-card class="pa-4" color="purple lighten-5" elevation="3">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Balance Caja del mes</v-card-title>
                    <v-card-text class="text-h6" :class="balance.balanceMes >= 0 ? 'text-success' : 'text-error'">
                        {{ formatCurrency(balance.balanceCajaMes) }}
                    </v-card-text>
                </v-card>
            </v-col>

        </v-row>

        <!-- Chart -->
        <v-row class="mt-6">
            <v-col cols="12">
                <v-card>
                    <v-card-title class="text-subtitle-1 font-weight-bold">
                        Resumen Financiero del Mes
                    </v-card-title>
                    <v-card-text>
                        <apexchart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosInst from "@/components/axiosins";
const url = import.meta.env.VITE_APP_API_URL;

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Asignar valores iniciales
const fechaini = ref(formatDate(firstDay)); // inicio del mes
const fechafin = ref(formatDate(today));   

const balance = ref({
    gananciaMes: 0,
    comprasMes: 0,
    gastosMes: 0,
    balanceMes: 0,
    creditosPendientes: 0,
    balanceCajaMes: 0,
});

const chartSeries = ref([]);
const chartOptions = ref({
    chart: {
        type: "bar",
        toolbar: { show: false },
    },
    plotOptions: {
        bar: {
            borderRadius: 6,
            horizontal: false,
            columnWidth: "55%",
        },
    },
    dataLabels: {
        enabled: true,
        formatter: (val) => "$" + val.toLocaleString("es-CO"),
    },
    xaxis: {
        categories: [
            "Ganancia",
            "Compras",
            "Gastos",
            "Balance Contable",
            "Créditos",
            "Balance Caja",
        ],
    },
    colors: [
        "#16a34a", // verde ganancia
        "#2563eb", // azul compras
        "#dc2626", // rojo gastos
        "#7c3aed", // morado balance contable
        "#ca8a04", // amarillo créditos
        "#059669", // verde caja
    ],
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
    }).format(value);
};

const fetchBalance = async () => {
    try {
        const { data } = await axiosInst.post(url + "api/balances", {
      fechaini: fechaini.value,
      fechafin: fechafin.value
    });
    console.log(data.data)
        balance.value = data;
        chartSeries.value = [
            {
                name: "Valores",
                data: [
                    data.gananciaMes,
                    data.comprasMes,
                    data.gastosMes,
                    data.balanceMes,
                    data.creditosPendientes,
                    data.balanceCajaMes,
                ],
            },
        ];
    } catch (error) {
        console.error("Error cargando balance:", error);
    }
};

onMounted(fetchBalance);
</script>


<style scoped>
.grid>div {
    transition: transform 0.2s;
}

.grid>div:hover {
    transform: scale(1.05);
}
</style>