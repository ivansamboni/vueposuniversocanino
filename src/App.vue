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
    overflow-x: auto;
}

.table {
    width: 100%;
    min-width: 600px; /* ajusta según tus columnas */
    border-collapse: collapse;
    border: 1px solid #ddd;
}

th,
td {
    padding: 8px;
    border: 1px solid #ddd;
}

th {
    background-color: #f4f4f4;
}

.text-left {
    text-align: left;
}

.text-right {
    text-align: right;
}

.v-progress-circular {
    margin: 1rem;
}
</style>
