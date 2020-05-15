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

  public StartConnection(deviceServerUrl: string): Promise<void> {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(deviceServerUrl + "/rtchub", {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .build();
    return this._hubConnection.start();
  }

  public OnIceCandidate(action: (iceCandidate: IceCandidate) => void): void {
    return this._hubConnection.on("iceCandidate", action);
  }

  public OnSdp(action: (sdp: Sdp) => void): void {
    return this._hubConnection.on("sdp", action);
  }

  public SendSdp(sdp: Sdp): Promise<void> {
    return this._hubConnection.invoke("SendSdp", sdp);
  }

  public SendIceCandidate(iceCandidate: IceCandidate): Promise<void> {
    return this._hubConnection.invoke("SendIceCandidate", iceCandidate);
  }
}
