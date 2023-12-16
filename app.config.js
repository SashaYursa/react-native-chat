import 'dotenv/config';
export default{
  "expo": {
    "name": "chat",
    "slug": "chat",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/mainicon.png",
    "userInterfaceStyle": "light",
    "scheme": "chat-app",
    "splash": {
      "image": "./assets/mainsplash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.yursaolexandr.chat",
      "adaptiveIcon": {
        "foregroundImage": "./assets/mainicon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "apiKey": process.env.apiKey,
      "authDomain": process.env.authDomain,
      "projectId": process.env.projectId,
      "storageBucket": process.env.storageBucket,
      "messagingSenderId": process.env.messagingSenderId,
      "appId": process.env.appId,
      "eas": {
        "projectId": "af488e39-bbc4-455a-9390-f5fd09e580fc"
      }
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "owner": "yursaolexandr"
  }
}
