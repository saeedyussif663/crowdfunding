import { CourierClient } from "@trycourier/courier";

export default async function sendEmail(name: string, email: string) {
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
