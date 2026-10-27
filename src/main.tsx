import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@fontsource-variable/manrope'
import '@/styles/globals.css'
import { router } from '@/app/router'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

// Preserve the crawler-visible HTML while the existing lazy route loads.
// Mounting the existing client app retains its established animation lifecycle.
if (rootElement.hasChildNodes() && !router.state.initialized) {
  await new Promise<void>(resolve => {
    const unsubscribe = router.subscribe(state => { if (state.initialized) { unsubscribe(); resolve() } })
  })
}
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
