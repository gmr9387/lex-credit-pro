import { z } from 'zod';

export const disputeFormSchema = z.object({
  accountName: z.string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters')
    .trim(),
  bureau: z.enum(['experian', 'transunion', 'equifax'], {
    required_error: 'Please select a bureau',
  }),
  issueType: z.enum([
    'duplicate',
    'obsolete',
    'inaccurate_balance',
    'identity_mismatch',
    'unauthorized',
    'other'
  ], {
    required_error: 'Please select an issue type',
  }),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),
  balance: z.string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), 'Balance must be a valid number')
    .refine((val) => !val || parseFloat(val) >= 0, 'Balance cannot be negative'),
});

export const scoreSnapshotSchema = z.object({
  score: z.number()
    .min(300, 'Credit score must be at least 300')
    .max(850, 'Credit score cannot exceed 850'),
  bureau: z.enum(['Equifax', 'Experian', 'TransUnion'], {
    required_error: 'Please select a bureau',
  }),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 20 * 1024 * 1024, 'File size must be less than 20MB')
    .refine(
      (file) => ['application/pdf'].includes(file.type),
      'Only PDF files are supported'
    ),
});

export type DisputeFormData = z.infer<typeof disputeFormSchema>;
export type ScoreSnapshotData = z.infer<typeof scoreSnapshotSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
