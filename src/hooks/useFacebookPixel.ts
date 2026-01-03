import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    fbq: ((...args: any[]) => void) & { 
      push?: (...args: any[]) => void;
      loaded?: boolean;
      version?: string;
      queue?: any[];
      callMethod?: (...args: any[]) => void;
    };
    _fbq: any;
  }
}

interface FacebookPixelConfig {
  pixelId: string;
  enabled: boolean;
}

let pixelConfig: FacebookPixelConfig | null = null;
let isPixelLoading = false;
let pixelLoadPromise: Promise<void> | null = null;

const loadPixelScript = (pixelId: string): Promise<void> => {
  if (pixelLoadPromise) return pixelLoadPromise;

  isPixelLoading = true;

  pixelLoadPromise = new Promise((resolve) => {
    console.log('Loading Facebook Pixel script...');

    // If fbq already exists, just (re)initialize with our pixel ID
    if (window.fbq && typeof window.fbq === 'function') {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      console.log('Facebook Pixel initialized with ID:', pixelId);
      isPixelLoading = false;
      resolve();
      return;
    }

    // Standard Facebook Pixel initialization
    (function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize the pixel after script is ready
    const checkAndInit = () => {
      if (window.fbq && typeof window.fbq === 'function') {
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
        console.log('Facebook Pixel initialized with ID:', pixelId);
        isPixelLoading = false;
        resolve();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    setTimeout(checkAndInit, 300);

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);
  });

  return pixelLoadPromise;
};

export const useFacebookPixel = () => {
  const [config, setConfig] = useState<FacebookPixelConfig | null>(pixelConfig);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('key, value')
          .in('key', ['fb_pixel_id', 'fb_pixel_enabled']);

        if (error) {
          console.error('Failed to fetch pixel settings:', error);
          return;
        }

        let id = '';
        let enabled = false;

        data?.forEach((setting) => {
          if (setting.key === 'fb_pixel_id') id = setting.value;
          if (setting.key === 'fb_pixel_enabled') enabled = setting.value === 'true';
        });

        const newConfig = { pixelId: id, enabled: enabled && !!id };

        // Update cache + state every mount so admin changes take effect without stale config
        pixelConfig = newConfig;
        setConfig(newConfig);

        console.log('Facebook Pixel config loaded:', { enabled: newConfig.enabled, hasPixelId: !!id });

        if (newConfig.enabled) {
          await loadPixelScript(newConfig.pixelId);
          setIsReady(true);
        } else {
          setIsReady(false);
        }
      } catch (error) {
        console.error('Failed to load Facebook Pixel config:', error);
      }
    };

    loadConfig();
  }, []);


  const trackPageView = useCallback(() => {
    if (config?.enabled && window.fbq) {
      console.log('Tracking PageView');
      window.fbq('track', 'PageView');
    }
  }, [config]);

  const trackViewContent = useCallback(
    (params: { content_ids: string[]; content_name: string; content_type: string; value: number; currency: string }) => {
      if (config?.enabled && window.fbq) {
        console.log('Tracking ViewContent:', params);
        window.fbq('track', 'ViewContent', params);
      }
    },
    [config]
  );

  const trackAddToCart = useCallback(
    (params: { content_ids: string[]; content_name: string; content_type: string; value: number; currency: string }) => {
      if (config?.enabled && window.fbq) {
        console.log('Tracking AddToCart:', params);
        window.fbq('track', 'AddToCart', params);
      }
    },
    [config]
  );

  const trackInitiateCheckout = useCallback(
    (params: { content_ids: string[]; num_items: number; value: number; currency: string }) => {
      if (config?.enabled && window.fbq) {
        console.log('Tracking InitiateCheckout:', params);
        window.fbq('track', 'InitiateCheckout', params);
      }
    },
    [config]
  );

  const trackPurchase = useCallback(
    (params: { content_ids: string[]; content_type: string; value: number; currency: string; num_items: number }) => {
      if (config?.enabled && window.fbq) {
        console.log('Tracking Purchase:', params);
        window.fbq('track', 'Purchase', params);
      }
    },
    [config]
  );

  return {
    isEnabled: config?.enabled ?? false,
    isReady,
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
  };
};
