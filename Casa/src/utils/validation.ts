import { z } from 'zod';

// ---------------------------------------------------------------------------
// Reusable sanitization helpers
// Blocks common XSS vectors: <script>, javascript:, on* event handlers, iframes
// Also blocks SQL injection keywords that have no place in user-facing inputs
// ---------------------------------------------------------------------------
const noXSS = (val: string) =>
  !/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(val) &&
  !/javascript\s*:/gi.test(val) &&
  !/on\w+\s*=/gi.test(val) &&
  !/<\s*iframe/gi.test(val);

const noSQLInjection = (val: string) =>
  !/(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bSELECT\b|\bUNION\b|--|;)/i.test(val);

// Applies both XSS + SQL injection checks to a string field
const sanitizedString = z
  .string()
  .refine(noXSS, { message: 'Input contains invalid characters.' })
  .refine(noSQLInjection, { message: 'Input contains invalid characters.' });

// ---------------------------------------------------------------------------
// Login Validation Schema
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// ---------------------------------------------------------------------------
// Signup Validation Schema
// ---------------------------------------------------------------------------
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  fullName: sanitizedString
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must not exceed 50 characters'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (E.164 format)'),
  address: sanitizedString
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(100, 'Address must not exceed 100 characters'),
});

// ---------------------------------------------------------------------------
// Furniture Validation Schema (Admin create/edit form)
// ---------------------------------------------------------------------------
export const furnitureSchema = z.object({
  name: sanitizedString
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  price: z
    .coerce.number({ message: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .max(999999, 'Price is unrealistically high'),
  description: sanitizedString
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  category: z
    .string()
    .min(1, 'Category is required')
    .refine(
      (val) => ['Living', 'Dining', 'Bedroom', 'Workspace', 'Outdoor'].includes(val),
      {
        message: 'Category must be one of: Living, Dining, Bedroom, Workspace, Outdoor',
      }
    ),
  imageUrl: z
    .string()
    .min(1, 'Image is required')
    .refine(
      (val) =>
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('file://') ||
        val.startsWith('data:image/'),
      { message: 'Image must be a valid URL or uploaded file.' }
    ),
});

// ---------------------------------------------------------------------------
// Profile Update Validation Schema
// ---------------------------------------------------------------------------
export const profileSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  fullName: sanitizedString
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must not exceed 50 characters'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (E.164 format)'),
  address: sanitizedString
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(100, 'Address must not exceed 100 characters'),
  avatarUrl: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Infer TypeScript types from Zod schemas
// ---------------------------------------------------------------------------
export type LoginPayload = z.infer<typeof loginSchema>;
export type SignupPayload = z.infer<typeof signupSchema>;
export type FurniturePayload = z.infer<typeof furnitureSchema>;
export type ProfilePayload = z.infer<typeof profileSchema>;
