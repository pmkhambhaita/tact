# Mobile Implementation Map: Tact & Parallax

> **Objective:** Port the existing React web application (Tact/Parallax) to a high-quality mobile application.
> **Current Stack:** React (Vite), TailwindCSS, Express (API Proxy).
> **Target Stack:** React Native (Expo), NativeWind (Tailwind for RN), Reanimated.

---

## 1. Project Overview
**Tact/Parallax** is a dual-mode application focusing on workplace communication and decision-making.
1.  **Tact (Tone Coach):** Analyzes user input (emails/slack messages) for tone and offers rewritten alternatives.
2.  **Parallax (Decision Helper):** A "Devil's Advocate" chat interface that guides users through workplace panic spots using a 3-phase process (Input -> Strategy -> Execution).

---

## 2. Architecture & Tech Stack

| Feature | Current Web Implementation | Recommended Mobile Implementation |
| :--- | :--- | :--- |
| **Framework** | React + Vite | **React Native (Expo SDK 50+)** |
| **Styling** | TailwindCSS | **NativeWind (v4)** or `twrnc` |
| **Navigation** | React Router DOM | **Expo Router** (File-based, mirrors web) |
| **Animations** | Framer Motion | **React Native Reanimated** |
| **Icons** | Lucide React | **Lucide React Native** |
| **State** | React Context + Local State | **Zustand** (for global session state) + Context |
| **Storage** | `localStorage` / `sessionStorage` | **AsyncStorage** or `expo-secure-store` |
| **Backend** | Express (`server.js`) | **Direct API Calls** or keep existing Middleware |

### ⚠️ Critical Note on Backend
The current `server.js` functions as a proxy to hide API keys (Groq/Google) and handle load balancing.
*   **Mobile Approach:** Do **NOT** put API keys in the mobile app code.
*   **Action:** Deploy the existing `server.js` to a serverless provider (Vercel/Supabase Edge Functions) and have the mobile app call this URL.

---

## 3. Feature Breakdown & Logic

### A. Phase 0: Mobile Guard
*   **Current:** `MobileGuard.tsx` blocks mobile web users.
*   **Mobile:** Remove this check. The app *is* the mobile experience.

### B. Core Loop: Parallax (Decision Helper)
Located in `components/ParallaxSession.tsx`.
**Flow:**
1.  **Input (Phase 0):**
    *   One large text area asking "What's the situation?".
    *   *Logic:* Check for stress words (panic, scared) -> Trigger Breathing Exercise if found.
    *   *API:* POST `/api/parallax/chat` with `{ message: string }`.
2.  **Strategy (Phase 1):**
    *   Displays 2-3 "Options" returned by AI.
    *   **UI:** Cards with Risk Level (Low/Med/High), Pros/Cons.
    *   *Data:* User selects one option -> Moves to Phase 2.
3.  **Execution (Phase 2):**
    *   Shows "Dos" and "Donts" for the selected strategy.
    *   **Action:** "Generate Draft" button.
    *   *API:* POST `/api/parallax/draft` with `{ situation, strategy }`.
    *   *Output:* Pre-fills the **Tact** editor with the generated draft.

### C. Core Loop: Tact (Tone Coach)
Located in `components/MainApp.tsx`.
**Flow:**
1.  **Editor:**
    *   Inputs: Message Text, Receiver Type (Boss/Client), Intended Tone (Professional/Direct).
    *   *API:* POST `/api/analyze` with `{ text, settings }`.
2.  **Results (HUD):**
    *   **Score:** 0-100 Gauge.
    *   **Summary:** AI analysis of how it sounds.
    *   **Perception:** "Primary Receiver" vs "Neutral Observer" perception.
    *   **Rewrite:** A better version of the message.
    *   **Highlights:** Specific phrases to fix (Red/Green highlighting).

---

## 4. API Contract (JSON Schemas)

Your mobile app needs to handle these exact response structures.

### Endpoint: `POST /api/parallax/chat`
**Request:** `{ "message": "I lost the client data" }`
**Response:**
```json
{
  "analysis": {
    "internal_monologue": "Rational assessment of risks...",
    "panic_check": "Calming validation..."
  },
  "options": [
    {
      "id": "A",
      "title": "The Honest Approach",
      "description": "Admit fault immediately...",
      "risk_level": "High",
      "pros": ["Builds trust"],
      "cons": ["Immediate anger"],
      "dos": ["Be brief"],
      "donts": ["Don't make excuses"],
      "recommended": true
    }
  ],
  "advice": "Reasoning for recommendation..."
}
```

### Endpoint: `POST /api/parallax/draft`
**Request:**
```json
{
  "situation": "...",
  "strategy": { ...selectedOptionObject }
}
```
**Response:** `{ "draft": "Subject: Urgent Update..." }`

### Endpoint: `POST /api/analyze`
**Request:**
```json
{
  "text": "Hey fix this now",
  "settings": { "receiverType": "Boss", "intendedTone": "Professional", "userTraits": "" }
}
```
**Response:**
```json
{
  "score": 45,
  "summary": "This sounds aggressive.",
  "highlights": [
    { "text": "fix this now", "type": "negative", "suggestion": "Try 'Could you look at this?'" }
  ],
  "rewritten_message": "Hi, could you please review this when you have a moment?",
  "rewritten_score": 92,
  "audience_perception": {
    "primary_receiver": "Feels ordered around",
    "neutral_observer": "Unprofessional demand"
  }
}
```

---

## 5. UI/UX Translation Guide

### Styling & Theming
*   The web app uses a **ThemeContext** (`isDark` state).
*   **Mobile:** Use a React Context similar to `components/ThemeContext.tsx` but persist to `AsyncStorage`.
*   **Colors:**
    *   Dark: `bg-slate-900`, Text `text-slate-100`, Accent `indigo-500` / `orange-500`.
    *   Light: `bg-slate-50`, Text `text-slate-900`.

### Complex Components to Adapt
1.  **`ShaderBackground.tsx` (WebGL GLSL Shader)**
    *   *Implementation:* This uses a custom fragment shader for a slow-moving noise gradient.
    *   *Mobile Solution:* **Reactive Native Skia** or `expo-gl`.
    *   *Simplified Fallback:* Use `expo-linear-gradient` with an animated opacity loop for V1 if shaders are too complex.

2.  **`TiltCard.tsx`**
    *   *Web:* Mouse-tracking 3D tilt.
    *   *Mobile:* Use `DeviceMotion` (Gyroscope) from `expo-sensors` to slightly tilt cards as the user moves their phone. Subtle effect.

3.  **text Highlighting (`SmartText.tsx`)**
    *   *Web:* Spans within a paragraph.
    *   *Mobile:* `<Text>` nesting in React Native works similarly.
    *   `result.highlights` maps ranges of text to colors. You must split the raw string based on the highlight substrings and render:
    ```tsx
    <Text>
      Normal text
      <Text style={{ backgroundColor: 'red', color: 'white' }}>Bad phrase</Text>
      Normal text...
    </Text>
    ```

---

## 6. Project Structure Recommendation (Expo Router)

```
/app
  /_layout.tsx      <-- Providers (Theme, Auth)
  /index.tsx        <-- Landing / Mode Select
  /parallax
    /_layout.tsx    <-- Stack Nav
    /index.tsx      <-- Phase 0 (Input)
    /strategy.tsx   <-- Phase 1 (Options)
    /execute.tsx    <-- Phase 2 (Drafting)
  /tact
    /_layout.tsx
    /index.tsx      <-- Main Editor
    /result.tsx     <-- Analysis HUD
/components
  /ui               <-- Buttons, Cards
  /Parallax         <-- Feature specific
  /Tact             <-- Feature specific
/hooks
  useTheme.ts
  useAPI.ts
/store
  useHistoryStore.ts <-- Zustand (History persistence)
```

## 7. Migration Checklist for AI

1.  **Initialize Expo** with TypeScript & NativeWind.
2.  **Copy Types:** Move `types.ts` from web to mobile 1:1.
3.  **Setup API Layer:** Create a simple `api.ts` service that points to the hosting backend URL.
4.  **Port Logic:**
    *   `ParallaxSession.tsx` -> Split into 3 screens in `/app/parallax/`.
    *   `MainApp.tsx` -> Split into Editor Screen and Result Screen.
5.  **UI Components:**
    *   Rebuild `GlassCard` (View with blur). *Note: Blur requires `expo-blur`.*
    *   Rebuild `TactMeter` (SVG Gauge).
6.  **Verify:** Test the API loop with the backend.
