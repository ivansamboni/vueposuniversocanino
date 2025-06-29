<template>
    <RouterView></RouterView>
</template>

<style>
body {
    font-family: Arial, sans-serif;
    margin: 20px;
}

.table-responsive {
    width: 100%;
    max-height: 400px; /* Altura máxima para activar scroll vertical */
    overflow-y: auto;
    overflow-x: auto;
}

/* Aplica sticky solo al header */
.table th {
    position: sticky;
    top: 0;
    background-color: #f4f4f4;
    z-index: 10;
}

.table {
    width: 100%;
    min-width: 600px; /* Ajusta según necesidad */
    border-collapse: collapse;
    border: 1px solid #ddd;
}

th,
td {
    padding: 8px;
    border: 1px solid #ddd;
}

.text-left {
    text-align: left;
}

.text-right {
    text-align: right;
}

/* Extra: si usas Vuetify */
.v-progress-circular {
    margin: 1rem;
}

</style>
