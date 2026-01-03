import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function FaviconLoader() {
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('key, value')
          .in('key', ['favicon_url', 'site_name']);

        if (error) {
          console.error('Failed to load site settings:', error);
          return;
        }

        if (data) {
          const settings = data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {} as Record<string, string>);

          // Update favicon
          if (settings.favicon_url) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = settings.favicon_url;
          }

          // Update site title
          if (settings.site_name) {
            document.title = settings.site_name;
          }
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
      }
    };

    loadSiteSettings();
  }, []);

  return null;
}
