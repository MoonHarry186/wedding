import { z } from 'zod';

const TextElementSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  x: z.number(),
  y: z.number(),
  content: z.string(),
  fontSize: z.number().min(8).max(200).default(24),
  color: z.string().default('#1a1a1a'),
  fontWeight: z.enum(['400', '700']).default('400'),
  italic: z.boolean().default(false),
  textAlign: z.enum(['left', 'center', 'right']).default('center'),
  letterSpacing: z.number().default(0),
  width: z.number().default(200),
});

const ImageElementSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  x: z.number(),
  y: z.number(),
  width: z.number().min(10),
  height: z.number().min(10),
  url: z.string(),
  opacity: z.number().min(0).max(1).default(1),
});

export const CanvasDataSchema = z.object({
  width: z.number().min(100).max(4000),
  height: z.number().min(100).max(4000),
  background: z.string().default('#ffffff'),
  elements: z.array(z.union([TextElementSchema, ImageElementSchema])),
});

export type CanvasData = z.infer<typeof CanvasDataSchema>;
