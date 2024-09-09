const axios = require("axios");

const sendNotification = async (expoPushToken, message) => {
  try {
    console.log("Bildirim gönderiliyor...");
    console.log("Expo Push Token:", expoPushToken);
    console.log("Mesaj:", message);

    const response = await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      sound: "default",
      title: "Yeni Görev",
      body: message,
    });

    console.log("Bildirim başarıyla gönderildi:", response.data);
  } catch (error) {
    console.error(
      "Bildirim gönderilemedi:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = sendNotification;