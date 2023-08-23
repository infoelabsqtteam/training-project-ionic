// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import {getPlatforms, isPlatform} from "@ionic/angular";
import { Capacitor } from '@capacitor/core';

export const environment = {
  production: false,
  baseUrl: 'https://omoknow.com/rest/',
  serverhost: "http://localhost:8104",
  // serverhost: "https://uatserveritclabs.e-labs.ai",
  mediceaHost: "http://pcp.medicea.in/rest/",
  appId: "com.tech.elabs.ionic",
  appName: "E-Labs",
  appPlatformName: "E-Labs",
  web_site: "",
  razorpay_key : "rzp_test_P7SL8C2oelMvzE",
  verify_type : "email",
  app_Version : "@2023 E-Labs",
  privacy_policy: "",
  app_share: "https://play.google.com/store/apps/details?id=com.tech.elabs.ionic",
  appCardMasterDataSize: 200,
  appHomePageLayout:"layout1",
  apiKey: "AIzaSyA--cLc1-rZJvuV18t0jxlzIbzxahuH-EQ",
  googleMapsApiKey: "AIzaSyAlvBSDoXj5p3D1Qdnee_j_cF8jIGo5pz8",
  plateformName: Capacitor.getPlatform() == "web" ? "android" : Capacitor.getPlatform()
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
