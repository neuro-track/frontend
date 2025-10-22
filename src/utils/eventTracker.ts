import { Event } from '../types';

class EventTracker {
  private events: Event[] = [];

  async trackEvent(
    userId: string,
    resourceId: string,
    resourceType: Event['resourceType'],
    eventType: Event['eventType'],
    metadata?: Record<string, any>
  ): Promise<void> {
    const event: Event = {
      id: crypto.randomUUID(),
      userId,
      resourceId,
      resourceType,
      eventType,
      timestamp: new Date(),
      metadata,
    };

    this.events.push(event);

    // Send to backend (with retry logic for RNF2)
    try {
      await this.sendToBackend(event);
    } catch (error) {
      // Queue for retry
      console.error('Failed to send event, will retry:', error);
      this.queueForRetry(event);
    }
  }

  private async sendToBackend(event: Event): Promise<void> {
    // TODO: Replace with actual API call
    console.log('Tracking event:', event);

    // Simulate API call
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve(true);
        } else {
          reject(new Error('Network error'));
        }
      }, 100);
    });
  }

  private queueForRetry(event: Event): void {
    // Store in localStorage for persistence (RNF2)
    const queue = this.getRetryQueue();
    queue.push(event);
    localStorage.setItem('event_retry_queue', JSON.stringify(queue));
  }

  private getRetryQueue(): Event[] {
    const stored = localStorage.getItem('event_retry_queue');
    return stored ? JSON.parse(stored) : [];
  }

  async retryFailedEvents(): Promise<void> {
    const queue = this.getRetryQueue();
    const failed: Event[] = [];

    for (const event of queue) {
      try {
        await this.sendToBackend(event);
      } catch (error) {
        failed.push(event);
      }
    }

    localStorage.setItem('event_retry_queue', JSON.stringify(failed));
  }

  // Convenience methods
  trackAccess(userId: string, resourceId: string, resourceType: Event['resourceType']) {
    return this.trackEvent(userId, resourceId, resourceType, 'access');
  }

  trackPlay(userId: string, videoId: string) {
    return this.trackEvent(userId, videoId, 'video', 'play');
  }

  trackPause(userId: string, videoId: string, currentTime: number) {
    return this.trackEvent(userId, videoId, 'video', 'pause', { currentTime });
  }

  trackSubmit(userId: string, exerciseId: string, answer: any) {
    return this.trackEvent(userId, exerciseId, 'exercise', 'submit', { answer });
  }

  trackComplete(userId: string, resourceId: string, resourceType: Event['resourceType']) {
    return this.trackEvent(userId, resourceId, resourceType, 'complete');
  }

  trackComment(userId: string, resourceId: string, comment: string) {
    return this.trackEvent(userId, resourceId, 'article', 'comment', { comment });
  }

  trackLike(userId: string, resourceId: string) {
    return this.trackEvent(userId, resourceId, 'article', 'like');
  }
}

export const eventTracker = new EventTracker();

// Retry failed events every 30 seconds
setInterval(() => {
  eventTracker.retryFailedEvents();
}, 30000);
