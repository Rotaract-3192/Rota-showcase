"use client";

import React, { useEffect, useState, useRef } from "react";
import { Bell, Check, Clock, X } from "lucide-react";

interface Notification {
  id: string;
  auth_id: string;
  role_target: string | null;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id })
      });
    } catch (err) {
      console.error("Error marking as read:", err);
      // Revert on error (simple reload)
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications([]);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: "all" })
      });
    } catch (err) {
      console.error("Error marking all as read:", err);
      fetchNotifications();
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full border border-slate-700/60 bg-navy-dark/40 hover:bg-navy-light/20 transition-colors text-slate-400 hover:text-white"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-electric-blue shadow-[0_0_6px_rgba(0,240,255,0.6)] animate-pulse flex items-center justify-center">
             <span className="text-[8px] font-bold text-black">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-700/60 bg-navy-deep/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-electric-blue hover:text-white transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Bell className="w-8 h-8 text-slate-700 mb-1" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-800/60">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className="p-4 hover:bg-slate-800/30 transition-colors flex gap-3 relative group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-200 truncate">{notification.title}</p>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{notification.message}</p>
                      
                      {notification.link && (
                        <a 
                          href={notification.link}
                          className="text-xs text-electric-blue hover:underline mt-2 inline-block"
                        >
                          View Details &rarr;
                        </a>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100 absolute top-3 right-2"
                      title="Mark as read"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
