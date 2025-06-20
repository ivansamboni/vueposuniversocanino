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
  AlignRightOutlined


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
}

import { blueGrey, red } from 'vuetify/util/colors';

const sidebarItem: menu[] = [

  {
    title: 'Dashboard',
    icon: BarChartOutlined,
    to: '/dashboard'
  },
  {
    title: 'Vender',
    icon: ShoppingCartOutlined,
    to: '/Vender',
  },

  {
    title: 'Productos',
    icon: ShoppingOutlined,
    children: [
      {
        title: 'Productos',
        icon: ShoppingOutlined,
        to: '/productos'
      },
      {
        title: 'Categorías',
        icon: TagsOutlined,
        to: '/categorias'
      },
      {
        title: 'Proveedores',
        icon: ShopOutlined,
        to: '/proveedores'
      },
      {
        title: 'Marcas',
        icon: AppleOutlined,
        to: '/marcas'
      },
    ],

  },
  {
    title: 'Inventario',
    icon: ScheduleOutlined,
    to: '/compras',
    children: [
      {
        title: 'Stock',
        icon: TableOutlined,
        to: '/stock'
      },
      {
        title: 'Facturas de Compras',
        icon: FileDoneOutlined,
        to: '/compras'
      },
      {
        title: 'Facturas de Ventas',
        icon: OrderedListOutlined,
        to: '/ordenesventa'
      },
      {
        title: 'Ajustes',
        icon: AlignRightOutlined,
        to: '/ajustes'
      },
    ],
  },
  {
    title: 'Clientes',
    icon: TeamOutlined,
    to: '/clientes'
  },
  {
    title: 'Usuarios',
    icon: UserAddOutlined,
    to: '/usuarios'
  },
  {
    title: 'Configuración',
    icon: SettingOutlined,
    to: '/configuracion'
  }
];

export default sidebarItem;
