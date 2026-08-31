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


import nodemailer from 'nodemailer';

import dns from 'dns';

// Force Node.js to use standard IPv4 addresses instead of IPv6
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Forces SSL 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: `PlacementHub <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
