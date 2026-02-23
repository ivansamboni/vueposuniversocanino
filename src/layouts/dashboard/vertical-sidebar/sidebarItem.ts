// icons
import {
  TagsOutlined,
  AppleOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  SettingOutlined,
  ShopOutlined,
  TableOutlined,
  FileDoneOutlined,
  ScheduleOutlined,
  UserAddOutlined,
  AlignRightOutlined,
  DesktopOutlined,
  ContactsOutlined,
  FundOutlined,
  CalculatorOutlined,
  RiseOutlined,
  ExportOutlined,
  ImportOutlined,
  FilePptOutlined,
  CalendarOutlined,
  BugOutlined
} from '@ant-design/icons-vue';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
  href?: string; // enlaces externos
  target?: string;
}

const userString = localStorage.getItem('user');
const user = userString ? JSON.parse(userString) : null;
const role = user?.role || '';

const sidebarItem: menu[] = [
  // --- SECCIÓN OPERATIVA (Cajeros y Admin) ---
  { header: 'Operación Diaria' },
  {
    title: 'Punto de Venta',
    icon: ShoppingCartOutlined,
    children: [
      { title: 'Vender', icon: ShoppingCartOutlined, to: '/vender' },
      { title: 'Cuadre de Cajas', icon: DesktopOutlined, to: '/cajas' },
      { title: 'Historial Ventas', icon: OrderedListOutlined, to: '/ordenesventa' },
      { title: 'Subscripciones', icon: CalendarOutlined, to: '/subscripciones' },
      { title: 'Cuentas por Cobrar', icon: ContactsOutlined, to: '/cartera' }
    ]
  },
  {
    title: 'Dir. Clientes',
    icon: TeamOutlined,
    children: [
      { title: 'Clientes', icon: TeamOutlined, to: '/clientes' },
      { title: 'Mascotas', icon: BugOutlined, to: '/beneficiarios' },
      
    ]
  },

  // --- SECCIÓN ADMINISTRATIVA (Solo Admin) ---
  ...(role === 'ADMIN'
    ? [
        { header: 'Administración' },
        {
          title: 'Dashboard',
          icon: BarChartOutlined,
          to: '/dashboard'
        },
        {
          title: 'Catálogo', // Aquí agrupas lo que "existe"
          icon: ShoppingOutlined,
          children: [
            { title: 'Productos', icon: ShoppingOutlined, to: '/productos' },     
            { title: 'Planes', icon: FilePptOutlined, to: '/planes' },         
            { title: 'Categorías', icon: TagsOutlined, to: '/categorias' },
            { title: 'Marcas', icon: AppleOutlined, to: '/marcas' },
            { title: 'Proveedores', icon: ShopOutlined, to: '/proveedores' }
          ]
        },
        {
          title: 'Inventario', // Aquí lo que "se mueve"
          icon: ScheduleOutlined,
          children: [
            { title: 'Stock Actual', icon: TableOutlined, to: '/stock' },
            { title: 'Entrada de Compras', icon: FileDoneOutlined, to: '/compras' },
            { title: 'Ajustes de Inventario', icon: AlignRightOutlined, to: '/ajustes' },
            { title: 'Devoluc. Proveedor', icon: ExportOutlined, to: '/devolucionesaproveedor' },
            { title: 'Devoluc. Clientes', icon: ImportOutlined, to: '/devolucionescliente' },
            { title: 'Cuentas por Pagar', icon: ContactsOutlined, to: '/cuentasporpagar' }
          ]
        },
        {
          title: 'Finanzas',
          icon: FundOutlined,
          children: [
            { title: 'Balance General', icon: RiseOutlined, to: '/balance' },
            { title: 'Control de Gastos', icon: CalculatorOutlined, to: '/gastos' }
          ]
        },
        {
          title: 'Sistema',
          icon: SettingOutlined,
          children: [
            { title: 'Configuración POS', icon: SettingOutlined, to: '/configuracion' },
            { title: 'Gestión de Usuarios', icon: UserAddOutlined, to: '/usuarios' }
          ]
        }
      ]
    : [])
];

export default sidebarItem;
