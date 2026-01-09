import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { useServerTracking } from '@/hooks/useServerTracking';

export function FacebookPixelTracker() {
  const location = useLocation();
  const { trackPageView: trackClientPageView, isEnabled, isReady } = useFacebookPixel();
  const { trackFacebookEvent, trackGoogleEvent } = useServerTracking();
  const lastTrackedPath = useRef<string>('');
  const isTrackingRef = useRef(false);

  const trackPageView = useCallback(async () => {
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;

    try {
      console.log('FacebookPixelTracker: Tracking page view for', location.pathname);
      
      // Track client-side (browser pixel) FIRST and get the event ID for deduplication
      const eventId = trackClientPageView();
      console.log('FacebookPixelTracker: Client pixel eventId:', eventId);
      
      // Small delay to ensure _fbp cookie is set by Meta Pixel
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Track server-side (CAPI) with the SAME event ID for deduplication
      // This ensures Meta can match and deduplicate the events
      const capiResult = await trackFacebookEvent({
        eventName: 'PageView',
        eventId: eventId || undefined,
      });
      console.log('FacebookPixelTracker: CAPI PageView result:', capiResult);

      // Also track server-side for Google Analytics
      trackGoogleEvent({
        eventName: 'page_view',
        eventParams: {
          page_location: window.location.href,
          page_title: document.title,
        },
      }).catch((err) => {
        console.error('FacebookPixelTracker: GA server PageView error:', err);
      });
      
      lastTrackedPath.current = location.pathname;
    } finally {
      isTrackingRef.current = false;
    }
  }, [location.pathname, trackClientPageView, trackFacebookEvent, trackGoogleEvent]);

  useEffect(() => {
    // Only track if enabled, ready, and path has changed
    if (isEnabled && isReady && location.pathname !== lastTrackedPath.current) {
      trackPageView();
    }
  }, [location.pathname, isEnabled, isReady, trackPageView]);

  return null;
}
