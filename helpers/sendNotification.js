// helpers/sendNotification.js
const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

const sendPushNotification = async (expoPushToken, title, body) => {
  // Create the messages that you want to send to clients
  let messages = [];
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
    return;
  }

  messages.push({
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { withSome: 'data' },
  });

  // The Expo push notification service accepts batches of notifications
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

module.exports = sendPushNotification;