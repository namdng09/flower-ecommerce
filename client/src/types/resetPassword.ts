import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ')
    .nonempty('Không được để trống email')
});

export type ResetPasswordFormFields = z.infer<typeof resetPasswordSchema>;
