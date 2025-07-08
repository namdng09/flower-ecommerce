import { z } from 'zod';

export const changePasswordSchema = z.object({
  newPassword: z.string().nonempty('Không được để trống mật khẩu'),
  confirmNewPassword: z.string().nonempty('Không được để trống xác nhận mật khẩu')
});

export type ChangePasswordFormFields = z.infer<typeof changePasswordSchema>;
