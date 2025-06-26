import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ')
    .nonempty('Không được để trống email'),
  password: z.string().nonempty('Không được để trống mật khẩu'),
  rememberMe: z.boolean().optional()
});

export type LoginFormFields = z.infer<typeof loginSchema>;
