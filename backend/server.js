import dotenv from 'dotenv';
import app from './index.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Backend server running at http://${HOST}:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  process.exit(1);
});

export default server;
