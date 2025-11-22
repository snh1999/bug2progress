import { io, Socket } from 'socket.io-client';

export interface AuthenticatedSocket extends Socket {
  user: {
    id: string;
    name: string;
    username: string;
  };
  projectId?: string;
}

export const connectSocket = ({
  token,
  projectId,
  baseUrl,
}: {
  token: string;
  projectId: string;
  baseUrl: string;
}) => {
  return new Promise<Socket>((resolve, reject) => {
    const socket = io(baseUrl, {
      auth: { token },
      query: projectId ? { projectId } : {},
      transports: ['websocket'],
      reconnection: false,
      timeout: 5000,
    });
    let timeoutId: NodeJS.Timeout;

    socket.on('connect_error', (error) => {
      clearTimeout(timeoutId);
      socket.close();
      reject(error);
    });

    socket.on('connect', () => {
      clearTimeout(timeoutId);
      resolve(socket);
    });

    timeoutId = setTimeout(() => {
      socket.close();
      reject(new Error('Connection timeout - server not responding'));
    }, 3000);
  });
};

export function waitForSocketEvent<T>(
  socket: Socket,
  event: string,
  timeout = 5000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout: ${event}`)),
      timeout,
    );
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}
