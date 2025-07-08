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
        customerName: orderData.user.fullName,
        orderNumber: orderData.orderNumber,
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

      console.log(
        `Order confirmation email sent to customer: ${customerEmail}`
      );
    } catch (error) {
      console.error('Error sending email to customer:', error);
      throw error;
    }
  }
};
