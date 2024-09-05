const sendEmail = require('./sendEmail');

const sendVerificationEmail = async ({
  name,
  email,
  verificationCode,
}) => {
  const message = `<p>Doğrulama kodunuz: ${verificationCode}</p>`;

  return sendEmail({
    to: email,
    subject: "Projectxwire Mail Doğrulama",
    html: `<h4> Merhaba, ${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendVerificationEmail;
