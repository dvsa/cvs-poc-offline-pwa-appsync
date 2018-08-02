import { HomePage } from "./../home/home";
import { AuthProvider } from "./../../providers/auth/auth";
import { Component } from "@angular/core";
import { NavParams, NavController } from "ionic-angular";

/**
 * Generated class for the MainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
  selector: "page-main",
  templateUrl: "main.html"
})
export class MainPage {
  code: string;
  tokens: any;
  constructor(
    public auth: AuthProvider,
    public params: NavParams,
    private navCtrl: NavController
  ) {
    this.getTokens();
  }

  // this really needs to check the token is valid too
  async getTokens() {
    this.code = location.search.split("code=")[1];
    try {
      this.tokens = await this.auth.requestAccessToken(this.code);
      this.navCtrl.push(HomePage);
    } catch (error) {
      console.log("error", error);
    }
  }

  login() {
    this.auth.redirect();
  }
}
