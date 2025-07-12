import { payOS } from '~/utils/payos';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { mailService } from '../email/emailService';

export const paymentService = {
  createPayment: async (
    amount: number,
    description: string,
    returnUrl: string,
    cancelUrl: string
  ) => {
    if (!amount || !description || !returnUrl || !cancelUrl) {
      throw createHttpError(400, 'Missing required fields');
    }

    const body = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: amount,
      description: description,
      returnUrl: returnUrl,
      cancelUrl: cancelUrl
    };

    const paymentLinkResponse = await payOS.createPaymentLink(body);
    return paymentLinkResponse.checkoutUrl;
  }
};
