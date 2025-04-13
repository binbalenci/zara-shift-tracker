# 🌟 Zara Shift Tracker

Hey there! This is my first "vibe coding" project built with [Cursor](https://cursor.sh), the coolest AI-powered code editor out there. I made this app to help my wife track her shifts at Zara and automatically calculate her earnings based on different rates (because who wants to do that math manually, right? 😅).

## 💡 What's This All About?

My wife works at Zara with different pay rates depending on when she works:

- Regular hours? Got that covered! ⏰
- Evening shifts after 6 PM? Extra cash! 🌙
- Weekend work after 1 PM? Cha-ching! 🎉
- Sunday shifts? Double the money! 💰

Instead of calculating all this stuff with a calculator (boring!), I built this app to do it automatically. Just punch in your shift times, and boom - it tells you exactly how much you earned!

## 🚀 Tech Stack

Built this bad boy with some pretty cool tech:

- **React Native + Expo**: For that smooth mobile experience
- **TypeScript**: Because who doesn't love some type safety?
- **Supabase**: Our awesome backend-as-a-service
- **React Native Paper**: For those sleek Material Design components
- **React Native Gifted Charts**: Making those earnings charts look 🔥
- And a bunch of other neat packages!

## 🏗 System Design

The app's got a pretty neat structure:

```
app/
├── (tabs)/              # All our main screens live here
│   ├── index.tsx       # Home screen (Add shifts)
│   ├── shifts.tsx      # View all shifts
│   ├── statistics.tsx  # Fancy charts and stats
│   └── settings.tsx    # Manage salary profiles
├── contexts/           # Global state management
├── types/             # TypeScript types (keeping it clean!)
└── utils/             # Helper functions and services
```

### 💾 Database Structure

We've got two main tables in Supabase:

- `shifts`: Stores all the shift details
- `shift_calculations`: Handles all the fancy pay calculations
- `salary_profiles`: Keeps track of different pay rates

## 🎮 How to Get Started

1. Clone this bad boy:

   ```bash
   git clone https://github.com/yourusername/zara-shift-tracker.git
   cd zara-shift-tracker
   ```

2. Install the goodies:

   ```bash
   npm install
   ```

3. Set up your Supabase stuff:

   - Create a `.env` file
   - Add your Supabase URL and anon key:
     ```
     SUPABASE_URL=your_url_here
     SUPABASE_ANON_KEY=your_key_here
     ```

4. Fire it up:
   ```bash
   npx expo start
   ```

## 🌈 Features

- 📝 Log shifts with start and end times
- 💰 Automatic calculation of:
  - Base pay
  - Evening extras
  - Weekend bonuses
  - Sunday double rates
- 📊 Pretty charts showing monthly earnings
- ⚙️ Configurable salary profiles
- 🎨 Clean and simple UI
- ✨ Confetti celebration when adding shifts (because why not?)

## 🤖 Vibe Coding with Cursor

This project was my first adventure in "vibe coding" with Cursor AI. Instead of the usual "plan everything meticulously" approach, I just vibed with Cursor's AI and built features as they came to mind. It was a super fun way to code, and the results are pretty sweet!

## 💕 Special Thanks

Shoutout to my wife for being the inspiration behind this project! Hope this makes tracking your shifts a bit more fun! 🎉

---

Made with ❤️ and good vibes using Cursor AI
