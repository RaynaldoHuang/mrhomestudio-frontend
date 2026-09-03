import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"
import { lazy, Suspense } from "react"

import { AdminLayout } from "@/layouts/admin-layout"
import { Toaster } from "@/components/ui/sonner"
import { PageLoading } from "@/components/shared/page-loading"

const DashboardPage = lazy(() =>
  import("@/pages/dashboard/dashboard-page").then(({ DashboardPage }) => ({
    default: DashboardPage,
  })),
)
const CustomersPage = lazy(() =>
  import("@/pages/customers/customers-page").then(({ CustomersPage }) => ({
    default: CustomersPage,
  })),
)
const CreateCustomerPage = lazy(() =>
  import("@/pages/customers/create-customer-page").then(({ CreateCustomerPage }) => ({
    default: CreateCustomerPage,
  })),
)
const EditCustomerPage = lazy(() =>
  import("@/pages/customers/edit-customer-page").then(({ EditCustomerPage }) => ({
    default: EditCustomerPage,
  })),
)
const NotFoundPage = lazy(() =>
  import("@/pages/not-found-page").then(({ NotFoundPage }) => ({
    default: NotFoundPage,
  })),
)

function PlaceholderPage({
  title,
}: {
  title: string
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {title}
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        This page will be implemented later.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route element={<AdminLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/customers"
              element={<CustomersPage />}
            />

            <Route
              path="/customers/create"
              element={<CreateCustomerPage />}
            />

            <Route
              path="/customers/:id/edit"
              element={<EditCustomerPage />}
            />

            <Route
              path="/products"
              element={
                <PlaceholderPage title="Products" />
              }
            />

            <Route
              path="/orders"
              element={
                <PlaceholderPage title="Orders" />
              }
            />

            <Route
              path="/settings"
              element={
                <PlaceholderPage title="Settings" />
              }
            />

            <Route
              path="*"
              element={<NotFoundPage />}
            />
            
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster richColors position="top-right" />
    </>
  )
}
