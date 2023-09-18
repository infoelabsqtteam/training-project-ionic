import { Capacitor } from '@capacitor/core';

export const environment = {
  production: true,
  serverhost: "https://prodserveritclabs.e-labs.ai",
  mediceaHost: "http://pcp.medicea.in/rest/",
  appId: "com.tech.elabs.ai",
  appName: "E-labs",
  appPlatformName: "E-Labs",
  web_site: "",
  razorpay_key : "rzp_test_P7SL8C2oelMvzE",
  verify_type : "email",
  app_Version : "@2023 E-Labs",
  privacy_policy: "",
  app_share: "https://play.google.com/store/apps/details?id=com.tech.elabs.ai",
  appCardMasterDataSize: 200,
  appHomePageLayout:"layout1",
  apiKey: "AIzaSyA--cLc1-rZJvuV18t0jxlzIbzxahuH-EQ",
  googleMapsApiKey: "AIzaSyAlvBSDoXj5p3D1Qdnee_j_cF8jIGo5pz8",
  plateformName: Capacitor.getPlatform() == "web" ? "android" : Capacitor.getPlatform()
};
