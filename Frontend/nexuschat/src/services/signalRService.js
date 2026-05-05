import * as signalR from "@microsoft/signalr"

let connection = null;

export const createConnection = (token) =>
{
    connection = new signalR.HubConnectionBuilder()
                            .withUrl("https://localhost:5001/hubs/chat",
                                {
                                    accessTokenFactory: () => token
                                }
                            ).withAutomaticReconnect()
                            .build();
    return connection;
};

export const getConnection = () => connection;