export type Customer = {
    id: string
    name: string
    email: string
    phone: string
    status: "active" | "inactive"
    createdAt: string
}

export const customers: Customer[] = [
    {
        id: "CUS-001",
        name: "Michael Tan",
        email: "michael@example.com",
        phone: "0812-1234-5678",
        status: "active",
        createdAt: "23 Aug 2026",
    },
    {
        id: "CUS-002",
        name: "Jessica Lim",
        email: "jessica@example.com",
        phone: "0813-2211-5566",
        status: "active",
        createdAt: "22 Aug 2026",
    },
    {
        id: "CUS-003",
        name: "Kevin Wijaya",
        email: "kevin@example.com",
        phone: "0821-8899-2200",
        status: "inactive",
        createdAt: "21 Aug 2026",
    },
]