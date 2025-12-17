import React from 'react';
import AnnouncementItem from './AnnouncementItem';
import { Inbox } from 'lucide-react';

const AnnouncementList = ({ announcements, onAction, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                <p>Loading updates...</p>
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-600 font-medium mb-1">All caught up!</h3>
                <p className="text-sm text-gray-400 max-w-xs">There are no new announcements in this section right now.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {announcements.map((item) => (
                <AnnouncementItem
                    key={item.id}
                    announcement={item}
                    onAction={onAction}
                />
            ))}
        </div>
    );
};

export default AnnouncementList;
