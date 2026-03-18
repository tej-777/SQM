// Service Worker Manager for Background Notifications
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
  }

  // Register Service Worker for background notifications
  async register() {
    if (!this.isSupported) {
      console.warn('📱 Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('📱 Service Worker registered successfully');
      
      // Wait for activation
      await navigator.serviceWorker.ready;
      console.log('📱 Service Worker ready');
      
      return true;
    } catch (error) {
      console.error('📱 Service Worker registration failed:', error);
      return false;
    }
  }

  // Subscribe to queue updates
  subscribeToQueue(appointmentData) {
    if (!this.registration) {
      console.warn('📱 Service Worker not registered');
      return false;
    }

    const message = {
      type: 'SUBSCRIBE_QUEUE',
      data: appointmentData
    };

    this.registration.active.postMessage(message);
    console.log('📱 Subscribed to queue updates:', appointmentData.appointmentId);
    
    return true;
  }

  // Unsubscribe from queue updates
  unsubscribeFromQueue(appointmentId) {
    if (!this.registration) {
      console.warn('📱 Service Worker not registered');
      return false;
    }

    const message = {
      type: 'UNSUBSCRIBE_QUEUE',
      data: { appointmentId }
    };

    this.registration.active.postMessage(message);
    console.log('📱 Unsubscribed from queue updates:', appointmentId);
    
    return true;
  }

  // Show notification via service worker
  showNotification(title, body, icon = null) {
    if (!this.registration) {
      console.warn('📱 Service Worker not registered');
      return false;
    }

    const message = {
      type: 'SHOW_NOTIFICATION',
      data: { title, body, icon }
    };

    this.registration.active.postMessage(message);
    return true;
  }

  // Check if service worker is ready
  isReady() {
    return this.registration !== null && navigator.serviceWorker.controller !== null;
  }

  // Get registration
  getRegistration() {
    return this.registration;
  }
}

// Export singleton instance
export const swManager = new ServiceWorkerManager();

// Auto-register on import
if (typeof window !== 'undefined') {
  swManager.register();
}
