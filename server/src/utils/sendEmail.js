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


// import nodemailer from 'nodemailer';

// import dns from 'dns';

// // Force Node.js to use standard IPv4 addresses instead of IPv6
// dns.setDefaultResultOrder('ipv4first');

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true, // Forces SSL 
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     }
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



import { Resend } from 'resend';

// Initialize Resend with your API Key
//const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    // ON THE FREE TIER: The 'from' address MUST be onboarding@resend.dev
    from: 'PlacementHub <onboarding@resend.dev>', 
    to: options.email, 
    subject: options.subject,
    text: options.message,
  });
};

export default sendEmail;
