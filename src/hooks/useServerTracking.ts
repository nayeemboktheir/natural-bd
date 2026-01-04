import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

interface CustomData {
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  order_id?: string;
}

interface TrackEventParams {
  eventName: string;
  userData?: UserData;
  customData?: CustomData;
}

// Get fbclid from storage (captured by client-side pixel)
const getFbclid = (): string | null => {
  try {
    return sessionStorage.getItem('_fbclid');
  } catch {
    return null;
  }
};

// Get fbp cookie value
const getFbp = (): string | null => {
  try {
    const match = document.cookie.match(/_fbp=([^;]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

// Get fbc cookie value (or construct from fbclid)
const getFbc = (): string | null => {
  try {
    // First check for existing _fbc cookie
    const match = document.cookie.match(/_fbc=([^;]+)/);
    if (match) return match[1];
    
    // If no _fbc but we have fbclid, construct it
    const fbclid = getFbclid();
    if (fbclid) {
      const timestamp = Math.floor(Date.now() / 1000);
      return `fb.1.${timestamp}.${fbclid}`;
    }
    
    return null;
  } catch {
    return null;
  }
};

// Get external ID for deduplication
const getExternalId = (): string => {
  try {
    return localStorage.getItem('_fb_external_id') || '';
  } catch {
    return '';
  }
};

/**
 * Hook for server-side tracking via Meta Conversions API (CAPI)
 * This sends events directly from the server to Facebook for better accuracy
 * and to bypass ad blockers.
 */
export const useServerTracking = () => {
  
  /**
   * Send an event to Facebook Conversions API via edge function
   */
  const trackServerEvent = useCallback(async ({
    eventName,
    userData = {},
    customData = {},
  }: TrackEventParams): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`[CAPI] Sending ${eventName} event to server...`);
      
      // Build the request payload with browser data for better matching
      const payload = {
        event_name: eventName,
        user_data: {
          email: userData.email,
          phone: userData.phone,
          first_name: userData.firstName,
          last_name: userData.lastName,
          external_id: getExternalId(),
          fbc: getFbc(),
          fbp: getFbp(),
        },
        custom_data: customData,
        event_source_url: window.location.href,
      };
      
      console.log('[CAPI] Payload:', { ...payload, user_data: { ...payload.user_data, email: payload.user_data.email ? '[SET]' : undefined } });
      
      const { data, error } = await supabase.functions.invoke('facebook-capi', {
        body: payload,
      });
      
      if (error) {
        console.error('[CAPI] Error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('[CAPI] Response:', data);
      return { success: data?.success ?? false, error: data?.error };
    } catch (err) {
      console.error('[CAPI] Exception:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);
  
  /**
   * Track a page view event
   */
  const trackPageView = useCallback(async (userData?: UserData) => {
    return trackServerEvent({
      eventName: 'PageView',
      userData,
    });
  }, [trackServerEvent]);
  
  /**
   * Track when a user views a product
   */
  const trackViewContent = useCallback(async (params: {
    contentId: string;
    contentName: string;
    value: number;
    currency?: string;
    userData?: UserData;
  }) => {
    return trackServerEvent({
      eventName: 'ViewContent',
      userData: params.userData,
      customData: {
        content_ids: [params.contentId],
        content_type: 'product',
        value: params.value,
        currency: params.currency || 'BDT',
      },
    });
  }, [trackServerEvent]);
  
  /**
   * Track when a user adds item to cart
   */
  const trackAddToCart = useCallback(async (params: {
    contentId: string;
    contentName: string;
    value: number;
    quantity?: number;
    currency?: string;
    userData?: UserData;
  }) => {
    return trackServerEvent({
      eventName: 'AddToCart',
      userData: params.userData,
      customData: {
        content_ids: [params.contentId],
        content_type: 'product',
        value: params.value,
        num_items: params.quantity || 1,
        currency: params.currency || 'BDT',
      },
    });
  }, [trackServerEvent]);
  
  /**
   * Track when a user initiates checkout
   */
  const trackInitiateCheckout = useCallback(async (params: {
    contentIds: string[];
    value: number;
    numItems: number;
    currency?: string;
    userData?: UserData;
  }) => {
    return trackServerEvent({
      eventName: 'InitiateCheckout',
      userData: params.userData,
      customData: {
        content_ids: params.contentIds,
        content_type: 'product',
        value: params.value,
        num_items: params.numItems,
        currency: params.currency || 'BDT',
      },
    });
  }, [trackServerEvent]);
  
  /**
   * Track when a user adds payment info
   */
  const trackAddPaymentInfo = useCallback(async (params: {
    contentIds: string[];
    value: number;
    currency?: string;
    userData: UserData;
  }) => {
    return trackServerEvent({
      eventName: 'AddPaymentInfo',
      userData: params.userData,
      customData: {
        content_ids: params.contentIds,
        content_type: 'product',
        value: params.value,
        currency: params.currency || 'BDT',
      },
    });
  }, [trackServerEvent]);
  
  /**
   * Track a completed purchase - MOST IMPORTANT EVENT
   */
  const trackPurchase = useCallback(async (params: {
    orderId: string;
    contentIds: string[];
    value: number;
    numItems: number;
    currency?: string;
    userData: UserData;
  }) => {
    return trackServerEvent({
      eventName: 'Purchase',
      userData: params.userData,
      customData: {
        order_id: params.orderId,
        content_ids: params.contentIds,
        content_type: 'product',
        value: params.value,
        num_items: params.numItems,
        currency: params.currency || 'BDT',
      },
    });
  }, [trackServerEvent]);
  
  /**
   * Track a lead (contact form, newsletter signup, etc.)
   */
  const trackLead = useCallback(async (params: {
    userData: UserData;
    value?: number;
    currency?: string;
  }) => {
    return trackServerEvent({
      eventName: 'Lead',
      userData: params.userData,
      customData: params.value ? {
        value: params.value,
        currency: params.currency || 'BDT',
      } : undefined,
    });
  }, [trackServerEvent]);
  
  /**
   * Track a custom event
   */
  const trackCustomEvent = useCallback(async (params: {
    eventName: string;
    userData?: UserData;
    customData?: CustomData;
  }) => {
    return trackServerEvent(params);
  }, [trackServerEvent]);
  
  return {
    trackServerEvent,
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackAddPaymentInfo,
    trackPurchase,
    trackLead,
    trackCustomEvent,
  };
};
