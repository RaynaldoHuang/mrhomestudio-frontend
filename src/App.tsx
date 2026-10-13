import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"

import { AdminLayout } from "@/layouts/admin-layout"
import { ClientLayout } from "@/layouts/client-layout"
import { Toaster } from "@/components/ui/sonner"
import { PageLoading } from "@/components/shared/page-loading"
import { CartProvider } from "@/contexts/cart-provider"
import { RequireSuperAdmin } from "@/components/auth/require-super-admin"

const DashboardPage = lazy(() =>
  import("@/pages/dashboard/dashboard-page").then(({ DashboardPage }) => ({
    default: DashboardPage,
  })),
)
const HomePage = lazy(() =>
  import("@/pages/client/home").then(({ HomePage }) => ({
    default: HomePage,
  })),
)
const ClientAboutPage = lazy(() =>
  import("@/pages/client/about").then(({ AboutPage }) => ({
    default: AboutPage,
  })),
)
const ClientServicesPage = lazy(() =>
  import("@/pages/client/services").then(({ ServicesPage }) => ({
    default: ServicesPage,
  })),
)
const ClientContactPage = lazy(() =>
  import("@/pages/client/contact").then(({ ContactPage }) => ({
    default: ContactPage,
  })),
)
const CollectionPage = lazy(() =>
  import("@/pages/client/collection").then(({ CollectionPage }) => ({
    default: CollectionPage,
  })),
)
const ProductDetailPage = lazy(() =>
  import("@/pages/client/product").then(({ ProductDetailPage }) => ({
    default: ProductDetailPage,
  })),
)
const CartPage = lazy(() =>
  import("@/pages/client/cart").then(({ CartPage }) => ({
    default: CartPage,
  })),
)
const CarouselsPage = lazy(() =>
  import("@/pages/carousels/carousels-page").then(({ CarouselsPage }) => ({
    default: CarouselsPage,
  })),
)
const MegaMenusPage = lazy(() =>
  import("@/pages/mega-menus/mega-menus-page").then(({ MegaMenusPage }) => ({
    default: MegaMenusPage,
  })),
)
const ProductsPage = lazy(() =>
  import("@/pages/products/products-page").then(({ ProductsPage }) => ({
    default: ProductsPage,
  })),
)
const CategoriesPage = lazy(() =>
  import("@/pages/categories/categories-page").then(({ CategoriesPage }) => ({ default: CategoriesPage })),
)
const LoginPage = lazy(() =>
  import("@/pages/auth/login-page").then(({ LoginPage }) => ({ default: LoginPage })),
)
const ProfilePage = lazy(() =>
  import("@/pages/profile/profile-page").then(({ ProfilePage }) => ({ default: ProfilePage })),
)
const NotFoundPage = lazy(() =>
  import("@/pages/not-found-page").then(({ NotFoundPage }) => ({
    default: NotFoundPage,
  })),
)

export default function App() {
  return (
    <>
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoading />}>
            <Routes>
            <Route element={<ClientLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<ClientAboutPage />} />
              <Route path="services" element={<ClientServicesPage />} />
              <Route path="contact" element={<ClientContactPage />} />
              <Route path="collection/:id" element={<CollectionPage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
            </Route>

            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/login" element={<LoginPage />} />

            <Route element={<RequireSuperAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route
                index
                element={<DashboardPage />}
              />

              <Route
                path="carousels"
                element={<CarouselsPage />}
              />

              <Route
                path="mega-menus"
                element={<MegaMenusPage />}
              />

              <Route
                path="products"
                element={<ProductsPage />}
              />
              <Route path="categories" element={<CategoriesPage />} />

              <Route
                path="profile"
                element={<ProfilePage />}
              />
            </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>

      <Toaster richColors position="bottom-right" />
    </>
  )
}
