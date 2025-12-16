"use client";
import { Coins, TrendingUp, Undo2, Percent } from "lucide-react";
import { useMemo } from "react";

const SalesCards = ({ sales = [] }) => {

    const stats = useMemo(() => {
        const today = new Date().toDateString();

        // Filter sales for today
        const todaySales = sales.filter(sale =>
            new Date(sale.createdAt).toDateString() === today
        );

        const totalDailySales = todaySales.reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0);

        // Calculate profit based on items
        const totalDailyProfit = todaySales.reduce((sum, sale) => {
            const saleProfit = sale.items ? sale.items.reduce((itemSum, item) => {
                const cost = parseFloat(item.costPrice) || 0;
                const price = parseFloat(item.unitPrice) || 0;
                const qty = item.quantity || 1;
                return itemSum + ((price - cost) * qty);
            }, 0) : 0;
            return sum + saleProfit;
        }, 0);

        const totalReturned = sales.filter(sale =>
            sale.returned === true || sale.returned === "true"
        ).length;

        const totalDiscounts = sales.filter(sale =>
            (parseFloat(sale.discountTotal) || 0) > 0
        ).length;

        return {
            totalDailySales,
            totalDailyProfit,
            totalReturned,
            totalDiscounts
        };
    }, [sales]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const cardsInfo = [
        {
            title: "Total Daily Sales",
            value: formatCurrency(stats.totalDailySales),
            icon: <Coins size={45} className="text-purple-500 bg-purple-50 p-2 rounded-xl" />
        },
        {
            title: "Total Daily Profit",
            value: formatCurrency(stats.totalDailyProfit),
            icon: <TrendingUp size={45} className="text-green-500 bg-green-50 p-2 rounded-xl" />
        },
        {
            title: "Total Returned Products",
            value: stats.totalReturned,
            icon: <Undo2 size={45} className="text-blue-500 bg-blue-50 p-2 rounded-xl" />
        },
        {
            title: "Total Number of Discounts",
            value: stats.totalDiscounts,
            icon: <Percent size={45} className="text-red-500 bg-red-50 p-2 rounded-xl" />
        },
    ];

    return (
        <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {cardsInfo.map((card, index) => (
                <div key={index} className="bg-white p-5 justify-between flex rounded-xl border">
                    <div className="text-left">
                        <p className="text-2xl font-bold">{card.value}</p>
                        <h2 className="text-gray-500">{card.title}</h2>
                    </div>
                    <div className="flex h-full">
                        <div className="text-orange-500">{card.icon}</div>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default SalesCards;  