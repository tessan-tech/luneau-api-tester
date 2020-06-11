import { Injectable } from "@angular/core";
import {
  HubConnectionBuilder,
  HubConnection,
  HttpTransportType,
} from "@microsoft/signalr";

interface IceCandidate {
  candidate: string;
  sdpMlineindex: number;
  sdpMid: string;
}

interface Sdp {
  type: string;
  sdp: string;
}

@Injectable({
  providedIn: "root",
})
export class SignalRTCService {
  private _hubConnection: HubConnection;
  constructor() {}

  public startConnection(
    deviceServerUrl: string,
    authToken: string
  ): Promise<void> {
    console.log(authToken);

    this._hubConnection = new HubConnectionBuilder()
      .withUrl(deviceServerUrl + "/hubs", {
        skipNegotiation: true,
        accessTokenFactory: () => authToken,
        transport: HttpTransportType.WebSockets,
      })
      .build();
    return this._hubConnection.start();
  }

  public onStreamUrl(action: (steamUrl: string) => any): void {
    return this._hubConnection.on("videoUrl", action);
  }
}
