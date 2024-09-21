const { admin } = require("../config");

const sendFCMNotification = async (expoPushToken, message) => {
  const payload = {
    notification: {
      title: "Yeni Görev",
      body: message,
    },
  };

  try {
    const response = await admin
      .messaging()
      .sendToDevice(expoPushToken, payload);
    console.log("Bildirim başarıyla gönderildi:", response);
  } catch (error) {
    console.error("Bildirim gönderilemedi:", error);
  }
};

module.exports = sendFCMNotification;