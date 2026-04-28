
# Ajew Ananach - Production Build Instructions

## 📱 Build Commands

### iOS Production Build
```bash
cd "C:\Users\Pettek\.openclaw\workspace\AjewAnanach"
npx eas build --platform ios --profile production
```

### Android Production Build
```bash
cd "C:\Users\Pettek\.openclaw\workspace\AjewAnanach"
npx eas build --platform android --profile production
```

### Development Build (for testing)
```bash
cd "C:\Users\Pettek\.openclaw\workspace\AjewAnanach"
npx eas build --platform all --profile development
```

## 🔧 Pre-Build Checklist

### Configuration Files
- [ ] app.json
- [ ] package.json
- [ ] eas.json
- [ ] .easignore
- [ ] .gitignore

### Assets (in assets/ directory)
- [ ] icon.png
- [ ] adaptive-icon.png
- [ ] splash.png
- [ ] favicon.png

### API Configuration
- [ ] API_BASE_URL set to production endpoint
- [ ] Mock data fallback enabled
- [ ] Caching configured (24 hours)

### App Store Requirements
- [ ] App name: Ajew Ananach
- [ ] Bundle ID: org.ajew.ananach
- [ ] Version: 1.0.0
- [ ] Build number: 1 (iOS), 1 (Android)

## 🚀 Build Process

1. **Login to EAS** (if not already logged in):
   ```bash
   npx eas login
   ```

2. **Configure EAS project**:
   ```bash
   npx eas init
   ```

3. **Build iOS**:
   ```bash
   npx eas build --platform ios --profile production
   ```
   - Wait ~20-30 minutes
   - Download IPA file when ready

4. **Build Android**:
   ```bash
   npx eas build --platform android --profile production
   ```
   - Wait ~15-20 minutes
   - Download APK/AAB file when ready

5. **Upload to App Stores**:
   - iOS: Upload IPA to App Store Connect via Transporter
   - Android: Upload AAB to Google Play Console

## 📊 Build Profiles

### Production Profile (app.json)
- Optimized for release
- Minified code
- No debug tools
- Production API endpoints

### Development Profile
- Debug tools enabled
- Development API endpoints
- Faster builds
- For testing only

## 🔍 Post-Build Testing

### iOS Testing
1. Install on physical iOS device
2. Test all user flows
3. Check performance
4. Verify API connectivity

### Android Testing
1. Install on physical Android device
2. Test all user flows
3. Check different screen sizes
4. Verify API connectivity

## 🎯 Success Criteria

- [ ] App launches in < 3 seconds
- [ ] All features work correctly
- [ ] API connectivity stable
- [ ] No crashes in testing
- [ ] Memory usage < 100MB
- [ ] Battery impact minimal

## 🦞 Final Steps

1. **Submit to App Store Connect**
2. **Submit to Google Play Console**
3. **Deploy API to production**
4. **Launch announcement**
5. **Monitor reviews & feedback**

**Na Nach Nachma Nachman Me'Uman!** 🎉
