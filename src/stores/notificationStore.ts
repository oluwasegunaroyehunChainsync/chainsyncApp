import { create } from 'zustand';
import { Notification, NotificationType } from '@/types';
import { generateId } from '@/utils';

interface NotificationState {
  notifications: Notification[];
  
  addNotification: (message: string, type: NotificationType, duration?: number) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (message: string, type: NotificationType, duration = 4000) => {
    const id = generateId('notif_');
    const notification: Notification = {
      id,
      type,
      message,
      duration,
      timestamp: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

export const notify = {
  success: (message: string, duration?: number) => {
    return useNotificationStore.getState().addNotification(message, 'success', duration);
  },
  error: (message: string, duration?: number) => {
    return useNotificationStore.getState().addNotification(message, 'error', duration);
  },
  warning: (message: string, duration?: number) => {
    return useNotificationStore.getState().addNotification(message, 'warning', duration);
  },
  info: (message: string, duration?: number) => {
    return useNotificationStore.getState().addNotification(message, 'info', duration);
  },
};
