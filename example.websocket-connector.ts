import aws, { ApiGatewayManagementApi } from "aws-sdk";

interface ConnectorIf {
  ApiGateway: ApiConnector;
  Dynamodb: any;
}

interface ApiInterface {
  endpoint: string;
}

class ApiConnector {
  _connector: ApiGatewayManagementApi;
  services: ConnectorIf;
  constructor(opts: ApiInterface, _services?: ConnectorIf) {
    this._connector = new aws.ApiGatewayManagementApi(opts);
    this.services = _services;
  }

  get connector() {
    return this._connector;
  }

  async sendMessage(connectionId: string, data) {
    try {
      return await this._connector
        .postToConnection({
          ConnectionId: connectionId,
          Data: data,
        })
        .promise();
    } catch (error) {
      console.error("Unable to generate socket message", error);
      if (error.statusCode === 410) {
        await this.services.Dynamodb.removeSocket(connectionId);
      }
    }
  }

  async broadcastMessage(userIds: string[], data) {
    try {
      const { Items: sockets } =
        await this.services.Dynamodb.findSocketsByUsers(userIds);
      return Promise.allSettled(
        sockets.map((socket) => {
          return this.sendMessage(
            socket.connectionId,
            JSON.stringify(data)
          );
        })
      );
    } catch (error) {
      throw error;
    }
  }

  async broadcastToMany(userIds: string[], dataList: any[]) {
    try {
      if (userIds.length < 1) {
        return;
      }
      const { Items: sockets } =
        await this.services.Dynamodb.findSocketsByUsers(userIds);
      return Promise.all(
        sockets.map((socket) => {
          return Promise.all(
            dataList.map((data) => {
              return this.sendMessage(
                socket.connectionId,
                JSON.stringify(data)
              );
            })
          );
        })
      );
    } catch (error) {
      throw error;
    }
  }

  async broadcastToEveryone(attendees, data) {
    try {
      return Promise.all(
        attendees.map((attendee) => {
          return this.sendMessage(
            attendee.attendeeId,
            JSON.stringify(data)
          );
        })
      );
    } catch (error) {
      throw error;
    }
  }

  async broadcastToAll(data: any) {
    try {
      const userIds =
        await this.services.Dynamodb.User.getAllUserConnectionId();
      return Promise.all(
        userIds.map((userId) => {
          return this.sendMessage(userId, JSON.stringify(data));
        })
      );
    } catch (error) {
      throw error;
    }
  }
}

export default ApiConnector;
