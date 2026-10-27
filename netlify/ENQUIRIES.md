# Customer enquiries

Two synchronous Netlify Functions preserve the existing frontend contracts:

- `/.netlify/functions/contact`: JSON Contact fields.
- `/.netlify/functions/solar-fit`: multipart `details` JSON and up to three `photos`.
- Success: `{ "received": true, "id": "provider receipt" }` only after Resend accepts the email. Acceptance does not prove inbox delivery.
- Errors: JSON `{ "error": "..." }`, with 400 (invalid data), 403 (origin), 405 (method), 413 (size), 415 (content type), 503 (configuration), or 502 (provider failure/timeout). Existing forms show their failure message. Netlify may reject oversized/rate-limited requests before the handler.

## Required external setup

1. Create a Resend account, verify a sending domain with its required DNS records, and create a sending API key. The recipient is fixed to `evergreensolarenergies@gmail.com`; the Gmail address is not the sender.
2. In Netlify environment settings, set **Functions-scoped** `RESEND_API_KEY`, `ENQUIRY_EMAIL_FROM` (bare verified sender email), and `ENQUIRY_ALLOWED_ORIGIN` (exact HTTPS website origin, no trailing slash). Keep secrets out of `VITE_` variables, source control and `netlify.toml`.
3. Deploy with the existing Netlify build. Public endpoint paths are configured in `netlify.toml` and local `.env.local`. `npm run dev` runs Vite only and does not serve Functions; use Netlify Dev for end-to-end local requests, with a matching localhost origin and private local server settings.
4. Confirm rate-limit rules in the deployed Netlify configuration. Perform one authorized real enquiry for each form; verify the Resend receipt, provider delivery status and Gmail receipt. Test a provider failure as well. Local tests mock Resend and do not establish live delivery.

## Safeguards and limits

- Zod validates all fields, consent, lengths and enums; unknown fields are rejected. Photo MIME and magic bytes must match JPG/PNG/WebP. Attachments receive generated filenames. This is basic format checking, not malware scanning.
- Each endpoint has Netlify per-IP/domain rate limiting (5 requests per 60 seconds), strict origin checks, bounded bodies and fixed recipient/sender. No permissive CORS. Origin checks alone do not stop non-browser bots; the platform rate limit is the basic spam control. No CAPTCHA service is required for this minimal version.
- SHA-256 of the canonical outgoing email becomes a Resend idempotency key, protecting identical retries across function instances for the provider's 24-hour window. No unreliable in-memory duplicate store. A later identical enquiry within this window returns the original acceptance; changes to its contents create a new submission.
- Email uses plain text, a fixed subject, validated Reply-To (Contact only), and a 10-second provider timeout. No customer details or credentials are logged. No automatic retry sends additional email; customers may retry safely with the same contents.
- Photos are optional: up to three JPG/PNG/WebP files totaling **3 MB (3,000,000 bytes)**. Frontend and backend use `src/config/uploads.json` for the same combined limit and validation message. The **entire multipart request remains capped at 4,000,000 bytes**, leaving 1 MB for form details, filenames and multipart overhead. The form blocks progression when the selected photos exceed the combined limit; the server also enforces it. No external upload storage is used.

Run `npm run test:enquiries` for offline contract/failure checks. Platform rate enforcement and actual email delivery require a configured Netlify deployment.

References: [Netlify rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/), [Resend send API](https://resend.com/docs/api-reference/emails/send-email), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
