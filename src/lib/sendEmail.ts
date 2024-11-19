import { CourierClient } from "@trycourier/courier";

export async function sendEmail(name: string, email: string) {
  const courier = new CourierClient({
    authorizationToken: process.env.EMAIL_SECRET,
  });

  const { requestId } = await courier.send({
    message: {
      to: {
        email: email,
      },
      template: "478JWZG11AMHE1JH6NVM8QB0YGB1",
      data: {
        recipientName: name,
      },
    },
  });
}

export async function paymentSuccessEmail(
  name: string,
  amount: number,
  campaignName: string,
  date: string,
  email: string
) {
  const courier = new CourierClient({
    authorizationToken: process.env.EMAIL_SECRET,
  });
  const { requestId } = await courier.send({
    message: {
      to: {
        email: email,
      },
      template: "DR1P34MJ504HZHQC368JEPTDVW03",
      data: {
        name,
        amount,
        date,
        campaignName,
      },
    },
  });
}
