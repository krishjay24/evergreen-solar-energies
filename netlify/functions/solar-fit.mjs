import { createEnquiryHandler } from '../lib/enquiries.mjs'

export default createEnquiryHandler('solar-fit')
export const config = {
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'], action: 'rate_limit' },
}
