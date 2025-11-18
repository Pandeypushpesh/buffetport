import dotenv from 'dotenv';
import app from './index.js';

dotenv.config();

// Force localhost
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

const numericPort = parseInt(PORT, 10);

if (isNaN(numericPort)) {
    console.error(`❌ Invalid PORT value specified: ${PORT}. Please check your .env file.`);
    process.exit(1);
}

const server = app.listen(numericPort, HOST, () => {
  console.log(`✅ Backend server running at http://${HOST}:${numericPort}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${numericPort} is already in use. Try a different port.`);
  } else {
    console.error('❌ Failed to start backend server:', error.message);
  }
  process.exit(1);
});

export default server;
