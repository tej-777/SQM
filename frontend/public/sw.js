// Service Worker for Background Notifications
const CACHE_NAME = 'smartqueue-v1';
const QUEUE_UPDATE_INTERVAL = 10000; // 10 seconds

// Store active queue subscriptions
let queueSubscriptions = new Map();

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('📱 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/favicon.ico',
        '/manifest.json'
      ]).catch(error => {
        console.log('📱 Cache addAll error:', error);
        // Fallback: don't fail the installation
        return Promise.resolve();
      });
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('📱 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle Messages from Main Thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SUBSCRIBE_QUEUE':
      subscribeToQueue(data);
      break;
    case 'UNSUBSCRIBE_QUEUE':
      unsubscribeFromQueue(data);
      break;
    case 'SHOW_NOTIFICATION':
      showNotification(data.title, data.body, data.icon);
      break;
  }
});

// Subscribe to Queue Updates
function subscribeToQueue(queueData) {
  const { appointmentId, tokenNumber, hospitalName } = queueData;
  
  console.log(`📱 Subscribing to queue updates for appointment ${appointmentId}`);
  
  // Clear existing subscription for this appointment
  if (queueSubscriptions.has(appointmentId)) {
    clearInterval(queueSubscriptions.get(appointmentId).intervalId);
  }
  
  // Store subscription data
  queueSubscriptions.set(appointmentId, {
    ...queueData,
    lastPeopleAhead: null,
    intervalId: null
  });
  
  // Start polling for queue updates
  const intervalId = setInterval(() => {
    checkQueueUpdate(appointmentId);
  }, QUEUE_UPDATE_INTERVAL);
  
  queueSubscriptions.get(appointmentId).intervalId = intervalId;
  
  // Show subscription confirmation
  showNotification(
    '📱 Queue Monitoring Active',
    `Token T-${tokenNumber} - We'll notify you of queue updates`,
    null
  );
}

// Unsubscribe from Queue Updates
function unsubscribeFromQueue(appointmentId) {
  if (queueSubscriptions.has(appointmentId)) {
    const subscription = queueSubscriptions.get(appointmentId);
    clearInterval(subscription.intervalId);
    queueSubscriptions.delete(appointmentId);
    
    console.log(`📱 Unsubscribed from queue updates for appointment ${appointmentId}`);
    
    showNotification(
      '📱 Queue Monitoring Stopped',
    'Background notifications have been disabled',
      null
    );
  }
}

// Check for Queue Updates
async function checkQueueUpdate(appointmentId) {
  try {
    const subscription = queueSubscriptions.get(appointmentId);
    if (!subscription) return;
    
    const response = await fetch(`http://localhost:8000/queue/patient/${appointmentId}`);
    
    if (!response.ok) {
      console.error('📱 Failed to fetch queue update:', response.status);
      return;
    }
    
    const data = await response.json();
    const currentPeopleAhead = data.people_ahead;
    
    console.log(`📱 Queue update for T-${data.token_number}: ${currentPeopleAhead} people ahead`);
    
    // Check if position changed
    if (subscription.lastPeopleAhead !== null && subscription.lastPeopleAhead !== currentPeopleAhead) {
      const oldPosition = subscription.lastPeopleAhead;
      const newPosition = currentPeopleAhead;
      
      // Send appropriate notification
      if (newPosition === 0) {
        showNotification(
          '🎉 You\'re Next in Queue!',
          `Token T-${data.token_number} - Please be ready to be called at ${data.hospital_name}`,
          null
        );
      } else if (oldPosition > newPosition) {
        const positionsMoved = oldPosition - newPosition;
        showNotification(
          '📉 Queue Updated!',
          `Token T-${data.token_number} - ${positionsMoved} position${positionsMoved > 1 ? 's' : ''} moved forward! ${newPosition} people ahead`,
          null
        );
      }
    }
    
    // Update last known position
    subscription.lastPeopleAhead = currentPeopleAhead;
    
  } catch (error) {
    console.error('📱 Error checking queue update:', error);
  }
}

// Show Notification
function showNotification(title, body, icon = null) {
  const options = {
    body: body,
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'smartqueue-update',
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200], // Vibration pattern for mobile
  };

  self.registration.showNotification(title, options);
}

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Focus or open the app
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      // Try to focus existing client
      for (const client of clientList) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if no client found
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle Push Events (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    showNotification(data.title, data.body, data.icon);
  }
});

console.log('📱 SmartQueue Service Worker loaded');
