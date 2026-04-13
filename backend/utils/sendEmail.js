const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;

    // Use Ethereal Test Email if standard credentials are not configured
    if (process.env.NODEMAILER_PASSWORD === 'your_app_password_here' || !process.env.NODEMAILER_PASSWORD) {
        console.log('\n======================================================');
        console.log('✉️  Default email credentials detected. Falling back to Mock Mail (Ethereal).');
        console.log('Generating test account... This may take a second.');
        
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    } else {
        // Use real Gmail if credentials are provided
        transporter = nodemailer.createTransport({
            service: 'gmail', // or configured proxy
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });
    }

    // Define email options
    const mailOptions = {
        from: `"ServiceMate Support" <${process.env.NODEMAILER_EMAIL || 'support@servicemate.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.message,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // If using test account, log the URL to view the email
    if (process.env.NODEMAILER_PASSWORD === 'your_app_password_here' || !process.env.NODEMAILER_PASSWORD) {
        console.log('✅ Mock Email Sent Successfully!');
        console.log(`🔗 Click to Preview Email in Browser: ${nodemailer.getTestMessageUrl(info)}`);
        console.log('======================================================\n');
    }
};

module.exports = sendEmail;
