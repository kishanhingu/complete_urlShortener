import nodemailer from "nodemailer";

const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "carlee.littel73@ethereal.email",
    pass: "XF9sE9BRjjkMR841fn",
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `'URL SHORTENER' < ${testAccount.user} >`, // sender address
    to,
    subject,
    html,
  });
  const textEmailURL = nodemailer.getTestMessageUrl(info);
  console.log("VERIFY EMAIL➡️ ➡️ ➡️ :-", textEmailURL);
};
