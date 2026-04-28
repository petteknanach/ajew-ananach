Write-Host "🦞 Na Nach Nachma Nachman Me'Uman!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 AJEW ANANACH - FINAL LAUNCH SCRIPT" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will build and prepare the app for submission."
Write-Host ""
Write-Host "Step 1: Logging in to EAS..."
Write-Host "You will be prompted for Expo credentials."
Write-Host "Use: Petteknanach@gmail.com / Eliezer318"
Write-Host ""
npx eas login

Write-Host ""
Write-Host "Step 2: Starting iOS production build..."
Write-Host "This will take 15-30 minutes..."
Write-Host ""
npx eas build --platform ios --profile production

Write-Host ""
Write-Host "Step 3: Starting Android production build..."
Write-Host "This will take 15-30 minutes..."
Write-Host ""
npx eas build --platform android --profile production

Write-Host ""
Write-Host "✅ BUILDS STARTED!" -ForegroundColor Green
Write-Host ""
Write-Host "Check build status at:"
Write-Host "https://expo.dev/accounts/petteknanach/projects/ajew-ananach/builds"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Wait for builds to complete (30-60 minutes)"
Write-Host "2. Download .ipa (iOS) and .aab (Android) files"
Write-Host "3. Upload to App Store Connect and Google Play Console"
Write-Host "4. Deploy API to ajew.org/api"
Write-Host "5. Submit apps for review"
Write-Host ""
Write-Host "🎉 Breslov wisdom is on its way to the world!"
Write-Host ""
Write-Host "Na Nach Nachma Nachman Me'Uman! 🦞" -ForegroundColor Green