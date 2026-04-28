# AjewAnanach App — Next Release Notes

## BUG FIXES

### Critical
1. **Scrolling obstruction** — Header/footer cover text when reading. Need proper SafeAreaView insets and scroll-aware hide/show
2. **Chain of Light stuck loading** — /chain-of-light shows "loading" indefinitely in app
3. **Chumash with Likutay Halachos doesn't load** — Works on website, not in app
4. **Otzar HaYirah doesn't load** — Route was fixed on website, app may need API update
5. **Non-Breslov books don't open** — Tanach, Talmud, Mishna, Rambam, Zohar not loading

### Important
6. **R' Shimon bar Yochai yahrzeit** — Was showing 2 Iyar instead of 18 Iyar. Fixed on website, sync to app
7. **Subscribe button** — Verify Stripe integration works
8. **Amazon button** — Verify link works (https://www.amazon.com/shop/nanach)

## NEW FEATURES

### Reader Enhancements
9. **In-book search** — Search bar within the current book/section being read, with highlight
10. **Font selector** — 11 Hebrew fonts: Frank Ruhl, Taamey Frank CLM, Keter YG, David Libre, Noto Serif Hebrew, Suez One, Drugulin CLM, Shlomo Stam, Heebo, Assistant, Rubik
11. **Three-view alignment** — Hebrew/English/Both modes with properly aligned paragraphs (aligned_segments)
12. **Audio player** — Kol HaTzadik recordings linked to book pages (Internet Archive URLs)

### Tikun HaKlali
13. **Collapsible sections** — 4 before + 1 after the psalms, collapsed by default:
    - Before 1 (long): Hiskashrus "הריני מקשר את עצמי באמירת העשרה..."
    - Before 2 (short): "הריני מקשר את עצמי לכל הצדיקים..."
    - Before 3: "הריני מזמן את פי להודות ולהלל..."
    - Before 4: Tehillim 95 "לְכוּ נְרַנְּנָה לַה'..."
    - After: "מִי יִתֵּן מִצִּיּוֹן..." + 2 verses

### Tikun Chatzos
14. **Dedicated page** — Midnight prayer text with Hebrew + transliteration

### Content Organization
15. **Saba section** — Group all Saba content: Ebay HaNachal, Yisroel Saba, Fires of Israel, Sichos Chayay Saba, Saba Tape Transcripts, Likutay Nanach, Igeres HaPurim
16. **Correct categorization** — Otzar HaYirah under R' Nachman of Tcheryn, Sichos/Shivchay/Chayey under R' Nachman
17. **English TOC titles** — All books now have bilingual titles (English + Hebrew)

### UI/UX
18. **Hebrew UI** — Hebrew translations for all navigation, buttons, labels
19. **New logos** — Review options in logopossiblities.zip and morelogopossiblities.zip
20. **Saba ringtone** — Short Saba audio clips as phone ringtones

### Audio
21. **Kol HaTzadik integration** — Audio readings for LM, Sichos HaRan, Sipurey Maasiyos, Sefer HaMidos, Shivchay HaRan, Kitzur LM, Chayey Moharan, Likutay Tefilos, Alim LiTrufa, Meshivas Nefesh, Kokhvei Or, and more
22. **Saba recordings** — 58 recordings linked to Sichos Chayay Saba pages
23. **Voice-only + with-melody** options for most books

## APP CODEBASE
- Location: `~/.openclaw/workspace/AjewAnanach/`
- Framework: React Native (Expo)
- Main file: App.js (548 lines)
- API: AjewAPI.js → ajew.org
- CRITICAL: Android signing key in memory/reference_nanach_signing_key.md
