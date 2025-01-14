// types/gtag.d.ts
declare global {
    interface Window {
      gtag: (
        type: string,
        propertyId: string,
        options: { [key: string]: any }
      ) => void;
      dataLayer: any[];
    }
  }
  
  export {};