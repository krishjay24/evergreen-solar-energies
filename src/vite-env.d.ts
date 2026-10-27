/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  readonly VITE_CONTACT_PHONE?: string
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_CONTACT_WHATSAPP?: string
  readonly VITE_ENQUIRY_ENDPOINT?: string
  readonly VITE_CONTACT_ENDPOINT?: string
  readonly VITE_NEWSLETTER_ENDPOINT?: string
  readonly VITE_NEWSLETTER_UNSUBSCRIBE_URL?: string
  readonly VITE_BUSINESS_DETAILS_VERIFIED?: string
  readonly VITE_ANALYTICS_ENABLED?: string
  readonly CONTEXT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
