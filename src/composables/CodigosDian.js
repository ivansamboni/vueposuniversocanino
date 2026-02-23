// src/composables/useDianCodes.js
export function CodigosDian() {
  const formasPago = [
      { title: 'Contado', value: '1' },
      { title: 'Crédito', value: '2' },
  ];
  
  const metodosPago = [
      { title: 'Efectivo', value: '10' },
      { title: 'Transferencia Bancaria', value: '47' }, 
      { title: 'Tarjeta Débito', value: '49' },
      { title: 'Tarjeta Crédito', value: '48' },
      { title: 'Cruce de Cuentas', value: '1' },
  ];

  const tipoNotas = [
      { title: 'Referencia a factura electrónica', value: 20 },
      { title: 'Sin referencia a factura', value: 22 },
  ];
    
  const motivosNotaCredito = [
      { value: 1, title: 'Devolución parcial de bienes o servicios' },
      { value: 2, title: 'Anulación de factura electrónica' },
      { value: 3, title: 'Rebaja o descuento total o parcial' },
      { value: 4, title: 'Ajuste de precio' },
      { value: 5, title: 'Otros' }
  ];

  // Función auxiliar para obtener el nombre del motivo por su ID
  const getMotivoTitle = (id) => {
      return motivosNotaCredito.find(m => m.value === id)?.title || 'No definido';
  };

  return {
      formasPago,
      metodosPago,
      tipoNotas,
      motivosNotaCredito,
      getMotivoTitle
  };
}