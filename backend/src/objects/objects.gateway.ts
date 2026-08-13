import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ObjectsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ObjectsGateway.name);

  afterInit() {
    this.logger.log('Socket.IO Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Broadcast newly created object to all connected clients
   */
  emitObjectCreated(object: any) {
    this.logger.log(`Broadcasting object:created -> ${object.id || object._id}`);
    this.server.emit('object:created', object);
  }

  /**
   * Broadcast deleted object ID to all connected clients
   */
  emitObjectDeleted(id: string) {
    this.logger.log(`Broadcasting object:deleted -> ${id}`);
    this.server.emit('object:deleted', { id });
  }
}
