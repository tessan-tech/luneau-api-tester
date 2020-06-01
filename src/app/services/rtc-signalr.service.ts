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

  public addItem(
    item: { name: string; price: number },
    quantity: number
  ): Promise<{ result: number; totalPrice: number }> {
    return this._hubConnection.invoke("addItem", item, quantity);
  }

  public onMessage(action: (message: string) => any): void {
    this._hubConnection.on("message", action);
  }

  public onImage(action: (base64Img: string) => any): void {
    return this._hubConnection.on("image", action);
  }
}
