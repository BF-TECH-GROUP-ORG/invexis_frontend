"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import announcementService from '@/services/announcementService';
import AnnouncementList from '@/components/announcements/AnnouncementList';
import AnnouncementDrawer from '@/components/announcements/AnnouncementDrawer';
import EcommerceAnalyticsCards from '@/components/pages/ecommerce/EcommerceAnalyticsCards';
import {
    Inbox,
    Tag,
    Users,
    RefreshCw,
    CheckSquare,
    Archive,
    Clock
} from 'lucide-react';
import { Package, Receipt, AlertTriangle, DollarSign } from 'lucide-react';
import PaymentsCustomersIcon from '@/components/announcements/PaymentsCustomersIcon';
import { toast } from 'react-hot-toast';

// using shared PaymentsCustomersIcon component

const TABS = [
    { id: 'primary', label: 'General', icon: Inbox, color: 'text-orange-600', border: 'border-orange-500' },
    { id: 'updates', label: 'Inventory', icon: Package, color: 'text-orange-600', border: 'border-orange-500' },
    { id: 'promotions', label: 'Sales', icon: Receipt, color: 'text-green-600', border: 'border-green-500' },
    { id: 'social', label: 'Payments & Customers', icon: PaymentsCustomersIcon, color: 'text-purple-600', border: 'border-purple-500' },
    { id: 'debts', label: 'Debts', icon: DollarSign, color: 'text-red-600', border: 'border-red-500' },
    { id: 'other', label: 'Other', icon: AlertTriangle, color: 'text-gray-600', border: 'border-gray-400' }
];

export default function AnnouncementsPage() {
    const router = useRouter();
    const locale = useLocale();
    const [activeTab, setActiveTab] = useState('primary');
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [archivedCount, setArchivedCount] = useState(0);
    const [snoozedCount, setSnoozedCount] = useState(0);
    const [readCount, setReadCount] = useState(0);

    const { data: session } = useSession();

    // Subscribe to service
    useEffect(() => {
        // 1. Connect using session access token (if available)
        const token = session?.accessToken ?? null;
        announcementService.connect(token);

        // 2. Initial Fetch from local state or API
        loadAnnouncements();

        // 3. Listen for real-time events (service now normalizes categories)
        const unsubNew = announcementService.on('new', (item) => {
            setAnnouncements(prev => [item, ...prev]);
            toast('New Announcement: ' + (item.title || 'Update'), { icon: '🔔' });
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
    }, [session]);

    const loadAnnouncements = async () => {
        setIsLoading(true);
        try {
            const { data } = await announcementService.getAnnouncements(); // Get all (service returns normalized categories)
            setAnnouncements(data);
            setReadCount(data.filter(a => a.isRead).length);
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
                // update local read count optimistically
                const item = announcements.find(a => a.id === id);
                if (item && !item.isRead) setReadCount(prev => prev + 1);
                    } else if (action === 'delete') {
                        await announcementService.delete(id);
                        toast.success("Item deleted");
            } else if (action === 'snooze') {
                await announcementService.snooze(id, 3600000); // 1 hour
                toast.success("Snoozed for 1 hour");
                setSnoozedCount(prev => prev + 1);
            } else if (action === 'view') {
                // navigate to the announcement detail (slug) page
                router.push(`/${locale}/inventory/announcements/${id}`);
            } else if (action === 'archive') {
                // Archive isn't implemented on the service; simulate by deleting and counting as archived
                try {
                    await announcementService.delete(id);
                    setArchivedCount(prev => prev + 1);
                    toast.success('Archived');
                } catch (e) {
                    toast.error('Archive failed');
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
        <div className="min-h-screen bg-white flex flex-col font-sans relative pt-14">
            <AnnouncementDrawer
                isOpen={!!selectedAnnouncement}
                announcement={selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
            />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-14 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Notifications Overview</h1>
                        <p className="text-sm text-gray-500">Quick stats for archived, deleted, read and snoozed items</p>
                    </div>
                    <div className="flex items-center gap-3">
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
                </div>

                <div className="mt-4">
                    {/** Use the ecommerce analytics card style for a cleaner look */}
                    <EcommerceAnalyticsCards
                        cards={[
                            {
                                key: 'archived',
                                title: 'Archived',
                                value: archivedCount,
                                description: '',
                                icon: Archive,
                                bgColor: '#fff7ed',
                                color: '#ff7a18',
                            },
                            {
                                key: 'read',
                                title: 'Read',
                                value: readCount,
                                description: '',
                                icon: CheckSquare,
                                bgColor: '#ecfdf5',
                                color: '#10b981',
                            },
                            {
                                key: 'snoozed',
                                title: 'Snoozed',
                                value: snoozedCount,
                                description: '',
                                icon: Clock,
                                bgColor: '#eff6ff',
                                color: '#2563eb',
                            },
                        ]}
                        onFilter={() => {}}
                        activeFilters={{}}
                    />
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
                                {/* Icon may be a React component (lucide) or our composite PaymentsCustomersIcon */}
                                {tab.id === 'social' ? (
                                    // Render only the composite icon here; render the text label once below
                                    <Icon size={22} className={`${isActive ? tab.color : 'text-gray-400'}`} />
                                ) : (
                                    <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-gray-400'}`} />
                                )}
                                <span className="ml-1 whitespace-nowrap">{tab.label}</span>
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
                <div>
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
