import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z.string().nonempty('Họ và tên không được để trống'),
    username: z.string().nonempty('Tên đăng nhập không được để trống'),
    email: z
      .string()
      .email('Email không hợp lệ')
      .nonempty('Email không được để trống'),
    phoneNumber: z
      .string()
      .nonempty('Số điện thoại không được để trống')
      .regex(/^\d{10}$/, 'Số điện thoại phải bao gồm 10 chữ số'),
    role: z.enum(['customer', 'admin', 'shop']),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .nonempty('Mật khẩu không được để trống'),
    confirmPassword: z
      .string()
      .nonempty('Xác nhận mật khẩu không được để trống')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu và xác nhận mật khẩu phải khớp nhau',
    path: ['confirmPassword']
  });

export type RegisterFormFields = z.infer<typeof registerSchema>;
