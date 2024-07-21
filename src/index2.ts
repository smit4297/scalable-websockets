import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4} from 'uuid'
import { createClient } from 'redis';


const publishClient = createClient();
publishClient.connect();

const sunscribeClient = createClient();
sunscribeClient.connect();

const wss = new WebSocketServer({ port: 8080 });

const subsciption : {[key : string] : {
  ws:WebSocket,
  rooms:string[]
}} = {}

wss.on('connection', function connection(ws) {

  const randomId = uuidv4();
  subsciption[randomId] = {ws : ws, rooms : []}

  ws.on('message', function message(data) {
    // console.log('received: %s', data);
    const parsed = JSON.parse(data as unknown as string);
    if(parsed.type === 'subscribe'){
      subsciption[randomId].rooms.push(parsed.room);
      
      ws.send(JSON.stringify({type: 'subscribed', room: parsed.room}));
    }if(parsed.type === 'unsubscribe'){
      subsciption[randomId].rooms = subsciption[randomId].rooms.filter(room => room !== parsed.room);
      ws.send(JSON.stringify({type: 'unsubscribed', room: parsed.room}));
    }if(parsed.type === 'sendMessage'){
      const message = parsed.message;
      const roomId = parsed.room;
      // Object.keys(subsciption).forEach(key => {
      //   const {ws, rooms} = subsciption[key]
      //   if(rooms.includes(roomId)){
      //     ws.send(JSON.stringify({type: 'message', room: roomId, message: message}));
      //   }
      // });

      publishClient.publish(roomId, JSON.stringify({
        type: "sendMessage",
        roomId: roomId,
        message:message
      }));
    }
  });

  ws.send('Welcome to the WebSocket server');
});




