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
      .withUrl(deviceServerUrl + "/hubs/rtc", {
        skipNegotiation: true,
        accessTokenFactory: () => authToken,
        transport: HttpTransportType.WebSockets,
      })
      .build();
    return this._hubConnection.start();
  }

  public onIceCandidate(action: (iceCandidate: IceCandidate) => void): void {
    return this._hubConnection.on("iceCandidate", action);
  }

  public onSdp(action: (sdp: Sdp) => void): void {
    return this._hubConnection.on("sdp", action);
  }

  public sendSdp(sdp: Sdp): Promise<void> {
    return this._hubConnection.invoke("AddSdp", sdp);
  }

  public sendIceCandidate(iceCandidate: IceCandidate): Promise<void> {
    return this._hubConnection.invoke("AddIceCandidate", iceCandidate);
  }
}
