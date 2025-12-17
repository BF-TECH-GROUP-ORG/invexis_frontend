"use client";

import React, { useEffect, useState } from 'react';
import announcementService from '@/services/announcementService';
import AnnouncementList from '@/components/announcements/AnnouncementList';
import AnnouncementDrawer from '@/components/announcements/AnnouncementDrawer';
import {
    Inbox,
    Tag,
    Users,
    Info,
    CheckSquare,
    Trash2,
    Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TABS = [
    { id: 'primary', label: 'Primary', icon: Inbox, color: 'text-orange-600', border: 'border-orange-500' },
    { id: 'updates', label: 'Updates', icon: Info, color: 'text-blue-600', border: 'border-blue-500' },
    { id: 'promotions', label: 'Promotions', icon: Tag, color: 'text-green-600', border: 'border-green-500' },
    { id: 'social', label: 'Social', icon: Users, color: 'text-purple-600', border: 'border-purple-500' }
];

export default function AnnouncementsPage() {
    const [activeTab, setActiveTab] = useState('primary');
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Subscribe to service
    useEffect(() => {
        // 1. Connect
        // TODO: Get real token from auth
        announcementService.connect('mock-token');

        // 2. Initial Fetch from local state or API
        loadAnnouncements();

        // 3. Listen for real-time events
        const unsubNew = announcementService.on('new', (item) => {
            // Only add if it matches current tab or is critical
            // Ideally, we add to state and let UI filter, but for simple list:
            // We'll just re-fetch or prepend
            setAnnouncements(prev => [item, ...prev]);
            toast('New Announcement: ' + item.title, { icon: '🔔' });
        });

        const unsubUpdate = announcementService.on('update', (updatedItem) => {
            setAnnouncements(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        });

        const unsubDelete = announcementService.on('delete', (id) => {
            setAnnouncements(prev => prev.filter(item => item.id !== id));
        });

        return () => {
            unsubNew();
            unsubUpdate();
            unsubDelete();
            announcementService.disconnect();
        };
    }, []);

    const loadAnnouncements = async () => {
        setIsLoading(true);
        try {
            const { data } = await announcementService.getAnnouncements(); // Get all
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to load announcements", error);
            toast.error("Failed to load announcements");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (action, id) => {
        try {
            if (action === 'mark_read') {
                await announcementService.markAsRead(id);
            } else if (action === 'delete') {
                await announcementService.delete(id);
                toast.success("Item deleted");
            } else if (action === 'snooze') {
                await announcementService.snooze(id, 3600000); // 1 hour
                toast.success("Snoozed for 1 hour");
            } else if (action === 'view') {
                const item = announcements.find(a => a.id === id);
                if (item) {
                    if (!item.isRead) {
                        await announcementService.markAsRead(id);
                    }
                    setSelectedAnnouncement(item);
                }
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const generateMockEvent = () => {
        announcementService.triggerTestEvent();
    };

    // Filter for display
    const filteredAnnouncements = announcements.filter(a => a.category === activeTab);

    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
            <AnnouncementDrawer
                isOpen={!!selectedAnnouncement}
                announcement={selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
            />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">System Activity</h1>
                <div className="flex gap-2">
                    <button
                        onClick={generateMockEvent}
                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                        ⚡ Test Event
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-md shadow-sm transition-colors">
                        Mark all read
                    </button>
                </div>

            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl mb-6 overflow-x-auto w-full sm:w-auto">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        // Count unread
                        const count = announcements.filter(a => a.category === tab.id && !a.isRead).length;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-w-max
                  ${isActive
                                        ? `bg-white shadow-sm text-gray-900 border-b-2 ${tab.border}`
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                    }
                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-gray-400'}`} />
                                {tab.label}
                                {count > 0 && (
                                    <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-gray-100 text-gray-900' : 'bg-orange-100 text-orange-700'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Toolbar (Gmail style) */}
                <div className="flex items-center gap-2 mb-2 px-2 text-gray-500">
                    <button className="p-1.5 hover:bg-white rounded hover:text-gray-900 transition-colors" title="Select All">
                        <CheckSquare className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-white rounded hover:text-gray-900 transition-colors" title="Refresh">
                        <Clock className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-1"></div>
                    <span className="text-xs">{filteredAnnouncements.length} results</span>
                </div>

                {/* List */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AnnouncementList
                        announcements={filteredAnnouncements}
                        onAction={handleAction}
                        isLoading={isLoading}
                    />
                </div>
            </main>
        </div>
    );
}
