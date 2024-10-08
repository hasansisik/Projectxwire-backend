const axios = require("axios");

const sendNotification = async (oneSignalId, message) => {
  const payload = {
    to: oneSignalId,
    sound: "default",
    title: "Yeni Görev",
    body: message,
  };

  try {
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      payload
    );
    console.log("Bildirim başarıyla gönderildi:", response.data);
  } catch (error) {
    console.error(
      "Bildirim gönderilemedi:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = sendNotification;
