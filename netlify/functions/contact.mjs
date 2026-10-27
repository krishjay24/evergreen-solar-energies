import { createEnquiryHandler } from '../lib/enquiries.mjs'

export default createEnquiryHandler('contact')
export const config = {
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'], action: 'rate_limit' },
}
