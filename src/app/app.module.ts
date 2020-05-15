import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { SignalRTCService } from "./services/rtc-signalr.service";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule],
  providers: [SignalRTCService],
  bootstrap: [AppComponent],
})
export class AppModule {}
