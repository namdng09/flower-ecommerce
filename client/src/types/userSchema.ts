import { z } from 'zod';

export const userFormSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'),
  role: z.enum(['admin', 'customer', 'shop'], {
    required_error: 'Role is required'
  })
});

export type UserFormData = z.infer<typeof userFormSchema>;
