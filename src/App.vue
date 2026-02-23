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
    max-height: 400px;
    overflow-y: auto;
    overflow-x: auto;
}

/* Aplica sticky solo al header */
.table th {
    position: sticky;
    top: 0;
    background-color: rgba(27, 150, 221, 0.445);
    z-index: 10;
}

.table {
    width: 100%;
    min-width: 600px;
    border-collapse: collapse;
    border: 1px solid #ddd;
    line-height: 1.2; /* Reduce el espacio entre líneas de texto */
}

th,
td {
    padding: 4px 8px; /* 4px arriba/abajo (menos espacio), 8px a los lados */
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
@keyframes parpadeo {
  0% { opacity: 1; }
  70% { opacity: 0.4; }
  100% { opacity: 1; }
}

.clase-parpadeo {
  animation: parpadeo 2s infinite;
}
</style>
