// lib/gtag.ts 
export const GA_TRACKING_ID = 'G-5Y83ZWN061';

export const pageview = (url: string) => {
  if (process.env.NODE_ENV !== 'production') return;
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (process.env.NODE_ENV !== 'production') return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};