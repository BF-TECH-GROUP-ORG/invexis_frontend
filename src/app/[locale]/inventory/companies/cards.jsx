"use client";
import { Business, LocationOn, People } from "@mui/icons-material";

const CompanyCards = ({ stats }) => {
    const cardsInfo = [
        {
            title: "Total Branches",
            icon: <Business sx={{ fontSize: 38 }} />,
            value: stats.totalBranches || 0,
        },
        {
            title: "Active Branches",
            icon: <LocationOn sx={{ fontSize: 38 }} />,
            value: stats.activeBranches || 0,
        },
        {
            title: "Total Capacity",
            icon: <People sx={{ fontSize: 38 }} />,
            value: stats.totalCapacity || 0,
        },
    ];

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardsInfo.map((card, index) => (
                <div
                    key={index}
                    className="bg-white p-5 justify-between flex rounded-xl border space-y-3"
                >
                    <div className="flex h-full items-center">
                        <div className="text-orange-500">{card.icon}</div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{card.value}</p>
                        <h2 className="">{card.title}</h2>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default CompanyCards;
