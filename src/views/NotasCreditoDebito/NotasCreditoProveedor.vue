<template>
  <v-container fluid class="bg-grey-lighten-4 py-8">
    <v-row justify="center">
      <v-col cols="12" lg="12">
        <v-card elevation="2" class="rounded-xl mb-6 pa-2">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="8">
                <v-text-field v-model="txtregdata.factura_numero" label="Número o código de factura"
                  placeholder="Ej: FE-1234" variant="outlined" color="primary"
                  prepend-inner-icon="mdi-file-search-outline" hide-details @keyup.enter="searchCodigo" />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn color="primary" size="large" block elevation="0" class="rounded-lg text-none"
                  @click="searchCodigo" :loading="spinner">
                  <v-icon left class="mr-2">mdi-magnify</v-icon>
                  Consultar Documento
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-expand-transition>
          <div v-if="facturaEncontrada">
            <v-card class="rounded-xl elevation-4 mb-6 overflow-hidden">
              <v-toolbar color="grey-darken-3" dark flat>
                <v-icon class="ml-4">mdi-receipt</v-icon>
                <v-toolbar-title class="text-subtitle-1 font-weight-bold">
                  Documento Original: {{ datosCompra.factura_numero }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-chip color="success" class="mr-4" variant="flat" size="small">
                  {{ datosCompra.status }}
                </v-chip>
              </v-toolbar>

              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="12" md="4" class="border-right">
                    <div class="text-caption text-grey">Proveedor</div>
                    <div class="text-subtitle-1 font-weight-black">{{ datosCompra.proveedor }}</div>
                  </v-col>
                  <v-col cols="12" md="4" class="border-right">
                    <div class="text-caption text-grey">Fecha de Compra</div>
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ new Date(datosCompra?.order_date).toLocaleString('es-CO') }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="text-caption text-grey">Condición de Pago</div>
                    <div class="text-subtitle-1 font-weight-medium text-uppercase">{{
                      datosCompra.forma_pago_nombre }} - {{ datosCompra.metodo_pago_nombre }}</div>
                  </v-col>
                </v-row>

                <v-table density="compact" class="mt-6 border rounded-lg">
                  <thead class="bg-grey-lighten-4">
                    <tr>
                      <th>Código</th>
                      <th>Artículo</th>
                      <th>U/M</th>
                      <th class="text-center">Cant.</th>
                      <th class="text-right">Precio unitario</th>
                      <th class="text-right">Iva</th>
                      <th class="text-right">Subtotal</th>
                      <th class="text-center">Seleccionar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, i) in itemsFactura" :key="i">
                      <td>
                        <div class="text-caption text-grey">{{ item.codigo_barras }}</div>
                      </td>
                      <td>
                        {{ item.nombre }}
                      </td>
                      <td>
                        {{ item.unidad_medida }}
                      </td>
                      <td class="text-center">{{ item.cantidad }}</td>
                      <td class="text-right">{{ formato(item.precio_final) }}</td>
                      <td class="text-right">{{ (item.iva) ?? '0' }}%</td>
                      <td class="text-right">${{ (
                        (Number(item.cantidad) * Number(item.precio_final)) * (1 +
                          (Number(item.iva ?? 0) / 100))
                      ).toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                      }}</td>
                      <td class="text-center">
                        <v-btn icon="mdi-plus-circle" color="primary" variant="text"
                          @click="agregarASeleccionados(item)" />
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>

            <v-card class="rounded-xl elevation-8 border-left-nota overflow-hidden">
              <v-toolbar color="primary" flat>
                <v-icon class="ml-4">mdi-pencil-box-multiple</v-icon>
                <v-toolbar-title class="text-subtitle-1 font-weight-bold">
                  Creación de Nota
                </v-toolbar-title>
              </v-toolbar>

              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="12" md="4">
                    <v-toolbar-title class="text-subtitle-1 font-weight-bold">
                      Documento Referencia: {{ datosCompra.factura_numero }}
                    </v-toolbar-title>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="text-caption text-grey">Proveedor :{{ datosCompra.proveedor }}</div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="datosNota.fecha_emision" type="date" label="Fecha Emisión"
                      variant="underlined"></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <br>
                  <v-col cols="12" md="4">
                    <v-select v-model="datosNota.customization_id" :items="tipoNotas" label="Tipo de Nota (DIAN)"
                      item-title="title" item-value="value" variant="outlined"
                      @update:model-value="val => datosNota.tipo = (val === 20 ? 'credito' : 'debito')" />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select v-model="datosNota.correction_concept_code" :items="motivosNotaCredito"
                      label="Concepto corrección" item-title="title" item-value="value" variant="outlined" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select v-model="datosNota.payment_method_code" :items="metodosPago"
                      label="Método de Compensación" item-title="title" item-value="value" variant="outlined" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="datosNota.referencia_proveedor" label="Ref. Proveedor" variant="outlined"
                      @input="datosNota.referencia_proveedor = $event.target.value.toUpperCase()"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="datosNota.motivo" label="Observación" variant="underlined"></v-text-field>
                  </v-col>
                </v-row>

                <div class="d-flex align-center my-4">
                  <div class="text-h6 font-weight-bold text-primary">Items para Ajuste</div>
                  <v-spacer></v-spacer>
                  <v-chip variant="tonal" color="primary" v-if="itemselected.length > 0">
                    {{ itemselected.length }} productos seleccionados
                  </v-chip>
                </div>

                <v-table v-if="itemselected.length > 0" class="border rounded-lg shadow-inner">
                  <thead class="bg-indigo-lighten-5">
                    <tr>
                      <th>Código</th>
                      <th>Artículo</th>
                      <th>U/M</th>
                      <th class="text-center">Cant. Devolver</th>
                      <th class="text-right">Precio Unit.</th>
                      <th class="text-right">Iva</th>
                      <th class="text-right">Total</th>
                      <th class="text-right">Sale de Stock</th>
                      <th class="text-center">Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in itemselected" :key="item.id">
                      <td>{{ item.codigo_barras }}</td>
                      <td>{{ item.nombre }}</td>
                      <td>{{ item.unidad_medida }}</td>
                      <td class="text-center">
                        <v-text-field v-model.number="item.cantidad" type="number" density="compact" hide-details
                          variant="solo" flat bg-color="grey-lighten-4" class="centered-input"
                          :max="item.cantidad_maxima" min="1" @input="validarCantidad(item)"></v-text-field>
                        <div class="text-caption text-error font-weight-bold mt-1">
                          Máx: {{ item.cantidad_maxima }}
                        </div>
                      </td>
                      <td class="text-right">{{ formato(item.precio_compra) }}</td>
                      <td class="text-right">{{ (item.iva) ?? '0' }}%</td>
                      <td class="text-right font-weight-bold">
                        ${{ (
                        (Number(item.cantidad) * Number(item.precio_compra)) * (1 +
                          (Number(item.iva ?? 0) / 100))
                      ).toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                      }}
                      </td>
                      <td class="text-center">
                        <v-checkbox label="Sale" v-model="item.sale_stock" color="primary"></v-checkbox>
                      </td>
                      <td class="text-center">
                        <v-btn icon="mdi-close-circle" color="error" variant="text" @click="deleteItem(item.id)" />
                      </td>
                    </tr>
                  </tbody>
                </v-table>

                <v-alert v-else type="info" variant="tonal"
                  text="No has seleccionado productos. Usa el icono (+) en la factura original." class="mt-4"></v-alert>

                <v-divider class="my-6"></v-divider>

                <div class="d-flex justify-end align-center">
                  <div class="text-right mr-6">
                    <div class="text-caption text-grey text-uppercase">Total Ajuste</div>
                    <div class="text-h4 font-weight-black text-primary">
                      $ {{ parseFloat(totalfactura).toLocaleString('es-ES') }}
                    </div>
                  </div>
                  <v-btn color="success" size="x-large" block :disabled="!notaEsValida" @click="crearNota()">
                    Confirmar y Crear Nota
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-expand-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import axiosInst from '@/components/axiosins'
import useRegister from '@/composables/useRegister'
import { CodigosDian } from '@/composables/CodigosDian'



const { metodosPago, formasPago, tipoNotas, motivosNotaCredito } = CodigosDian();

const url = import.meta.env.VITE_APP_API_URL

const txtregdata = ref({
  factura_numero: ''
})
const datosNota = ref({
  factura_numero: '',
  purchase_id: '',
  fecha_emision: new Date().toISOString().substr(0, 10),
  seller_id: '',
  referencia_proveedor: '',
  tipo: 'credito',
  customization_id: 20,
  motivo: null,
  correction_concept_code: null,
  payment_method_code: '10', // 10 = Efectivo (estándar)
  bill_id_factus: '',        // Se llenará al buscar la factura
  numbering_range_id: 5      // El ID de tu resolución de notas en Factus
})

const datosCompra = ref({
  factura_numero: '',
  proveedor_id: '',
  order_date: '',
  proveedor: '',
  tipo_pago: '',
  tipo_compra: '',
  status: '',
})

const itemsFactura = ref([])
const itemselected = ref([])
const proveedor_id = ref(null)
const facturaEncontrada = ref(false)
const spinner = ref(false)
const snackbarReg = ref(false)
const regerrormsg = ref('')
const emit = defineEmits(['loadNotas']);


const formato = (valor) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(valor || 0)
}
const notaEsValida = computed(() => {
  return itemselected.value.length > 0 &&
    itemselected.value.every(i => i.cantidad <= i.cantidad_maxima && i.cantidad > 0) &&
    datosNota.value.motivo &&
    datosNota.value.payment_method_code;
});

const totalfactura = computed(() => {
  return itemselected.value.reduce((acc, item) => {
    const subtotal = Number(item.precio_compra) * Number(item.cantidad)
    return acc + subtotal
  }, 0)
})


const searchCodigo = async () => {
  if (!txtregdata.value.factura_numero) {
    alert('Ingrese el número o código de factura a buscar')
    return
  }

  spinner.value = true
  try {
    const res = await axiosInst.get(`${url}api/comprasearch/${txtregdata.value.factura_numero}`)
    console.log(res.data)
    // Validamos que res.data tenga contenido
    if (!res.data) {
      throw new Error('La respuesta del servidor está vacía');
    }

    const compra = res.data; // <--- Inicialización clara

    // Ahora asignamos a los refs usando la constante 'compra'
    datosCompra.value = {
      id: compra.id,
      factura_numero: compra.factura_numero,
      order_date: compra.order_date,
      forma_pago_nombre: compra.forma_pago_nombre,
      metodo_pago_nombre: compra.metodo_pago_nombre,
      tipo_compra: compra.tipo_compra,
      status: compra.status,
      total: compra.total,
      proveedor: compra.seller ? `${compra.seller.nombres} ${compra.seller.apellidos || ''}`.trim() : 'Proveedor no registrado'
    };

    // Actualizamos datosNota con los campos técnicos para Factus
    datosNota.value.seller_id = compra.seller_id;
    datosNota.value.purchase_id = compra.id;
    datosNota.value.bill_id_factus = compra.bill_id_factus || ''; // Campo nuevo de la migración

    // Mapeamos los productos
    itemsFactura.value = (compra.purchasedetails || []).map((det) => ({
      id: det.producto_id,
      nombre: det.producto?.nombre || 'Producto sin nombre',
      unidad_medida: det.producto.unidad_medida,
      codigo_barras: det.producto?.codigo_barras || 'S/N',
      iva: det.producto.iva?.valor, // Asegúrate que este sea el % (ej: 19)
      cantidad: det.cantidad,
      precio_final: det.precio_unitario
    }));

    facturaEncontrada.value = true;
    regerrormsg.value = 'Factura cargada correctamente';
    snackbarReg.value = true;

  } catch (error) {
    console.error('Error al buscar factura:', error);
    facturaEncontrada.value = false;
    regerrormsg.value = error.response?.data?.message || 'Error al buscar la factura';
    snackbarReg.value = true;
  } finally {
    spinner.value = false;
  }
};


const agregarASeleccionados = (producto) => {
  const existe = itemselected.value.find(item => item.id === producto.id);
  if (!existe) {
    itemselected.value.push({
      id: producto.id,
      nombre: producto.nombre,
      unidad_medida: producto.unidad_medida,
      codigo_barras: producto.codigo_barras,
      iva: producto.iva,
      cantidad: 1, // Empezar con 1 es más seguro para el usuario
      precio_compra: producto.precio_final,
      cantidad_maxima: producto.cantidad,
      sale_stock: true
    });

  }
  const validarCantidad = (item) => {
    if (item.cantidad > item.cantidad_maxima) {
      item.cantidad = item.cantidad_maxima;
      alert(`La cantidad máxima permitida es ${item.cantidad_maxima}`);
    }
    if (item.cantidad < 1 || !item.cantidad) {
      item.cantidad = 1;
    }
  };
};

const deleteItem = (id) => {
  const index = itemselected.value.findIndex(item => item.id === id);
  if (index !== -1) {
    itemselected.value.splice(index, 1);
  }
};

const crearNota = async () => {

  const confirmar = confirm(`¿Crear nota ${datosNota.value.tipo} para esta factura?`)
  if (!confirmar) return

  try {
    const payload = {
      datosNota: datosNota.value,
      itemselected: itemselected.value
    };
    const res = await axiosInst.post(url + 'api/notas', payload)
    snackbarReg.value = true
    regerrormsg.value = `Nota ${datosNota.value.tipo} creada correctamente`
    emit('loadNotas');
  } catch (error) {
    snackbarReg.value = true
    console.log(error.response?.data?.message)
    error.response?.data?.message
  }
}

watch(itemselected, (nuevaLista) => {
  nuevaLista.forEach((item) => {
    const ventaUsuario = parseFloat(item.precio_venta) || 0;
    const compra = parseFloat(item.precio_compra) || 0;

    if (!ventaUsuario || compra <= 0) {
      item.ganancia = 0;
      return;
    }

    const ivaPorcentaje = parseFloat(item.iva) / 100 || 0;
    const ibuaPorcentaje = parseFloat(item.ibua) / 100 || 0;
    const ipcPorcentaje = parseFloat(item.ipc) / 100 || 0;

    const totalImpuestos = ivaPorcentaje + ibuaPorcentaje + ipcPorcentaje;
    const divisor = 1 + totalImpuestos;

    const redondear = (precio) => {
      return precio < 100 ? parseFloat(precio.toFixed(2)) : Math.round(precio / 100) * 100;
    };

    const precioFinal = redondear(ventaUsuario * divisor);
    const baseCalculado = precioFinal / divisor;

    const iva = baseCalculado * ivaPorcentaje;
    const ibua = baseCalculado * ibuaPorcentaje;
    const ipc = baseCalculado * ipcPorcentaje;

    item.precio_venta_ajustado = baseCalculado.toFixed(2);
    item.iva_calculado = iva.toFixed(2);
    item.ibua_calculado = ibua.toFixed(2);
    item.ipc_calculado = ipc.toFixed(2);
    item.precio_final = precioFinal;

    // ✅ Ganancia basada en precio de venta digitado por el usuario (sin impuestos)
    item.ganancia = (ventaUsuario - compra).toFixed(2);
  });
}, { deep: true });


</script>
<style scoped>
.border-right {
  border-right: 1px solid #e0e0e0;
}

.border-left-nota {
  border-left: 8px solid #303f9f;
  /* Color Indigo para indicar acción */
}

.centered-input :deep(input) {
  text-align: center;
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

@media (max-width: 960px) {
  .border-right {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 15px;
  }
}
</style>