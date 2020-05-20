import { Component } from "@angular/core";
import { SignalRTCService as SignalrRTCService } from "./services/rtc-signalr.service";
import { RTCInitiator, RTCInformation } from "light-rtc";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public authUrl: string = "http://localhost:3000/api/organization/token";
  public deviceServerUrl: string = "http://localhost:3001";
  public apiKey: string = "";
  public authToken: string;
  public deviceStream: MediaStream;
  public isFetching: boolean = false;

  constructor(private signalrRTCService: SignalrRTCService) {
    this.getCredentials();
  }

  private getCredentials(): void {
    const credentials: {
      authUrl: string;
      apiKey: string;
      deviceServerUrl: string;
    } = JSON.parse(localStorage.getItem("credentials"));
    if (!credentials) return;
    this.authUrl = credentials.authUrl;
    this.apiKey = credentials.apiKey;
    this.deviceServerUrl = credentials.deviceServerUrl;
  }

  public async requestToken(): Promise<void> {
    this.isFetching = true;
    this.saveCredentials();
    const response = await fetch(this.authUrl, {
      headers: {
        authorization: this.apiKey,
      },
    });
    const json = await response.json();
    this.isFetching = false;
    this.authToken = json.accessToken;
    this.startRtcConnection(this.authToken);
    console.log("authenticated, token : " + this.authToken);
  }

  private saveCredentials() {
    const authUrl = this.authUrl;
    const apiKey = this.apiKey;
    const deviceServerUrl = this.deviceServerUrl;
    const credentials = {
      authUrl,
      apiKey,
      deviceServerUrl,
    };
    localStorage.setItem("credentials", JSON.stringify(credentials));
  }

  public async startRtcConnection(authToken: string): Promise<void> {
    await this.signalrRTCService.startConnection(
      this.deviceServerUrl,
      authToken
    );
    console.log("connected to hub");
    const initiator = new RTCInitiator(
      undefined,
      (infos) => {
        if (infos.type === "ICECANDIDATE") {
          this.signalrRTCService.sendIceCandidate(infos.content[0]);
          return;
        }
        this.signalrRTCService.sendSdp(infos.content);
      },
      undefined,
      console.warn
    );
    this.signalrRTCService.onIceCandidate((iceCandidate) => {
      console.log(iceCandidate);

      initiator.addInformations(
        new RTCInformation("ICECANDIDATE", iceCandidate)
      );
    });
    this.signalrRTCService.onSdp((sdp) => {
      console.log(sdp);

      initiator.addInformations(new RTCInformation("ANSWER", sdp));
    });
    initiator.onStream((stream) => {
      console.log("Remote stream received", stream);
      this.deviceStream = stream;
    });
  }
}
