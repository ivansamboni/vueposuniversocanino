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
      name: 'ordenesVentas',
      path: '/ordenesventa',
      component: () => import('@/views/ordenesventa/ordenesventa.vue')
    },
    {
      name: 'Productos',
      path: '/productos',
      component: () => import('@/views/Productos/Productos.vue')
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
  ]
};

export default MainRoutes;
