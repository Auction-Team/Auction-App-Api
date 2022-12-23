const httpStatus = require('http-status');
const CustomError = require('../utils/custom-error');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (verifyEmailToken, email) => {
    const url = `${process.env.CLIENT_URL}/activate/${verifyEmailToken}`;

    const emailData = {
        from: '19110262@student.hcmute.edu.vn', //must use only this email which is registered with account in website Sendgrid cuz this account owns MAIL_KEY
        to: email,
        subject: 'Account activation link',
        html: `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">NPSSocial Website</h2>
            <p>Hi my new member! <br>
            Just one more step and you will officially become one of the users of our site.<br>
            A verification link has been created and is valid within <span style="color: crimson"> <b>5 minutes</b></span>!<br>
            Please click on the confirm button to complete the procedure.
            </p>

            <form action=${url}>
                <button type="submit" 
                        style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">Xác thực email</button>
            </form>
        `,
    };
    sgMail.setApiKey(process.env.MAIL_KEY);

    return sgMail.send(emailData).catch((err) => {
        throw new CustomError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
    });
};

const sendResetPasswordEmail = async (resetPasswordToken, email) => {
    const url = `${process.env.CLIENT_URL}/reset/${verifyEmailToken}`;

    const emailData = {
        from: '19110031@student.hcmute.edu.vn', //must use only this email which is registered with account in website Sendgrid cuz this account owns MAIL_KEY
        to: email,
        subject: 'Reset password link',
        html: `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase;color: teal;">NPS Social Website</h2>
        <p>Hi my member!<br>
        A link to the password change page has been created and is effective within <span style="color: crimson"> <b>5 minutes</b></span>!<br>
        Please click the button below to proceed with the password change.
        </p>
        <form action=${url}>
        <button type="submit" 
            style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">Đổi mật khẩu</button>
        </form>
        `,
    };
    sgMail.setApiKey(process.env.MAIL_KEY);

    return sgMail.send(emailData).catch((err) => {
        throw new CustomError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
    });
};

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME}`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(message);
};

module.exports = {
    sendVerificationEmail,
    sendResetPasswordEmail,
    sendEmail,
};
