import { z } from 'zod'
import uploadLimits from '@/config/uploads.json'

const allowedImages = ['image/jpeg', 'image/png', 'image/webp']
export const solarFitSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(100),
  phone: z.string().trim().refine((value) => /^(?:\+?91)?[6-9]\d{9}$/.test(value.replace(/[\s-]/g, '')), 'Enter a valid Indian mobile number'),
  preferredContact: z.enum(['phone', 'whatsapp']),
  project: z.enum(['residential', 'commercial', 'agricultural', 'other'], { error: 'Choose a project type' }),
  location: z.string().trim().min(2, 'Enter the project location').max(150),
  space: z.string().max(100).optional(),
  photos: z.custom<FileList | undefined>().superRefine((value, ctx) => {
    const files = Array.from(value ?? [])
    if (files.length > uploadLimits.maxPhotos) ctx.addIssue({ code: 'custom', message: 'Choose up to 3 images' })
    if (files.reduce((total, file) => total + file.size, 0) > uploadLimits.maxCombinedPhotoBytes) {
      ctx.addIssue({ code: 'custom', message: uploadLimits.combinedSizeMessage })
    }
    files.forEach((file) => {
      if (!allowedImages.includes(file.type)) ctx.addIssue({ code: 'custom', message: 'Use JPG, PNG or WebP images' })
    })
  }).optional(),
  usage: z.string().max(120).optional(),
  phaseLoad: z.string().max(120).optional(),
  information: z.string().max(1500).optional(),
  requestSiteVisit: z.boolean(),
  consent: z.boolean().refine(Boolean, 'Consent is required before submitting'),
})

export type SolarFitFields = z.infer<typeof solarFitSchema>
export const solarFitEntrySchema = solarFitSchema.pick({ name: true, phone: true, project: true })
export type SolarFitEntryFields = z.infer<typeof solarFitEntrySchema>
