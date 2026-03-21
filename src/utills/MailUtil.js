const mailer = require("nodemailer");
require("dotenv").config();;

const mailSend = async(to, subject , text, html)=>{
    const transPorter=mailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        }
    })

    const mailOptions={
        from:process.env.EMAIL_USER,
        to:to,
        subject:subject,
        text:text,
        html:html
    }

    const mailResponse= await transPorter.sendMail(mailOptions)
    console.log(mailResponse);
    return mailResponse
}

module.exports = mailSend