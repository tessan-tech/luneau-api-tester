import { Component } from "@angular/core";
import { SignalRTCService as SignalrRTCService } from "./services/rtc-signalr.service";
import { RTCConnection, RTCInitiator, RTCInformation } from "light-rtc";
import { ConsoleReporter } from 'jasmine';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public authUrl: string;
  public deviceServerUrl: string;
  public apiKey: string;
  public authToken: string;
  public deviceStream: MediaStream;

  constructor(private signalrRTCService: SignalrRTCService) {}

  public async requestToken(): Promise<void> {
    const response = await fetch(this.authUrl, {
      headers: {
        authorization: this.apiKey,
      },
    });
    const json = await response.json();
    this.authToken = json.accessToken;
    console.log("authentitcated, token : " + this.authToken);
  }

  public async startRtcConnection(): Promise<void> {
    await this.signalrRTCService.StartConnection(this.deviceServerUrl);
    console.log("connected to hub");
    const initiator = new RTCInitiator(
      undefined,
      (infos) => {
        if (infos.type === "ICECANDIDATE") {
          this.signalrRTCService.SendIceCandidate(infos.content[0]);
          return;
        }
        this.signalrRTCService.SendSdp(infos.content);
      },
      undefined,
      console.warn
    );
    this.signalrRTCService.OnIceCandidate((iceCandidate) => {
      console.log(iceCandidate);

      initiator.addInformations(
        new RTCInformation("ICECANDIDATE", iceCandidate)
      );
    });
    this.signalrRTCService.OnSdp((sdp) => {
      console.log(sdp);

      initiator.addInformations(new RTCInformation("ANSWER", sdp));
    });
    initiator.onStream((stream) => {
      console.log("Remote stream received", stream);
      this.deviceStream = stream;
    });
  }
}
