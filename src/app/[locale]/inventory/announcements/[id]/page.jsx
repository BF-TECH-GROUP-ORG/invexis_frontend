"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import announcementService from '@/services/announcementService';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { Button } from '@mui/material';
import { ArrowLeft, Trash2, CheckCircle, Clock, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

function AnnouncementDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const { id } = params || {};

  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // defensive resolution of possible default/named export interop issues
        const getAnnouncementFn = (announcementService && typeof announcementService.getAnnouncement === 'function')
          ? announcementService.getAnnouncement.bind(announcementService)
          : (announcementService && announcementService.default && typeof announcementService.default.getAnnouncement === 'function')
            ? announcementService.default.getAnnouncement.bind(announcementService.default)
            : null;

        if (getAnnouncementFn) {
          const { data } = await getAnnouncementFn(id);
          if (mounted) setAnnouncement(data);
        } else {
          // fallback: fetch all and find the item
          const { data } = await announcementService.getAnnouncements();
          const found = Array.isArray(data) ? data.find(a => a.id === id) : null;
          if (mounted) setAnnouncement(found || null);
        }
      } catch (e) {
        console.error('Failed to load announcement', e);
        toast.error('Failed to load announcement');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const goBack = () => router.push(`/${locale}/inventory/announcements`);

  const handleMarkRead = async () => {
    try {
      await announcementService.markAsRead(id);
      setAnnouncement(prev => prev ? { ...prev, isRead: true } : prev);
      toast.success('Marked as read');
    } catch (e) {
      toast.error('Failed to mark read');
    }
  };

  const handleDelete = async () => {
    try {
      await announcementService.delete(id);
      toast.success('Deleted');
      router.push(`/${locale}/inventory/announcements`);
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const handleSnooze = async () => {
    try {
      await announcementService.snooze(id, 3600000);
      toast.success('Snoozed');
      router.push(`/${locale}/inventory/announcements`);
    } catch (e) {
      toast.error('Snooze failed');
    }
  };

  const handleArchive = async () => {
    try {
      await announcementService.delete(id);
      toast.success('Archived');
      router.push(`/${locale}/inventory/announcements`);
    } catch (e) {
      toast.error('Archive failed');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!announcement) return <div className="p-6">Announcement not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/${locale}/inventory/announcements`} prefetch aria-label="Back to notifications" className="inline-flex items-center gap-2 px-3 py-2 border rounded-md bg-white hover:bg-gray-50 text-sm">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Back</span>
          </Link>
          <div className="text-sm text-gray-500">
            <Link href={`/${locale}/inventory/announcements`} prefetch className="hover:underline">Notifications Overview</Link>
            <span className="px-2">/</span>
            <span className="text-gray-700">{announcement.title.length > 60 ? announcement.title.slice(0, 60) + '...' : announcement.title}</span>
          </div>
        </div>
        <h2 className="text-lg font-semibold">{announcement.title}</h2>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        {dayjs(announcement.timestamp).fromNow()}
      </div>

      <div className="border rounded p-4 mb-4 bg-white">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{announcement.context}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={handleMarkRead} className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Mark as read
        </button>
        <button onClick={handleSnooze} className="px-3 py-2 bg-gray-100 rounded flex items-center gap-2">
          <Clock className="w-4 h-4" /> Snooze
        </button>
        <button onClick={handleArchive} className="px-3 py-2 bg-gray-100 rounded flex items-center gap-2">
          <Archive className="w-4 h-4" /> Archive
        </button>
        <button onClick={handleDelete} className="ml-auto px-3 py-2 bg-red-600 text-white rounded flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {announcement.actions && announcement.actions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Actions</h3>
          <div className="flex gap-2 flex-wrap">
            {announcement.actions.map((a) => (
              <button key={a} className="px-3 py-2 bg-blue-50 text-blue-700 rounded text-sm">{a}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default function AnnouncementDetailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">Loading...</div></div>}>
            <AnnouncementDetailPageContent />
        </Suspense>
    );
}

