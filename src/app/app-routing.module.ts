import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent, AuthComponent } from "./components";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/auth",
    pathMatch: "full",
  },
  {
    path: "auth",
    component: AuthComponent,
  },
  {
    path: "home",
    component: HomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
