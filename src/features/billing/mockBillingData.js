export const mockInvoices = [
    {
        id: "INV-001",
        customer: {
            name: "Jean Paul",
            email: "jean.paul@example.com",
            address: "Kigali, Rwanda",
            phone: "+250 788 123 456"
        },
        items: [
            { name: "HP EliteBook 840 G5", qty: 1, price: 450000 },
            { name: "Wireless Mouse", qty: 1, price: 15000 }
        ],
        totalAmount: 465000,
        status: "Paid",
        paymentMethod: "Momo",
        date: "2024-12-10T10:30:00Z",
        signature: true
    },
    {
        id: "INV-002",
        customer: {
            name: "Sarah Keza",
            email: "sarah.k@example.com",
            address: "Remera, Kigali",
            phone: "+250 788 987 654"
        },
        items: [
            { name: "Samsung Galaxy S22", qty: 1, price: 850000 }
        ],
        totalAmount: 850000,
        status: "Paid",
        paymentMethod: "Bank",
        date: "2024-12-11T14:15:00Z",
        signature: true
    },
    {
        id: "INV-003",
        customer: {
            name: "John Doe",
            email: "john.d@example.com",
            address: "Kicukiro, Kigali",
            phone: "+250 788 000 000"
        },
        items: [
            { name: "Dell Monitor 24\"", qty: 2, price: 180000 },
            { name: "HDMI Cable", qty: 2, price: 5000 }
        ],
        totalAmount: 370000,
        status: "Pending",
        paymentMethod: "Card",
        date: "2024-12-12T09:00:00Z",
        signature: false
    },
    {
        id: "INV-004",
        customer: {
            name: "Alice M",
            email: "alice.m@example.com",
            address: "Nyamirambo, Kigali",
            phone: "+250 788 111 222"
        },
        items: [
            { name: "Office Chair", qty: 4, price: 120000 }
        ],
        totalAmount: 480000,
        status: "Paid",
        paymentMethod: "Cash",
        date: "2024-12-12T11:45:00Z",
        signature: true
    }
];
