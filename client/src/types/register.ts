import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z.string().nonempty('Full Name is required'),
    username: z.string().nonempty('Username is required'),
    email: z.string().email('Invalid email').nonempty('Email is required'),
    phoneNumber: z
      .string()
      .nonempty('Phone Number is required')
      .regex(/^\d{10}$/, 'Phone Number must be 10 digits'),
    role: z.enum(['customer', 'admin', 'shop']),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().nonempty('Confirm Password is required')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword']
  });

export type RegisterFormFields = z.infer<typeof registerSchema>;
