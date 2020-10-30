import { BrowserModule } from "@angular/pla";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { SignalRTCService } from "./services/rtc-signalr.service";
import { AuthComponent, HomeComponent } from "./components";
import { AppRoutingModule } from "./app-routing.module";

@NgModule({
  declarations: [AppComponent, AuthComponent, HomeComponent],
  imports: [BrowserModule, FormsModule, AppRoutingModule, ReactiveFormsModule],
  providers: [SignalRTCService],
  bootstrap: [AppComponent],
})
export class AppModule {}
