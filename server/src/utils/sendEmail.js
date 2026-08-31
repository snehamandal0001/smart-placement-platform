 //works only on localhost for any email, fails on render free tier 

// import nodemailer from 'nodemailer';

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: `PlacementHub <${process.env.EMAIL_USER}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   await transporter.sendMail(mailOptions);
// };

// export default sendEmail;








//works on localhost and render free tier  but for only one email (SANDBOX MODE)
import { Resend } from 'resend';

// Initialize Resend with your API Key
const sendEmail = async (options) => {

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'PlacementHub <onboarding@resend.dev>', 
    to: options.email, 
    subject: options.subject,
    text: options.message,
  });
};

export default sendEmail;
