const axios = require("axios");

const sendNotification = async (expoPushToken, message) => {
  try {
    const response = await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      sound: "default",
      title: "Yeni Görev",
      body: message,
    });
  } catch (error) {
    console.error(
      "Bildirim gönderilemedi:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = sendNotification;
