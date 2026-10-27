import { useEffect, useRef, useState } from 'react'

/** Only opens a customer-confirmed channel; never records a delivery or resets a form. */
export function useWhatsAppEnquiry() {
  const locked = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => () => clearTimeout(timer.current), [])

  const clearFeedback = () => { setNotice(''); setError('') }
  const openWhatsApp = (href: string | null) => {
    if (locked.current) return
    clearFeedback()
    if (!href) { setError('WhatsApp is not available. Please submit online or contact us by phone or email.'); return }
    locked.current = true
    setBusy(true)
    let opened: Window | null = null
    try {
      // Called synchronously after schema validation, within the original user click.
      opened = window.open('about:blank', '_blank')
      if (!opened) { setError('Your browser blocked WhatsApp. Allow pop-ups for this site and try again, or submit online.'); return }
      opened.opener = null
      const policy = opened.document.createElement('meta')
      policy.name = 'referrer'
      policy.content = 'no-referrer'
      opened.document.head.append(policy)
      opened.location.replace(href)
      setNotice('WhatsApp is ready with your enquiry. Please press Send to complete your request.')
    } catch {
      opened?.close()
      setError('WhatsApp could not be opened. Please try again or submit your enquiry online.')
    } finally {
      timer.current = setTimeout(() => { locked.current = false; setBusy(false) }, 1500)
    }
  }
  return { openWhatsApp, clearFeedback, busy, notice, error }
}
