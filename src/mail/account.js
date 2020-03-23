const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'olger@olgermile.com',
        subject: 'Task App Welcome Email Subject',
        text: `Hello there ${name}!`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'olger@olgermile.com',
        subject: 'Task App Deleting Account Subject',
        text: `Hello ${name}, we are sad to see you go! Let us know if there is anything to have kept you on board by replying to this email!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}