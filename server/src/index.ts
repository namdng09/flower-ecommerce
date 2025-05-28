import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const { HOST, PORT } = process.env;

const onError = (error: NodeJS.ErrnoException): void => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = (): void => {
  const addr = server.address();
  if (addr === null) {
    console.log('Server address not available');
    return;
  }
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `PORT ${addr.port}`;
  console.log(`Listening on ${bind}`);
};

const server = app.listen(PORT, () => {
  console.log(`Server is Fire at http://${HOST}:${PORT}`);
});

server.on('error', onError);
server.on('listening', onListening);
