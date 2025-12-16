import React from 'react';
import {
    Receipt,
    CreditCard,
    Package,
    RefreshCw,
    AlertTriangle,
    Target,
    User,
    Settings,
    Archive,
    Trash2,
    CheckCircle,
    Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TypeIcon = ({ type }) => {
    switch (type) {
        case 'sale': return <Receipt className="w-5 h-5 text-green-600" />;
        case 'payment': return <CreditCard className="w-5 h-5 text-blue-600" />;
        case 'inventory': return <Package className="w-5 h-5 text-orange-600" />;
        case 'update': return <RefreshCw className="w-5 h-5 text-gray-600" />;
        case 'alert': return <AlertTriangle className="w-5 h-5 text-red-600" />;
        case 'promotion': return <Target className="w-5 h-5 text-purple-600" />;
        case 'user': return <User className="w-5 h-5 text-indigo-600" />;
        default: return <Settings className="w-5 h-5 text-gray-500" />;
    }
};

const AnnouncementItem = ({ announcement, onAction }) => {
    const { id, type, title, context, timestamp, isRead } = announcement;

    const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

    const handleAction = (e, action) => {
        e.stopPropagation();
        onAction(action, id);
    };

    return (
        <div
            className={`
        group flex items-center p-3 border-b border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer
        ${!isRead ? 'bg-white' : 'bg-gray-50/50'}
      `}
            onClick={() => onAction('view', id)}
        >
            {/* Selection Checkbox (Optional but good for Gmail style) */}
            <div className="mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" onClick={(e) => e.stopPropagation()} />
            </div>

            {/* Icon */}
            <div className="mr-4 p-2 rounded-full bg-gray-50 group-hover:bg-white transition-colors">
                <TypeIcon type={type} />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <div className="flex items-baseline gap-2">
                    <h3 className={`text-sm truncate ${!isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {title}
                    </h3>
                    <span className="text-xs text-gray-400 font-normal hidden sm:inline-block">- {context}</span>
                </div>
                <p className="text-xs text-gray-500 sm:hidden mt-0.5 truncate">{context}</p>
            </div>

            {/* Meta & Actions */}
            <div className="flex items-center gap-4 ml-4">
                {/* Hover Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => handleAction(e, 'mark_read')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 tooltip"
                        title="Mark as read"
                    >
                        <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => handleAction(e, 'snooze')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
                        title="Snooze"
                    >
                        <Clock className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => handleAction(e, 'archive')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
                        title="Archive"
                    >
                        <Archive className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => handleAction(e, 'delete')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Timestamp */}
                <span className={`text-xs whitespace-nowrap ${!isRead ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                    {timeAgo}
                </span>
            </div>
        </div>
    );
};

export default AnnouncementItem;
