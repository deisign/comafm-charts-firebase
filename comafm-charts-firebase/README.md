# comafm-charts-firebase

Автоматичний парсер для хіт-параду coma.fm з Onlineradiobox. Працює на Firebase Cloud Functions + Firestore.

## 🔧 Інструкція

1. Встанови Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Ініціалізуй Firebase:
   ```
   firebase login
   firebase init
   ```

3. Встанови залежності:
   ```
   cd functions
   npm install
   ```

4. Задеплой:
   ```
   firebase deploy --only functions
   ```

## 🔁 Результат

- Функція `parsePlaylist`: парсить onlineradiobox щодня о 03:00
- Функція `getWeeklyChart`: API, що повертає JSON з топ-10 треків