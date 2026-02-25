const MainRoutes = {

  path: '/main',
  meta: {
    requiresAuth: true  //requiredRole: 'ADMIN'
    },
  redirect: '/main',
  component: () => import('@/layouts/dashboard/DashboardLayout.vue'),
  children: [
    {
      name: 'Dashboard',
      path: '/dashboard',
      component: () => import('@/views/dashboard/DefaultDashboard.vue')
    },
    {
      name: 'EditarPerfil',
      path: '/editarperfil',
      component: () => import('@/views/EditarPerfil/EditarPerfilPage.vue')
    },
    {
      name: 'Vender',
      path: '/vender',
      component: () => import('@/views/Vender/Vender.vue')
    },
    {
      name: 'Cajas',
      path: '/cajas',
      component: () => import('@/views/Vender/Caja.vue')
    },
    {
      name: 'Cartera',
      path: '/cartera',
      component: () => import('@/views/cartera/Cartera.vue')
    },
    {
      name: 'ordenesVentas',
      path: '/ordenesventa',
      component: () => import('@/views/ordenesventa/ordenesventa.vue')
    },
    {
      name: 'subscripciones',
      path: '/subscripciones',
      component: () => import('@/views/ordenesventa/Subscribsiones.vue')
    },
    {
      name: 'Productos',
      path: '/productos',
      component: () => import('@/views/Productos/Productos.vue')
    },
    {
      name: 'Planes',
      path: '/planes',
      component: () => import('@/views/Productos/Planes.vue')
    },
    {
      name: 'Stock',
      path: '/stock',
      component: () => import('@/views/Stock/Stock.vue')
    },
    {
      name: 'Compras',
      path: '/compras',
      component: () => import('@/views/Compras/Compras.vue')
    },
    {
      name: 'DevolucionesProvedor',
      path: '/devolucionesaproveedor',
      component: () => import('@/views/NotasCreditoDebito/DevolucionesProveedor.vue')
    },
    {
      name: 'DevolucionesCliente',
      path: '/devolucionescliente',
      component: () => import('@/views/NotasCreditoCliente/DevolucionesCliente.vue')
    },
    {
      name: 'Gastos',
      path: '/gastos',
      component: () => import('@/views/Gastos/Gastos.vue')
    },
    {
      name: 'Balance',
      path: '/balance',
      component: () => import('@/views/dashboard/Balance.vue')
    },
    {
      name: 'Ajustes',
      path: '/ajustes',
      component: () => import('@/views/Ajustes/Ajustes.vue')
    },
    {
      name: 'Categorias',
      path: '/categorias',
      component: () => import('@/views/Categorias/Categorias.vue')
    },

    {
      name: 'Marcas',
      path: '/marcas',
      component: () => import('@/views/Marcas/Marcas.vue')
    },
    {
      name: 'Clientes',
      path: '/clientes',
      component: () => import('@/views/Clientes/Clientes.vue')
    },
    {
      name: 'Beneficiarios',
      path: '/beneficiarios',
      component: () => import('@/views/Clientes/Beneficiaros.vue')
    },
    {
      name: 'Proveedores',
      path: '/proveedores',
      component: () => import('@/views/Proveedores/Proveedores.vue')
    },
    {
      name: 'Configurar',
      path: '/configuracion',
      component: () => import('@/views/configurar/Configurar.vue'),     
    },
    {
      name: 'Usuarios',
      path: '/usuarios',
      component: () => import('@/views/Usuarios/Usuarios.vue')
    },
    {
      name: 'Noautorizado',
      path: '/noautorizado',
      component: () => import('@/views/pages/Inautorized.vue')
    },
    {
      name: 'index',
      path: '/index',
      component: () => import('@/views/pages/Index.vue')
    },
    {
      name: 'cuentasporpagar',
      path: '/cuentasporpagar',
      component: () => import('@/views/cuentasporpagar/Cuentasporpagar.vue')
    },
  ]
};

export default MainRoutes;
