import { Injectable } from "@angular/core";
import {
  HubConnectionBuilder,
  HubConnection,
  HttpTransportType,
} from "@microsoft/signalr";

@Injectable({
  providedIn: "root",
})
export class SignalRTCService {
  private hubConnection: HubConnection;
  constructor() {}

  public startConnection(
    deviceServerUrl: string,
    authToken: string
  ): Promise<void> {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(deviceServerUrl + "/hubs", {
        skipNegotiation: true,
        accessTokenFactory: () => authToken,
        transport: HttpTransportType.WebSockets,
      })
      .build();
    return this.hubConnection.start();
  }

  public onStatus(action: (status: Status) => any): void {
    this.hubConnection.on("status", action);
  }

  public onImage(action: (base64Img: string) => any): void {
    return this.hubConnection.on("image", action);
  }

  public onAvailableCommands(
    action: (availableCommands: string[]) => any
  ): void {
    return this.hubConnection.on("availableCommands", action);
  }

  public execute(commandName: string, argument: any): Promise<any> {
    console.log(argument);

    return this.hubConnection.invoke("command", commandName, argument);
  }
}

export interface Status {
  name: string;
  payload: any;
}

export enum EXAM_STATUS {
  AVAILABLE_EXAMS = "AVAILABLE_EXAMS",
  STARTING_EXAM = "STARTING_EXAM",
  FAILED_EXAM = "FAILED_EXAM",
  RESULT_EXAM = "RESULT_EXAM",
}
