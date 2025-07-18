import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PASSWORD
  }
});

export const mailService = {
  sendOrderSuccessToCustomer: async (orderData: any, customerEmail: string) => {
    try {
      const templatePath = path.join(
        __dirname,
        'templates',
        'orderSuccessCustomer.html'
      );
      const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

      // Compile template với Handlebars
      const template = Handlebars.compile(htmlTemplate);

      // Prepare data cho template
      const templateData = {
        customerName: orderData.user.fullName || 'Unknown Customer',
        orderNumber: orderData.orderNumber || 'Unknown Order Number',
        items: orderData.items.map((item: any) => ({
          variant: item.variant.product?.[0]?.title || 'Unknown Product',
          quantity: item.quantity,
          price: item.price.toLocaleString('vi-VN')
        })),
        totalQuantity: orderData.totalQuantity,
        shippingCost: orderData.shipment.shippingCost.toLocaleString('vi-VN'),
        totalPrice: orderData.totalPrice.toLocaleString('vi-VN'),
        addressDetail:
          orderData.address.detail ||
          `${orderData.address.street}, ${orderData.address.ward}, ${orderData.address.province}.`,
        paymentMethod:
          orderData.payment.method === 'cod'
            ? 'Thanh toán khi nhận hàng'
            : 'Chuyển khoản',
        notes: orderData.customization?.notes || 'Không có ghi chú',
        deliveryTimeRequested: orderData.customization?.deliveryTimeRequested
          ? new Date(
              orderData.customization.deliveryTimeRequested
            ).toLocaleString('vi-VN')
          : 'Không yêu cầu',
        giftMessage: orderData.customization?.giftMessage
      };

      const htmlContent = template(templateData);

      await transporter.sendMail({
        from: `"Flaura" <${process.env.MAIL_ADDRESS}>`,
        to: customerEmail,
        subject: `Đơn hàng ${orderData.orderNumber} đã được tạo thành công`,
        html: htmlContent
      });
    } catch (error) {
      console.error('Error sending email to customer:', error);
      throw error;
    }
  },

  sendOrderSuccessToShop: async (orderData: any, shopEmail: string) => {
    try {
      const templatePath = path.join(
        __dirname,
        'templates',
        'orderSuccessShop.html'
      );
      const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

      // Compile template với Handlebars
      const template = Handlebars.compile(htmlTemplate);

      // Prepare data cho template
      const templateData = {
        orderNumber: orderData.orderNumber
      };

      const htmlContent = template(templateData);

      await transporter.sendMail({
        from: `"Flaura" <${process.env.MAIL_ADDRESS}>`,
        to: shopEmail,
        subject: `Đơn hàng ${orderData.orderNumber} mới`,
        html: htmlContent
      });
    } catch (error) {
      console.error('Error sending email to shop:', error);
      throw error;
    }
  },

  sendResetPassword: async (
    email: string,
    resetLink: string,
    fullName: string
  ) => {
    try {
      const templatePath = path.join(
        __dirname,
        'templates',
        'resetPassword.html'
      );
      const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(htmlTemplate);

      // Truyền resetLink vào template
      const templateData = {
        fullName: fullName,
        resetLink: resetLink
      };

      const htmlContent = template(templateData);

      await transporter.sendMail({
        from: `"Flaura" <${process.env.MAIL_ADDRESS}>`,
        to: email,
        subject: `Đặt lại mật khẩu`,
        html: htmlContent
      });

      console.log(`Reset password email sent to: ${email}`);
    } catch (error) {
      console.error('Error sending reset password email:', error);
      throw error;
    }
  }
};
