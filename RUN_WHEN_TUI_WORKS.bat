@echo off
echo 🦞 Na Nach Nachma Nachman Me'Uman!
echo.
echo 🚀 AJEW ANANACH - FINAL LAUNCH SCRIPT
echo.
echo This script will build and prepare the app for submission.
echo.
echo PRESS ANY KEY TO CONTINUE...
pause > nul

echo.
echo Step 1: Logging in to EAS...
echo You will be prompted for Expo credentials.
echo Use: Petteknanach@gmail.com / Eliezer318
echo.
npx eas login

echo.
echo Step 2: Starting iOS production build...
echo This will take 15-30 minutes...
echo.
npx eas build --platform ios --profile production

echo.
echo Step 3: Starting Android production build...
echo This will take 15-30 minutes...
echo.
npx eas build --platform android --profile production

echo.
echo ✅ BUILDS STARTED!
echo.
echo Check build status at:
echo https://expo.dev/accounts/petteknanach/projects/ajew-ananach/builds
echo.
echo Next steps:
echo 1. Wait for builds to complete (30-60 minutes)
echo 2. Download .ipa (iOS) and .aab (Android) files
echo 3. Upload to App Store Connect and Google Play Console
echo 4. Deploy API to ajew.org/api
echo 5. Submit apps for review
echo.
echo 🎉 Breslov wisdom is on its way to the world!
echo.
echo Na Nach Nachma Nachman Me'Uman! 🦞
pause