const { admin } = require("../config");

const sendFCMNotification = async (token, message) => {
  const payload = {
    notification: {
      title: "Yeni Görev",
      body: message,
    },
  };

  try {
    const response = await admin.messaging().sendToDevice(token, payload);
    console.log("Bildirim başarıyla gönderildi:", response);
  } catch (error) {
    console.error("Bildirim gönderilemedi:", error);
  }
};

module.exports = sendFCMNotification;