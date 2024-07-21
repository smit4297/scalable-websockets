import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from 'redis';

// Create Redis clients
const publishClient = createClient();
const subscribeClient = createClient();

publishClient.connect();
subscribeClient.connect();

const wss = new WebSocketServer({ port: 8080 });

const subscriptions: { [key: string]: { ws: WebSocket; rooms: string[] } } = {};

// Subscribe to Redis channels and broadcast messages to WebSocket clients
subscribeClient.on('message', (channel, message) => {
  Object.keys(subscriptions).forEach((key) => {
    const { ws, rooms } = subscriptions[key];
    if (rooms.includes(channel)) {
      ws.send(message);
    }
  });
});

wss.on('connection', (ws) => {
  const randomId = uuidv4();
  subscriptions[randomId] = { ws: ws, rooms: [] };

  ws.on('message', (data) => {
    const parsed = JSON.parse(data as unknown as string);

    if (parsed.type === 'subscribe') {
      subscriptions[randomId].rooms.push(parsed.room);
      ws.send(JSON.stringify({ type: 'subscribed', room: parsed.room }));

      // Subscribe to the Redis channel with a listener
      subscribeClient.subscribe(parsed.room, (err, count) => {
        if (err) {
          console.error('Failed to subscribe:', err);
          return;
        }
        console.log(`Subscribed to ${count} channels. Listening for updates on the ${parsed.room} channel.`);
      });
    } else if (parsed.type === 'unsubscribe') {
      subscriptions[randomId].rooms = subscriptions[randomId].rooms.filter((room) => room !== parsed.room);
      ws.send(JSON.stringify({ type: 'unsubscribed', room: parsed.room }));

      // Unsubscribe from the Redis channel if no other clients are subscribed to it
      const isRoomStillSubscribed = Object.keys(subscriptions).some((key) => subscriptions[key].rooms.includes(parsed.room));
      if (!isRoomStillSubscribed) {
        subscribeClient.unsubscribe(parsed.room, (err, count) => {
          if (err) {
            console.error('Failed to unsubscribe:', err);
            return;
          }
          console.log(`Unsubscribed from ${count} channels. No longer listening for updates on the ${parsed.room} channel.`);
        });
      }
    } else if (parsed.type === 'sendMessage') {
      const message = parsed.message;
      const roomId = parsed.room;

      // Publish the message to the Redis channel
      publishClient.publish(roomId, JSON.stringify({
        type: 'message',
        roomId: roomId,
        message: message,
      }));
    }
  });

  ws.on('close', () => {
    // Clean up the subscriptions when the client disconnects
    const rooms = subscriptions[randomId].rooms;
    delete subscriptions[randomId];

    rooms.forEach((room) => {
      const isRoomStillSubscribed = Object.keys(subscriptions).some((key) => subscriptions[key].rooms.includes(room));
      if (!isRoomStillSubscribed) {
        subscribeClient.unsubscribe(room, (err, count) => {
          if (err) {
            console.error('Failed to unsubscribe:', err);
            return;
          }
          console.log(`Unsubscribed from ${count} channels. No longer listening for updates on the ${room} channel.`);
        });
      }
    });
  });

  ws.send('Welcome to the WebSocket server');
});

publishClient.on('error', (err) => console.error('Redis publish client error:', err));
subscribeClient.on('error', (err) => console.error('Redis subscribe client error:', err));
