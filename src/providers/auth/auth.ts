import { AuthUtils } from "./../../utils/authUtils";
import { CacheUtils } from "./../../utils/cacheUtils";
import { config } from "./../../../aws-config";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  config as awsConfig,
  CognitoIdentityCredentials,
  Credentials as awsCredentials
} from "aws-sdk";
import "rxjs/add/operator/toPromise";

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {
  constructor(
    public http: HttpClient,
    private ngfCache: CacheUtils,
    private authUtils: AuthUtils
  ) {}

  /**
   * generate login url and redirect to
   */
  redirect() {
    this.authUtils.redirectAuth();
  }

  /**
   * retrieve temp credentials from congnito using token id
   * @param tokenId STRING
   */
  async retrieveCredentials(tokenId) {
    const authenticator = this.authUtils.getAuthenticator();

    awsConfig.update({ region: config.auth.region });

    awsConfig.credentials = new CognitoIdentityCredentials({
      IdentityPoolId: config.auth.identityPoolId,
      Logins: {
        [authenticator]: tokenId
      }
    });

    await (awsConfig.credentials as awsCredentials).getPromise();
  }

  /**
   * request access token using code returned fomr azure AD
   * @param code  STRING
   */
  requestAccessToken(code) {
    const defaults = this.authUtils.getHeaders();
    const qryString = this.authUtils.createPayload(code, true);

    // convert result to observable
    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${config.auth.cognitoUrl}${config.auth.oAuthEndpoint}`,
          qryString,
          defaults
        )
        .toPromise()
        .then(
          async (data: any) => {
            await this.ngfCache.setCache(
              config.cookies.auth,
              {
                accessToken: data.access_token,
                idToken: data.id_token
              },
              data.expires_in * 1000
            );

            await this.ngfCache.setCache(
              config.cookies.refresh,
              { refreshToken: data.refresh_token },
              2592000000
            );

            try {
              await this.retrieveCredentials(data.id_token);
              const {
                accessKeyId,
                secretAccessKey,
                sessionToken
              }: any = awsConfig.credentials;
              await this.ngfCache.setCache(
                config.cookies.creds,
                {
                  accessKeyId,
                  secretAccessKey,
                  sessionToken
                },
                data.expires_in * 1000
              );
            } catch (error) {
              reject(error);
            }

            resolve(data);
          },
          err => reject(err)
        );
    });
  }
}
