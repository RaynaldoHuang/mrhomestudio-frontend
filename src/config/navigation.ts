import {
  LayoutDashboard,
  Images,
  PanelTop,
  Package,
  Tags,
} from "lucide-react"

export const navigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Website Content",
    items: [
      {
        title: "Carousel",
        href: "/admin/carousels",
        icon: Images,
      },
      {
        title: "Mega Menu",
        href: "/admin/mega-menus",
        icon: PanelTop,
      },
    ],
  },
  {
    title: "Master Data",
    items: [
      {
        title: "Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        title: "Merek",
        href: "/admin/brands",
        icon: Tags,
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: Tags,
      },
    ],
  },
]
