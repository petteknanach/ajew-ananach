@echo off
echo 🚀 Ajew Ananach Build Script
echo.
echo 1. Login to EAS:
npx eas login
echo.
echo 2. Build iOS:
npx eas build --platform ios --profile production
echo.
echo 3. Build Android:
npx eas build --platform android --profile production
echo.
echo ✅ Builds started! Check: https://expo.dev/accounts/petteknanach/projects/ajew-ananach/builds
pause