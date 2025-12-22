
import {
    Activity,
    CreditCard,
    AlertTriangle,
    TrendingUp,
    UserCheck
} from 'lucide-react';

export const NOTIFICATION_INTENTS = {
    OPERATIONAL: 'operational',
    FINANCIAL: 'financial',
    RISK_SECURITY: 'risk_security',
    STRATEGIC_INSIGHT: 'strategic_insight',
    ACCOUNTABILITY: 'accountability',
};

export const PRIORITY_LEVELS = {
    URGENT: 'urgent',
    HIGH: 'high',
    NORMAL: 'normal',
    LOW: 'low',
};

export const INTENT_CONFIG = {
    [NOTIFICATION_INTENTS.OPERATIONAL]: {
        label: 'Operations',
        color: 'blue',
        icon: Activity,
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    [NOTIFICATION_INTENTS.FINANCIAL]: {
        label: 'Finance',
        color: 'green',
        icon: CreditCard,
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
    },
    [NOTIFICATION_INTENTS.RISK_SECURITY]: {
        label: 'Security',
        color: 'red',
        icon: AlertTriangle,
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
    },
    [NOTIFICATION_INTENTS.STRATEGIC_INSIGHT]: {
        label: 'Insights',
        color: 'purple',
        icon: TrendingUp,
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
    },
    [NOTIFICATION_INTENTS.ACCOUNTABILITY]: {
        label: 'Action',
        color: 'yellow',
        icon: UserCheck,
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
    },
};
