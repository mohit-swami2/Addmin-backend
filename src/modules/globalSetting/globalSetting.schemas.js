import { z } from 'zod';

export const saveSettingsSchema = z.object({
  theme: z.string().optional(),
  fontPreset: z.string().optional(),
  fontSize: z.string().optional(),
  accentColor: z.string().optional(),
});
