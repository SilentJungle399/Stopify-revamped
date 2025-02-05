# JamSpace

A real-time collaborative music streaming platform built with Nuxt 3 and TypeScript. JamSpace allows multiple users to listen to music together synchronously, featuring YouTube and Spotify integration, real-time chat, lyrics display, and comprehensive playback controls.

## Features
- Real-time music synchronization across all connected users
- YouTube and Spotify integration for music search and playback
- Live lyrics display with time synchronization
- Real-time chat functionality
- User authentication via Discord OAuth
- Dynamic queue management system
- Role-based access control
- Autoplay and smart queue features

## Tech Stack
- **Frontend**: Nuxt 3, TypeScript, Vue 3, Socket.IO
- **Backend**: Python (aiohttp), MongoDB

## Pictures
![image](https://github.com/user-attachments/assets/0e402dc8-bbe1-4f27-920a-f7a8e3e6487e)
![image](https://github.com/user-attachments/assets/e4270d14-da2e-4fb9-9b6e-7f4e029acc31)


## Installation

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB (assumed to be running on `localhost:27017`)
- PM2 (for production)

### Backend Setup
```bash
pip install -r requirements.txt
```

### Frontend Setup
```bash
npm install
# or
yarn install
```

## Development

Start the development servers:

```bash
# Start Nuxt development server
npm run dev

# Start Python backend server
npm run yt
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- WebSocket: http://localhost:3003

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start using PM2:
```bash
pm2 start pm2.config.js
```

This will start:
- Nuxt production server on port 25691
- Python backend on port 25690
- WebSocket server on port 25692

## License
MIT License - see the [LICENSE](LICENSE) file for details
