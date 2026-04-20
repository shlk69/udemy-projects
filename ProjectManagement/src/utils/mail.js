import Mailgen from 'mailgen'
import nodemailer from 'nodemailer'



//Sending the mail 
const sendMail = async  (options) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Task manager',
            link:'https://taskmanagerlink.com'
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)


    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from: 'mail.taskmanager@example.com',
        to: options.email,
        subject: options.subject,
        text: emailTextual, 
        html: emailHtml       
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error('Error in email service, ',error)
    }
}


//E-mail verification content
const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to our app , we are here to help and happy to onboard you',
            action: {
                instructions: 'To verify your email, click the button below',
                button: {
                    color: '#22BC66',
                    text: 'Click to verify',
                    link:verificationUrl
                }
            },
            outro: 'Need help about the process , reply on this email'
        }
    }
}


//Password reset mail content
const passwordResetMailgenContent = (username, resetPassUrl) => {
    return {
        body: {
            name: username,
            intro: 'We got a request to reset the password',
            action: {
                instructions: 'Click the button or link below to reset your password',
                button: {
                    color: '#22DC66',
                    text: 'Reset password',
                    link:resetPassUrl
                }
            },
            outro:'To get more help about the policy , mail on - xyz@gmail.com'
        }
    }
}


export {
    emailVerificationMailgenContent,
    passwordResetMailgenContent,
    sendMail
}