import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"],
})
export class AuthComponent {
  public authUrl: string = "http://localhost:3000/api/organization/token";
  public deviceServerUrl: string = "http://localhost:3001";
  public apiKey: string = "";
  public authToken: string;
  public isFetching: boolean = false;

  constructor(private router: Router) {
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
    this.router.navigate(["home"], {
      queryParams: { authToken: this.authToken },
    });
  }

  private saveCredentials(): void {
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
}
