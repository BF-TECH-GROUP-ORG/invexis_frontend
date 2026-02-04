"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Maximize2, Minimize2 } from "lucide-react";
import { useMemo, useState, memo } from "react";
import Skeleton from "@/components/shared/Skeleton";

const CustomTooltip = ({ active, payload, label, locale = 'en-RW' }) => {
    if (active && payload && payload.length && label) {
        const date = new Date(label);
        // Fallback if date is invalid
        if (isNaN(date.getTime())) return null;

        const dayName = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);

        return (
            <div className="bg-white p-2 border border-gray-100 shadow-lg rounded-lg text-xs">
                <p className="font-semibold text-gray-700">{dayName}</p>
                <p className="font-medium" style={{ color: payload[0].stroke }}>
                    {new Intl.NumberFormat(locale, { compactDisplay: "short", notation: "compact" }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const Sparkline = ({ data, color, locale }) => {
    // Check if all values are zero or data is empty
    const allZero = !data || data.length === 0 || data.every(d => (d.value || 0) === 0);

    if (allZero) {
        // Render a completely flat line when all values are zero
        return (
            <div className="h-16 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{ value: 0, name: '' }]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" hide />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={1}
                            fillOpacity={0.1}
                            fill={`url(#gradient-${color})`}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // Normal chart with data
    return (
        <div className="h-16 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <Tooltip content={<CustomTooltip locale={locale} />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#gradient-${color})`}
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const StatsCard = memo(({
    title,
    value,
    trend,
    history = [],
    icon: Icon,
    color = "#8b5cf6",
    bgColor = "#f3e8ff",
    isCurrency = false,
    isLoading = false,
    index = 0,
    locale = 'en-RW',
    isText = false // Add isText prop
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isPositive = trend >= 0;

    const displayValue = useMemo(() => {
        if (isText) return value; // Return text directly if isText is true

        if (isExpanded) {
            return new Intl.NumberFormat(locale, {
                style: isCurrency ? "currency" : "decimal",
                currency: "RWF",
                maximumFractionDigits: 0,
            }).format(value);
        }
        return new Intl.NumberFormat(locale, {
            style: isCurrency ? "currency" : "decimal",
            currency: "RWF",
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 1,
        }).format(value);
    }, [isExpanded, value, isCurrency, locale, isText]);

    const showToggle = !isText && typeof value === 'number' && value >= 1000;

    if (isLoading) {
        return (
            <div className="border-2 border-gray-100 rounded-2xl p-5 bg-white">
                <div className="flex items-start justify-between">
                    <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-32 mb-4" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, layout: { duration: 0.3, type: "spring" } }}
            className="border-2 border-[#e5e7eb] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-colors hover:shadow-lg group w-full"
        >
            <div className="flex items-start justify-between">
                <div className="flex-grow">
                    <motion.p layout="position" className="text-sm text-[#6b7280] font-semibold mb-1 uppercase tracking-wider">
                        {title}
                    </motion.p>
                    <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isExpanded ? "expanded" : "compact"}
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="text-2xl font-extrabold font-jetbrains text-[#111827]"
                            >
                                {displayValue}
                            </motion.div>
                        </AnimatePresence>

                        {showToggle && (
                            <motion.button
                                layout
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md"
                            >
                                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </motion.button>
                        )}

                        {trend !== undefined && (
                            <motion.div layout="position" className={`flex items-center text-xs font-bold ml-2 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(trend).toFixed(1)}%
                            </motion.div>
                        )}
                    </div>
                </div>

                <motion.div
                    layout
                    className="p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: bgColor }}
                >
                    {Icon && <Icon size={24} style={{ color: color }} />}
                </motion.div>
            </div>

            {history && history.length > 0 && (
                <Sparkline data={history} color={color} locale={locale} />
            )}
        </motion.div>
    );
});
