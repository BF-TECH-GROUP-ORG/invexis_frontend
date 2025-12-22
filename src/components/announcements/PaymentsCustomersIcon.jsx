import React from 'react';
import { CreditCard, Users } from 'lucide-react';

export default function PaymentsCustomersIcon({ size = 18, className = '', ariaLabel = 'Payments and Customers', label = '' }) {
    const iconSize = Math.max(12, size);
    const innerSize = Math.round(iconSize * 0.7);
    const outerStyle = { width: iconSize, height: iconSize };
    const innerStyle = { width: innerSize, height: innerSize };

    return (
        <span className={`inline-flex items-center gap-2 ${className}`} role="img" aria-label={ariaLabel}>
            <span className="inline-flex items-center gap-1">
                <span className="p-1.5 rounded-full bg-blue-50 flex items-center justify-center" style={outerStyle} title="Payments">
                    <CreditCard style={innerStyle} className="text-blue-600" />
                </span>
                <span className="p-1.5 rounded-full bg-indigo-50 flex items-center justify-center" style={outerStyle} title="Customers">
                    <Users style={innerStyle} className="text-indigo-600" />
                </span>
            </span>
            {label ? <span className="text-sm text-gray-700 hidden sm:inline">{label}</span> : null}
        </span>
    );
}
