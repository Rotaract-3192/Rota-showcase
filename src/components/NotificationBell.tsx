"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, X, Info, AlertTriangle, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/queries/notification.queries";
import { createSupabaseClient } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/queries/notification.queries";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsRead();
  
  const queryClient = useQueryClient();
  const supabase = createSupabaseClient();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          // Invalidate the query to fetch new notifications when an insert happens
          queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead(id);
  };

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes("approved") || title.toLowerCase().includes("success")) {
      return <PartyPopper className="w-4 h-4 text-emerald-400" />;
    }
    if (title.toLowerCase().includes("rejected") || title.toLowerCase().includes("alert")) {
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
    return <Info className="w-4 h-4 text-electric-blue" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-colors rounded-full ${isOpen ? 'bg-slate-800/80 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ocean-glow rounded-full animate-pulse ring-2 ring-navy-deep" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-navy-dark border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-electric-blue/20 text-electric-blue rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-xs text-slate-400 hover:text-electric-blue transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-6 h-6 border-2 border-electric-blue border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">You're all caught up!</p>
                  <p className="text-xs text-slate-500 mt-1">Check back later for updates</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-800/50">
                  {notifications.map((notification) => (
                    <Link 
                      href={notification.link || "#"} 
                      key={notification.id}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        setIsOpen(false);
                      }}
                      className={`block p-4 transition-all hover:bg-slate-800/40 ${!notification.is_read ? 'bg-electric-blue/5' : ''}`}
                    >
                      <div className="flex gap-3 items-start">
                        <div className={`mt-0.5 p-2 rounded-full ${!notification.is_read ? 'bg-electric-blue/20 shadow-[0_0_15px_rgba(45,212,191,0.2)]' : 'bg-slate-800'}`}>
                          {getIcon(notification.title)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-sm truncate ${!notification.is_read ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap">
                              {formatRelativeTime(notification.created_at || new Date())}
                            </span>
                          </div>
                          {notification.message && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                          )}
                        </div>
                        {!notification.is_read && (
                          <button 
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="p-1 text-slate-500 hover:text-electric-blue transition-colors rounded-full hover:bg-electric-blue/10 shrink-0 mt-1"
                            title="Mark as read"
                          >
                            <span className="w-2 h-2 rounded-full bg-electric-blue block" />
                          </button>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-2 border-t border-slate-800/60 bg-navy-deep/80 text-center">
              <Link 
                href="/portal/profile" // Or wherever a full notification history might go
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-white transition-colors py-1 block"
              >
                View notification settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
