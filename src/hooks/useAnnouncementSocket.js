"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    addAnnouncement,
    updateAnnouncement,
    removeAnnouncement
} from '@/store/features/announcements/announcementsSlice';
import announcementService from '@/services/announcementService';

export const useAnnouncementSocket = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Connect to the service (Mock or Real)
        // In real app, pass auth token here
        announcementService.connect('mock-token');

        // Socket Event Listeners
        const handleNew = (announcement) => {
            dispatch(addAnnouncement(announcement));
        };

        const handleUpdate = (announcement) => {
            dispatch(updateAnnouncement(announcement));
        };

        const handleDelete = (id) => {
            dispatch(removeAnnouncement(id));
        };

        // Subscribe
        const unsubNew = announcementService.on('new', handleNew);
        const unsubUpdate = announcementService.on('update', handleUpdate);
        const unsubDelete = announcementService.on('delete', handleDelete);

        // Cleanup
        return () => {
            unsubNew();
            unsubUpdate();
            unsubDelete();
            // Don't disconnect here if you want persistent connection across page navigations
            // But since this hook might be used in a top-level layout, it's fine.
            // If used in multiple places, we need to be careful not to double-connect.
            // valid practice: singleton service handles connection state check.
            announcementService.disconnect();
        };
    }, [dispatch]);
};
