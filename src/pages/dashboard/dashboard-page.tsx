import { Images, Package } from "lucide-react"
import { Link } from "react-router-dom"

import { PageHeader } from "@/components/shared/page-header"

const sections = [
  { title: "Products", description: "Manage product details, variants, specifications, stock, and images.", href: "/admin/products", icon: Package },
  { title: "Homepage Carousel", description: "Manage promotional slides shown at the top of the website.", href: "/admin/carousels", icon: Images },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Manage your MR Home Audio website content." />
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          return <Link key={section.href} to={section.href} className="group rounded-xl border bg-card p-6 transition-colors hover:border-primary/40"><div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="size-5" /></div><h2 className="font-semibold">{section.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{section.description}</p></Link>
        })}
      </div>
    </div>
  )
}
