import { CacheUtils } from "./../../utils/cacheUtils";
import { TestsPage } from "./../tests/tests";
import { NavController } from "ionic-angular";
import { JwtProvider } from "./../../providers/jwt/jwt";
import { Component } from "@angular/core";
import { config } from "../../../aws-config";
import { StoreProvider } from "../../providers/store/store";
interface ITokenInfo {
  message: string;
  json: object;
}

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  token: any = { accessToken: "", idToken: "" };
  accessTokenInfo: ITokenInfo = { message: "", json: {} };
  idTokenInfo: ITokenInfo = { message: "", json: {} };

  constructor(
    public ngfCache: CacheUtils,
    public jwt: JwtProvider,
    public navCtrl: NavController,
    public store: StoreProvider
  ) {
    this.getTokenData();
  }

  async getTokenData() {
    this.token = await this.ngfCache.getCachedData(config.cookies.auth);

    // Validate JWT tokens.
    const getAccessTokenInfoPromise = this.jwt.validateJWTToken(
      this.token.accessToken
    );
    const getIdTokenInfoPromise = this.jwt.validateJWTToken(this.token.idToken);

    try {
      const [accTokenInfo, idTokenInfo] = [
        await getAccessTokenInfoPromise,
        await getIdTokenInfoPromise
      ];

      this.accessTokenInfo = accTokenInfo;
      this.idTokenInfo = idTokenInfo;
    } catch (err) {
      console.log("validation", err);
    }
  }

  logout() {
    this.removeCookies();
    window.localStorage.clear();
    window.open(
      `${config.auth.cognitoUrl}/logout?client_id=${
        config.auth.ClientId
      }&logout_uri=${encodeURIComponent(config.auth.logoutUri)}`,
      "_self"
    );
  }

  async removeCookies() {
    await this.ngfCache.deleteCache(config.cookies.auth);
    await this.ngfCache.deleteCache(config.cookies.refresh);
    await this.ngfCache.deleteCache("credentials");
  }

  viewTests() {
    this.navCtrl.push(TestsPage);
  }
}
