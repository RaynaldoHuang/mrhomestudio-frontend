import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"

export const navigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Products",
        href: "/products",
        icon: Package,
      },
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
]