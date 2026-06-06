# 🚀 Nexart Mobile — Quick Start Guide

## Launch Locally in 3 Steps

### Step 1: Install Dependencies
```bash
cd nexart
npm install
# ou
yarn install
```

### Step 2: Start Expo
```bash
expo start
```

This will open the Expo CLI with options to:
- Press `i` → iOS simulator (macOS only)
- Press `a` → Android emulator
- Press `w` → Web browser
- Scan QR with Expo Go app (iOS/Android)

### Step 3: Test Critical Flows

**Use these test accounts:**
- Email: `test-createur@nexart.fr` (or register new)
- Password: `Nexart2024!`
- Role: Creator

Or register a new account right in the app.

---

## 🧪 What to Test

### ✅ Flow 1: Auth & Onboarding (5 min)
1. Open app → Welcome screen
2. Tap "Register" → Choose "Créateur" → Fill form → Submit
3. Verify: User logged in → RoleScreen appears
4. Select "Créateur" → Navigate to CreatorNavigator

**Expected:** App shows 5 tabs (Fil, Marchés, Candidatures, Messages, Profil)

### ✅ Flow 2: Profile Setup (3 min)
1. After login, tap Profil tab
2. See ProfileScreen → Fill/edit bio, disciplines, location
3. Upload photo (optional)
4. Save

**Expected:** Data saved to Supabase creator_profiles table

### ✅ Flow 3: Search Events (5 min)
1. Tap "Marchés" tab
2. SearchEventsScreen loads → See event list
3. Try filters: Type, Region, Budget, Date, Disciplines
4. Search by city name
5. Tap event → EventDetailScreen

**Expected:** Events load, filters work, navigate to detail

### ✅ Flow 4: Apply & Candidature (3 min)
1. On EventDetailScreen → Tap "Je m'inscris à ce marché"
2. Form expands → Add optional message
3. Tap "Envoyer ma candidature"
4. Verify: Status badge shows "En attente"

**Expected:** Application saved to Supabase

### ✅ Flow 5: View Applications (3 min)
1. Tap "Candidatures" tab → ApplicationsScreen
2. See list of your applications with status badges
3. Filter by status (En attente, Acceptées, Refusées)
4. Tap application → Show details

**Expected:** All applications load, filters work

### ✅ Flow 6: Messaging (5 min)
1. Tap "Messages" tab → MessagesScreen
2. See list of conversations
3. Tap a conversation → ConversationScreen
4. Type message → Tap send
5. See message appear (real-time)

**Expected:** Messages sent and received instantly

### ✅ Flow 7: Organizer (5 min)
1. Logout and register as "Organisateur"
2. Tap organizer tab (same as creator but different screens)
3. Create event form should be accessible
4. Create sample event

**Expected:** Event created in Supabase

### ✅ Flow 8: Organizer Receives Applications (3 min)
1. As organizer, view incoming applications for your event
2. See list with creator names, status
3. Accept/Refuse application
4. Send message to applicant

**Expected:** Application status updates

---

## 🔴 Common Issues & Fixes

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start -c  # Clear cache
```

### Cannot connect to Supabase
- Check `.env.local` file exists with:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://cvqeysnymnkfxfithhsr.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=...
  ```
- Verify internet connection
- Check Supabase project is online

### Messages not real-time
- Messages use Supabase Realtime (postgres_changes)
- Make sure RLS policies allow your user to subscribe
- Open browser DevTools → Network → check WebSocket connects

### Navigation stuck
- Press `Ctrl+C` in terminal
- Run `expo start -c` (clear cache)
- Reload app

### Images won't load
- Check Supabase Storage buckets exist: `avatars/`, `portfolio/`
- Verify bucket policies allow public read access

---

## 📊 Validation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Navigation | ✅ 100% | All 8 navigators + 30 screens OK |
| Auth | ✅ Ready | Supabase auth working |
| Phase 1 | ✅ Ready | Profile + Search + Apply complete |
| Phase 2 | ✅ Ready | Applications + Messaging complete |
| Organizer | ✅ Ready | Create + Manage + Applications |
| Supabase | ✅ Ready | All tables, RLS, Realtime |
| Stripe | ⚠️ Pending | Code ready, not tested |
| Push Notif | 🔴 Not done | Future enhancement |

---

## 🚀 Next Steps After Testing

1. **Report bugs** → Document with screenshots + steps to reproduce
2. **Test on real device** → Use Expo Go app:
   - iOS: App Store → Search "Expo Go"
   - Android: Google Play → Search "Expo Go"
   - Scan QR from terminal
3. **Share with team** → Use Expo cloud link:
   ```bash
   expo build:web  # Generates shareable link
   ```
4. **Build for TestFlight** → Once approved:
   ```bash
   eas build --platform ios --profile preview
   ```
5. **Build for Google Play** → Once approved:
   ```bash
   eas build --platform android --profile preview
   ```

---

## 📱 Test Accounts

| Role | Email | Password | Phone |
|------|-------|----------|-------|
| Creator | test-createur@nexart.fr | Nexart2024! | +33612345678 |
| Organizer | test-orga@nexart.fr | Nexart2024! | +33612345679 |
| Visitor | test-visiteur@nexart.fr | Nexart2024! | +33612345680 |

Or register new accounts in the app.

---

## 🎯 Success Metrics

App is "launch-ready" when:
- ✅ All auth flows work (register, login, logout)
- ✅ Phase 1 flows work (profile, search, apply)
- ✅ Phase 2 flows work (applications, messaging)
- ✅ Organizer flows work (create, manage, accept)
- ✅ No crash on 100 taps through all screens
- ✅ Messages send/receive under 2 seconds
- ✅ Search returns results in <500ms

---

**Happy testing! 🎉**

If you find issues, log them in the AUDIT.md or contact the dev team.
