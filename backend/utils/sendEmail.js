const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or configured proxy
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD,
        },
    });

    // Define email options
    const mailOptions = {
        from: `ServiceMate <${process.env.NODEMAILER_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.message,
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
