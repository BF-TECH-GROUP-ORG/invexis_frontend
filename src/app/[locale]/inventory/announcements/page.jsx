"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import announcementService from '@/services/announcementService';
import AnnouncementList from '@/components/announcements/AnnouncementList';
import AnnouncementDrawer from '@/components/announcements/AnnouncementDrawer';
// import EcommerceAnalyticsCards from '@/components/pages/ecommerce/EcommerceAnalyticsCards'; // Removed
import {
    Inbox,
    Tag,
    RefreshCw,
    CheckSquare,
    Clock,
    Archive
} from 'lucide-react';
import { Package, Receipt, AlertTriangle, DollarSign } from 'lucide-react';
import PaymentsCustomersIcon from '@/components/announcements/PaymentsCustomersIcon';
import { toast } from 'react-hot-toast';

// using shared PaymentsCustomersIcon component

const TABS = [
    { id: 'primary', label: 'General', icon: Inbox, color: 'text-orange-600', border: 'border-orange-500' },
    { id: 'updates', label: 'Inventory', icon: Package, color: 'text-orange-600', border: 'border-orange-500' }, // Maps to inventory/update types
    { id: 'promotions', label: 'Sales', icon: Receipt, color: 'text-green-600', border: 'border-green-500' }, // Maps to sale/promotion types
    { id: 'social', label: 'Payments & Customers', icon: PaymentsCustomersIcon, color: 'text-purple-600', border: 'border-purple-500' }, // Maps to payment/user types
    { id: 'debts', label: 'Debts', icon: DollarSign, color: 'text-red-600', border: 'border-red-500' }, // Maps to debt types
    { id: 'other', label: 'Other', icon: AlertTriangle, color: 'text-gray-600', border: 'border-gray-400' }
];

// Separate Archive tab for special positioning
const ARCHIVE_TAB = { id: 'archive', label: 'Archived', icon: Archive, color: 'text-gray-600', border: 'border-gray-500' };

function AnnouncementsPageContent() {
    const router = useRouter();
    const locale = useLocale();
    const [activeTab, setActiveTab] = useState('primary');
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const { data: session } = useSession();

    // Subscribe to service
    useEffect(() => {
        // 1. Connect using session access token (if available)
        const token = session?.accessToken ?? null;
        announcementService.connect(token);

        // 2. Initial Fetch based on active tab
        loadAnnouncements();

        // 3. Listen for real-time events
        const unsubNew = announcementService.on('new', (item) => {
            // Determine if this item should appear in the current view
            const isPrimaryTab = activeTab === 'primary';
            const isArchiveTab = activeTab === 'archive';

            if (isArchiveTab) {
                // Archive tab: only show if item is archived
                if (item.isArchived) {
                    setAnnouncements(prev => [item, ...prev]);
                }
            } else if (isPrimaryTab) {
                // General tab: show ALL non-archived notifications
                if (!item.isArchived) {
                    setAnnouncements(prev => [item, ...prev]);
                    toast('New Announcement: ' + (item.title || 'Update'), { icon: '🔔' });
                }
            } else {
                // Specific category tabs: only show if category matches and NOT archived
                if (item.category === activeTab && !item.isArchived) {
                    setAnnouncements(prev => [item, ...prev]);
                    toast('New Announcement: ' + (item.title || 'Update'), { icon: '🔔' });
                } else if (!item.isArchived && item.category !== activeTab) {
                    // Notify about new items in other categories (subtle notification)
                    toast('New Announcement: ' + (item.title || 'Update'), { icon: '🔔' });
                }
            }
        });

        const unsubUpdate = announcementService.on('update', (updatedItem) => {
            const isPrimaryTab = activeTab === 'primary';

            // If item is now archived and we are NOT in archive tab, remove it
            if (activeTab !== 'archive' && updatedItem.isArchived) {
                setAnnouncements(prev => prev.filter(item => item.id !== updatedItem.id));
                return;
            }
            // If item is unarchived (restored?) and we ARE in archive tab, remove it
            if (activeTab === 'archive' && !updatedItem.isArchived) {
                setAnnouncements(prev => prev.filter(item => item.id !== updatedItem.id));
                return;
            }

            // For General tab, accept all non-archived updates
            if (isPrimaryTab && !updatedItem.isArchived) {
                setAnnouncements(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
                return;
            }

            // For specific category tabs, only update if category matches
            if (!isPrimaryTab && activeTab !== 'archive' && updatedItem.category !== activeTab) {
                // Category changed, item no longer belongs here
                setAnnouncements(prev => prev.filter(item => item.id !== updatedItem.id));
                return;
            }

            // Standard update
            setAnnouncements(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        });

        const unsubDelete = announcementService.on('delete', (id) => {
            setAnnouncements(prev => prev.filter(item => item.id !== id));
        });

        return () => {
            unsubNew();
            unsubUpdate();
            unsubDelete();
            // Don't disconnect on tab change, just unsubscribe listeners
        };
    }, [session, activeTab]); // Re-run when tab changes

    const loadAnnouncements = async () => {
        setIsLoading(true);
        try {
            const isArchiveTab = activeTab === 'archive';
            const isPrimaryTab = activeTab === 'primary'; // General tab shows ALL

            let filters = {};

            if (isArchiveTab) {
                // Archive: show all archived notifications
                filters = { archived: true };
            } else if (isPrimaryTab) {
                // General: show ALL non-archived notifications (no category filter)
                filters = { archived: false };
            } else {
                // Specific category tabs: filter by category
                filters = { archived: false, category: activeTab };
            }

            const { data } = await announcementService.getAnnouncements(filters);
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
                // local update handled by listener or optimistic update
                setAnnouncements(prev => prev.map(item => item.id === id ? { ...item, isRead: true } : item));
            } else if (action === 'delete') {
                await announcementService.delete(id);
                toast.success("Item deleted");
            } else if (action === 'snooze') {
                await announcementService.snooze(id, 3600000); // 1 hour
                toast.success("Snoozed for 1 hour");
            } else if (action === 'view') {
                router.push(`/${locale}/inventory/announcements/${id}`);
            } else if (action === 'archive') {
                await announcementService.archive(id);
                toast.success('Archived');
                // The service.archive() emits a 'delete' event for the main list (if local mock) 
                // or we can optimistically remove it here
                setAnnouncements(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const generateMockEvent = () => {
        announcementService.triggerTestEvent();
    };

    // Data is now pre-filtered by the API/Service
    const filteredAnnouncements = announcements;

    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    return (
        <div className="h-[calc(100dvh-5rem)] overflow-hidden bg-white flex flex-col font-sans relative">
            <AnnouncementDrawer
                isOpen={!!selectedAnnouncement}
                announcement={selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
            />

            {/* Sticky Header Section: Tabs + Archive Button */}
            <div className="flex-none bg-white border-b border-gray-200 sticky top-0 z-10 px-4 pt-4 pb-0">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Regular Tabs */}
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar pb-0 flex-1">
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
                      flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-medium transition-all duration-200 min-w-max
                      ${isActive
                                            ? `border-${tab.border.split('-')[1]}-500 text-gray-900 bg-gray-50/50`
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }
                    `}
                                >
                                    {tab.id === 'social' ? (
                                        <Icon size={20} className={`${isActive ? tab.color : 'text-gray-400'}`} />
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

                    {/* Right: Archive Button */}
                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`
                            flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200
                            ${activeTab === 'archive'
                                ? 'bg-gray-100 text-gray-900 shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                            }
                        `}
                        title="View Archived Announcements"
                    >
                        <Archive className={`w-5 h-5 ${activeTab === 'archive' ? 'text-gray-700' : 'text-gray-500'}`} />
                        <span className="text-sm whitespace-nowrap">{ARCHIVE_TAB.label}</span>
                        {announcements.filter(a => a.isArchived).length > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'archive' ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-700'}`}>
                                {announcements.filter(a => a.isArchived).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content - Takes remaining height, contains the list */}
            <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden flex flex-col">

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4 flex-none">
                    <div className="flex items-center gap-2 text-gray-700">
                        <button className="p-1.5 hover:bg-gray-100 rounded hover:text-gray-900 transition-colors" title="Select All">
                            <CheckSquare className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded hover:text-gray-900 transition-colors" title="Refresh">
                            <Clock className="w-4 h-4" />
                        </button>
                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                        <span className="text-xs">{filteredAnnouncements.length} results</span>
                    </div>
                </div>

                {/* List Container - Scrollable */}
                <div className="flex-1 overflow-hidden min-h-0">
                    <AnnouncementList
                        announcements={filteredAnnouncements}
                        onAction={handleAction}
                        isLoading={isLoading}
                        className="h-full flex flex-col" // Pass class for full height
                    />
                </div>
            </main>
        </div>
    );
}


export default function AnnouncementsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">Loading...</div></div>}>
            <AnnouncementsPageContent />
        </Suspense>
    );
}

