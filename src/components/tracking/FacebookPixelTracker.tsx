import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { useServerTracking } from '@/hooks/useServerTracking';

export function FacebookPixelTracker() {
  const location = useLocation();
  const { trackPageView: trackClientPageView, isEnabled, isReady } = useFacebookPixel();
  const { trackFacebookEvent, trackGoogleEvent } = useServerTracking();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // Only track if enabled, ready, and path has changed
    if (isEnabled && isReady && location.pathname !== lastTrackedPath.current) {
      console.log('FacebookPixelTracker: Tracking page view for', location.pathname);
      
      // Track client-side (browser pixel) and get the event ID for deduplication
      const eventId = trackClientPageView();
      
      // Track server-side (CAPI) with the same event ID for deduplication
      trackFacebookEvent({
        eventName: 'PageView',
        eventId: eventId || undefined,
      }).then((result) => {
        console.log('FacebookPixelTracker: CAPI PageView result:', result);
      }).catch((err) => {
        console.error('FacebookPixelTracker: CAPI PageView error:', err);
      });

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
    }
  }, [location.pathname, isEnabled, isReady, trackClientPageView, trackFacebookEvent, trackGoogleEvent]);

  return null;
}
