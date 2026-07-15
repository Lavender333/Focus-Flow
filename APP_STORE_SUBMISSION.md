# Focus Flow App Store Submission

## Required Local Secrets

Create `.env.local` on the release machine:

```bash
VITE_RC_KEY="appl_your_real_revenuecat_public_sdk_key"
FOCUS_FLOW_DEVELOPMENT_TEAM="YOUR10CHARID"
```

`VITE_RC_KEY` must be the RevenueCat Apple public SDK key for the same app that owns the App Store Connect product. `FOCUS_FLOW_DEVELOPMENT_TEAM` must be the Apple Developer Team ID selected in Xcode.

## App Store Connect

- Bundle ID: `com.lavender333.focusflow`
- Version: `1.0`
- Build: `1`
- Support URL: `https://lavender333.github.io/Focus-Flow/`
- Privacy Policy URL: `https://lavender333.github.io/Focus-Flow/privacy.html`
- Terms URL: `https://lavender333.github.io/Focus-Flow/terms.html`

## In-App Purchase / RevenueCat

- Product type: Non-consumable, unless the business model changes back to subscription.
- Product name shown in app: `Studio unlock`
- Price shown in app: `$19.99`
- RevenueCat entitlement identifier required by code: `studio`
- RevenueCat offering must contain at least one package for the app to purchase.
- App Review must be able to see and buy the product in sandbox.

## App Privacy Labels

Use the exact live SDK setup when completing App Privacy in App Store Connect.

- Tracking: No, unless a new SDK is added that tracks users across apps/websites.
- Data collected by Focus Flow account system: None. The app does not require a Focus Flow account.
- Purchases: Yes, for Apple/RevenueCat purchase verification. This may include purchase identifiers and transaction status.
- User content: Audio/microphone practice is local in the app. Do not mark uploaded/collected unless a future server upload is added.
- Diagnostics: Review Apple/RevenueCat/Capacitor SDK privacy manifests in Xcode during archive.

## Review Notes

Focus Flow is a wellness and focus app with audio tones, haptics, local preferences, local garden entries, and optional Studio unlock.

Studio unlock is purchased through Apple in-app purchase and verified with RevenueCat. Restore purchases is available in the Studio screen. The app is not medical care and does not diagnose, treat, cure, or prevent any condition.

No Focus Flow account is required. Preferences, rituals, and garden entries are stored locally on device.

## Manual Device Test

Run these on a real iPhone with a sandbox tester before submission:

- Fresh install opens without a crash.
- Start a session and confirm audio starts after user gesture.
- Confirm volume, pause, and end session work.
- Confirm lotus bloom appears after a completed session.
- Open Studio, purchase Studio unlock with sandbox tester, and confirm content unlocks.
- Delete app, reinstall, tap Restore purchases, and confirm Studio unlock returns.
- Deny microphone permission and confirm chant/voice tools fail gracefully.
- Grant microphone permission and confirm voice visualization works.
- Confirm Terms and Privacy links open inside the app.

## Release Commands

```bash
npm run preflight:app-store
npm run build:app-store
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination generic/platform=iOS build
```
