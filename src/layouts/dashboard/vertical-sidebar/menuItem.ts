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
  FileSyncOutlined
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
  { title: 'Vender', icon: ShoppingCartOutlined, to: '/vender' },
  { title: 'Cuadre de Cajas', icon: DesktopOutlined, to: '/cajas' },
  { title: 'Historial Ventas', icon: OrderedListOutlined, to: '/ordenesventa' },
  { title: 'Directorio Clientes', icon: TeamOutlined, to: '/clientes' },
  { title: 'Cuentas por Cobrar', icon: ContactsOutlined, to: '/cartera' },

  // --- SECCIÓN ADMINISTRATIVA (Solo Admin) ---
  ...(role === 'ADMIN'
    ? [
        { title: 'Dashboard', icon: BarChartOutlined, to: '/dashboard' },
        { title: 'Productos', icon: ShoppingOutlined, to: '/productos' },
        { title: 'Categorías', icon: TagsOutlined, to: '/categorias' },
        { title: 'Proveedores', icon: ShopOutlined, to: '/proveedores' },
        { title: 'Stock Actual', icon: TableOutlined, to: '/stock' },
        { title: 'Entrada de Compras', icon: FileDoneOutlined, to: '/compras' },
        { title: 'Ajustes de Inventario', icon: AlignRightOutlined, to: '/ajustes' },
        { title: 'Devoluciones', icon: FileSyncOutlined, to: '/devolucionesaproveedor' },
        { title: 'Cuentas por Pagar', icon: ContactsOutlined, to: '/cuentasporpagar' },
        { title: 'Balance General', icon: RiseOutlined, to: '/balance' },
        { title: 'Control de Gastos', icon: CalculatorOutlined, to: '/gastos' },
        { title: 'Gestión de Usuarios', icon: UserAddOutlined, to: '/usuarios' }
      ]
    : [])
];

export default sidebarItem;
