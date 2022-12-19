const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// sgMail
//     .send(message)
//     .then((response) => console.log('Email sent...'))
//     .catch((error) => console.log(error.message))
const sendEmail = async (options) => {
    const message = {
        from: process.env.MAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: `<strong>${options.message}</strong>`,
    };
    sgMail
        .send(message)
        .then((response) => console.log(response))
        .catch((error) => console.log(error.message));
};

module.exports = sendEmail;
