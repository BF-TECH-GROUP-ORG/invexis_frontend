"use client";
import { Business, LocationOn, People } from "@mui/icons-material";
// import 

const CompanyCards = ({ stats }) => {
    const cardsInfo = [
        {
            title: "Total shops",
            icon: <Business sx={{ fontSize: 45 }} className="text-orange-500 bg-orange-50 p-3 rounded-xl" />,
            value: stats.totalBranches || 0,
        },
        {
            title: "Active shops",
            icon: <LocationOn sx={{ fontSize: 45  }} className="text-green-500 bg-green-50 p-3 rounded-xl" />,
            value: stats.activeBranches || 0,
        },
        {
            title: "Total Capacity",
            icon: <People sx={{ fontSize: 45 }} className="text-blue-500 bg-blue-50 p-3 rounded-xl" />,
            value: stats.totalCapacity || 0,
        },
    ];

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardsInfo.map((card, index) => (
                <div
                    key={index}
                    className="bg-white p-5 justify-between flex rounded-xl border"
                >
                    <div className="text-left">
                        
                        <h2 className="text-gray-500 text-sm">{card.title}</h2>
                        <p className="text-2xl font-bold font-jetbrains">{card.value}</p>
                    </div>
                    <div className="flex h-full">
                        <div >{card.icon}</div>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default CompanyCards;
