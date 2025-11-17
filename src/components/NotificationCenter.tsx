import React, { useEffect } from 'react';
import { useNotificationStore } from '@/stores';

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md pointer-events-none">
      {notifications.map((notif) => {
        const bgColor = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          warning: 'bg-yellow-500',
          info: 'bg-blue-500',
        }[notif.type];

        const icon = {
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️',
        }[notif.type];

        return (
          <div
            key={notif.id}
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideIn pointer-events-auto`}
          >
            <span className="text-lg">{icon}</span>
            <span className="flex-1">{notif.message}</span>
            <button
              onClick={() => removeNotification(notif.id)}
              className="text-lg leading-none hover:opacity-80"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
