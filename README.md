Sure, here's a `README.md` file that includes the necessary setup and instructions to run your WebSocket server with Redis:


# WebSocket Server with Redis Pub/Sub

This project is a WebSocket server that scales using Redis Pub/Sub. It enables clients to subscribe to and send messages in different rooms. The Redis Pub/Sub mechanism ensures that messages are distributed across multiple WebSocket server instances.

## Prerequisites

- Node.js (version 14 or higher)
- Docker

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/websocket-redis-server.git
   cd websocket-redis-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Running Redis with Docker

To run Redis using Docker, use the following command:

```bash
docker run -p 6379:6379 redis
```

## Running the WebSocket Server

1. Start the WebSocket server:

   ```bash
   node run dev
   ```

   This will start the server on port 8080.

## Usage

### WebSocket Client

Connect to the WebSocket server using a WebSocket client (e.g., a browser, Postman, or a custom client).

- **Subscribe to a room:**

  ```json
  {
    "type": "subscribe",
    "room": "roomName"
  }
  ```

- **Unsubscribe from a room:**

  ```json
  {
    "type": "unsubscribe",
    "room": "roomName"
  }
  ```

- **Send a message to a room:**

  ```json
  {
    "type": "sendMessage",
    "room": "roomName",
    "message": "Your message here"
  }
  ```

### WebSocket Server

- **Connection:**

  When a client connects, they receive a welcome message:

  ```json
  "Welcome to the WebSocket server"
  ```

- **Subscription:**

  When a client subscribes to a room, they receive a confirmation:

  ```json
  {
    "type": "subscribed",
    "room": "roomName"
  }
  ```

- **Unsubscription:**

  When a client unsubscribes from a room, they receive a confirmation:

  ```json
  {
    "type": "unsubscribed",
    "room": "roomName"
  }
  ```

- **Message Broadcast:**

  When a message is sent to a room, all subscribed clients receive the message:

  ```json
  {
    "type": "message",
    "roomId": "roomName",
    "message": "Your message here"
  }
  ```

## Scaling

To scale the WebSocket server, deploy multiple instances of the server. Each instance will connect to the same Redis instance and handle messages via Redis Pub/Sub.

## Troubleshooting

- Ensure Redis is running and accessible on `localhost:6379`.
- Check for any errors in the server logs and address them accordingly.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
```

Make sure to replace `yourusername` with your actual GitHub username or the repository URL. This `README.md` file provides a comprehensive guide for setting up and running your WebSocket server with Redis Pub/Sub, including instructions for running Redis with Docker.
