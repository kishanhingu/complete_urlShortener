import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailWithResend = async ({ to, subject, html }) => {
  console.log("TO 🚀🚀🚀", to);

  try {
    const { data, error } = await resend.emails.send({
      from: "URL SHORTENER <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  } catch (error) {
    console.error(error);
  }
};
