# WBS Survey Game — Script & Storyboard (Draft v1)

**Project:** Gamified, anonymous student feedback survey for Warwick Business School (WBS), run by the Student Staff Liaison Committee (SSLC).
**Style:** Retro pixel art (16-bit look), chiptune music, male voiceover guide.
**Target length:** 3–5 minutes. Phone-first (opened from a QR code or link).

---

## The concept in one paragraph

A student opens the link and lands on a pixel-art title screen of the WBS building. They say who they are (gender only, anonymously), design a pixel avatar, and "arrive" at WBS. A friendly guide character walks out, greets them by voiceover, and walks them through the building. Each room is one section of the survey. In each room a character asks a few quick questions, which the student answers by tapping. At the end they get a completion badge and certificate, and their answers are saved anonymously for the SSLC.

---

## Characters

| Character | Role | Look (pixel) | Voice |
|---|---|---|---|
| **The Player** | The student | Built by the student in the Character Creator | None |
| **Max (the Guide)** *(name TBC)* | Walks the student through the whole game | WBS-style navy hoodie, lanyard, friendly wave animation | **Male voiceover** — warm, upbeat, short lines |
| **Room NPCs** | One per room, asks that room's questions | Lecturer, librarian, barista, careers adviser | Text only (keeps recording work small), or the same voice actor |

---

## Global elements (on screen throughout the game)

- **Top bar:** pixel progress bar shown as building floors, e.g. "Floor 2 of 5".
- **Top-right buttons:** 🔊 mute/unmute voice, 🎵 mute music, ⏸ pause.
- **Dialogue box:** bottom of the screen, pixel border, text types out letter by letter in sync with the voiceover. Tap to skip the typing or move to the next line.
- **Subtitles are always on**, so the game works with sound off (in a lecture or on the bus).

---

## SCENE 0 — Loading screen

**Visual:** Black screen. A small pixel WBS logo/building icon fades in. Below it a loading bar fills up in chunky pixel blocks.
**Text:** `LOADING WBS... ▓▓▓▓▓░░░░`
**Sound:** Soft 8-bit "boot up" chime when the bar fills.
**Duration:** ~2 seconds (as long as the assets take to load).

---

## SCENE 1 — Title screen

**Visual:**
- Pixel-art version of the **WBS building exterior** (made from the photos you send), at sunset, with gentle sky colours.
- Clouds drift slowly left to right (parallax).
- A few tiny pixel students walk past on the pavement in a loop.
- Windows flicker on one by one.
- The title drops in from the top with a small bounce:

  **WELCOME TO THE WBS SURVEY**
  *subtitle:* "Your voice. Your school. Level up WBS."

- `▶ PRESS START` blinks underneath.

**Sound:** Title chiptune loop starts (upbeat, ~90 BPM).
**Player action:** Tap **PRESS START**.
**Transition:** Pixel "wipe" (screen dissolves into squares).

> Note: browsers block sound until the user taps something, so the music and voiceover only begin after "Press Start". That is why the title screen has no voice line.

---

## SCENE 2 — Anonymity promise

**Visual:** Plain dark background. A pixel padlock icon appears and "clicks" shut.
**On-screen text:**
> 🔒 **This survey is 100% anonymous.**
> No names. No emails. No student IDs.
> Your answers go to the SSLC to improve WBS.

**Button:** `GOT IT ▶`
**Why:** Students give more honest feedback when they trust that it's anonymous. This screen exists to build that trust.

---

## SCENE 3 — "About you" (gender)

**Visual:** Pixel-art panel titled **"PLAYER SELECT"** in classic arcade style, with large tappable pixel buttons.

**Question:** *"First, tell us a little about you."*

| Button |
|---|
| Male |
| Female |
| Non-binary |
| Prefer not to say |

**Animation:** Each button gets a small "bounce" and highlight glow when tapped, with a "blip" sound effect.
**Data saved:** gender (for the percentages breakdown).

---

## SCENE 3B — "Choose your course"

**Visual:** Arcade-style **"SELECT YOUR COURSE"** screen. Each course is a large pixel button in a scrollable list (like choosing a level in a retro game). This list covers **every course in WBS**, so the survey is school-wide and results can be compared across departments. All 20 courses are MSc programmes, so they're grouped by subject with a small search box at the top (typing "fin" filters the list to the finance courses).

**Question:** *"Which course are you on?"*

**Options (20 courses, grouped by subject):**

**Accounting**
- MSc Accounting & Financial Management
- MSc Accounting & Sustainability

**Business & Management**
- MSc Business with Art
- MSc Business with Artificial Intelligence
- MSc Business with Consulting
- MSc Business with Finance
- MSc Business with Marketing
- MSc Business with Operations Management
- MSc Business with Sustainability
- MSc International Business
- MSc Management

**Analytics, AI & Technology**
- MSc Business Analytics & Artificial Intelligence
- MSc Digital & AI Leadership
- MSc Financial Technology

**Finance**
- MSc Finance
- MSc Finance & Economics
- MSc Finance & Management
- MSc Mathematical Finance

**Marketing**
- MSc Marketing & Consumer Behaviour
- MSc Marketing & Strategy

**Other**
- Other / Prefer not to say

**Animation:** The selected course button flashes and a "level select" sound plays. Then a pixel wipe leads to the Character Creator.
**Data saved:** course (so results can be broken down by course).
**Voice:** none, so no extra recording is needed.

> Optional: year of study and home/international could be added to this screen. Every extra question makes the game longer, so only add what you will actually use.

---

## SCENE 4 — Character creator

**Visual:** The screen splits in two:
- **Left (or top on phones):** a large pixel avatar standing on a small spotlight platform, doing an idle breathing animation (bobbing 1 pixel up and down).
- **Right (or bottom):** customisation options with ◀ ▶ arrows.

| Option | Choices |
|---|---|
| Body style | 2–3 base body styles (any player can pick any one, whatever gender they chose) |
| Skin tone | 6–8 tones |
| Hair | 6+ styles, including hijab and head wrap options |
| Hair colour | 6 colours |
| Outfit | WBS hoodie, smart/business, casual, sporty |
| Accessory | none, glasses, headphones, cap |

**Animation:** Every change updates the avatar instantly with a small "poof" sparkle. Tapping **🎲 Random** spins through looks like a slot machine before landing on one.
**Voice (Max, off-screen):** *"Looking good! Honestly, better than my student ID photo."*
**Button:** `READY ▶`
**Data saved:** nothing. The avatar is just for fun and is not stored with the answers.

---

## SCENE 5 — Arrival at WBS

**Visual / camera:**
1. Fade in on the **WBS building exterior**, now in daylight, in a side-scrolling view.
2. The **player's avatar walks in from the left** (4-frame walk cycle) and stops in front of the main doors.
3. Short pause. The **doors slide open**.
4. **Max walks out**, stops, faces the player, and does a big **wave** animation. A small "!" speech bubble pops above his head.

**Sound:** Footstep blips, a door "whoosh", a cheerful jingle when Max appears.

**Voice (Max):**
> "Hey! Hi, hello, welcome to WBS!"
> "I'm Max, your guide today. I've been here so long, I'm basically part of the building."

---

## SCENE 6 — Max explains the game (tutorial)

**Visual:** Max talks in the dialogue box, and his mouth animates while the voice plays. The player avatar nods (a 2-frame animation) at each line.

**Voice (Max):**
> "Here's the deal: the Student Staff Liaison Committee wants to know what you *really* think about WBS."
> "We'll walk through the building together. In each room, someone will ask you a few quick questions."
> "Just tap your answer. No right or wrong answers, and it's totally anonymous. Not even I know who you are... and I'm very nosy."
> "It takes about four minutes. That's shorter than the coffee queue at lunchtime! Finish the tour and you'll earn your **WBS Feedback Champion** badge."
> "Ready? Let's go!"

**Animation:** On "Let's go!", Max turns and walks through the doors. The player follows automatically.
**Transition:** The screen scrolls right into the foyer.

---

## SCENE 7 — The foyer (hub / map)

**Visual:** Pixel interior of the WBS foyer/atrium (from your photos). There are **4 doors**, each with a pixel sign and an icon:

| Door | Sign | Survey section |
|---|---|---|
| 1 | 🎓 Lecture Theatre | Teaching & learning |
| 2 | 📚 Library / Study Space | Resources & study spaces |
| 3 | ☕ Café / Common Room | Facilities & wellbeing |
| 4 | 💼 Careers Office | Careers & employability |

**Mechanic:**
- Doors light up **in order** (a guided path, so the student doesn't get lost and every section gets answered). A bouncing ⬇ arrow points to the next door.
- Finished rooms show a ✅ above the door.
- The player taps the glowing door, and the avatar walks to it automatically (no fiddly controls on phones).

**Voice (Max), first visit only:**
> "This is the main foyer. Mind the floor, it's freshly pixelated. Let's start with the lecture theatre. Tap the glowing door!"

---

## SCENES 8A–8D — The rooms (the survey itself)

Every room follows the **same pattern**, so it's quick to build and easy for students to learn:

1. **Enter:** the door opens and the camera pans into the room. The room has a little life: a projector flickers, coffee steam rises, books float back onto shelves.
2. **Meet the NPC:** the room character turns and greets the player with one line.
3. **Questions:** 2–4 questions, **one per screen**, in the dialogue box.
4. **Reaction:** after each answer the NPC reacts with a small animation (nod, thumbs up, writes in a notebook) and a short line such as "Noted!" or "Thanks, that's really useful."
5. **Exit:** a ✅ "ROOM CLEARED!" banner, a coin-collect sound, and +1 star in the progress bar. The game returns to the foyer.

### Answer types (all big, thumb-friendly buttons)

| Type | Looks like | Use for |
|---|---|---|
| ⭐ Star rating | 5 pixel stars that light up | "How would you rate..." |
| 😀 Mood faces | 5 pixel faces from 😞 to 😄 | Satisfaction / agree–disagree |
| 🔘 Multiple choice | Stacked pixel buttons | Picking one option |
| ✏️ Short text | Pixel "notepad" text box, optional, with a **Skip** button | "Anything else to add?" |

### How answering works: the avatar does it

The student's own pixel avatar stands at the bottom of every question screen and physically "does" each answer.

**Picking an option (stars, faces, multiple choice):**
1. The student taps an option.
2. Their avatar **runs over to it** (quick walk cycle, little dust puffs behind its feet).
3. The avatar **jumps and lands on the button**. The button squashes down like a spring, gives a "boing!" sound, and pops back up glowing in the chosen colour.
4. Only now does the `NEXT ▶` button slide up from below.
5. **Changing your mind:** tap a different option and the avatar hops across to it. Sometimes it stumbles on the way ("Whoa!") just for fun.

**Typing an opinion (text boxes):**
1. The avatar walks on screen **carrying a giant pencil** (bigger than itself, wobbling).
2. It reaches the middle, wobbles, and **drops the pencil on the floor**: *CLONK!* A tiny dust cloud rises, and the avatar shrugs or looks embarrassed.
3. Where the pencil landed, the **text box springs up out of the floor** with the label *"✏️ Start writing..."*
4. While the student types, the avatar sits on the pencil and swings its legs. Every so often, a speech bubble says "Ooh, go on..."
5. The `SKIP` button is always visible, so writing is never forced.

**Keeping it quick (so the fun never gets annoying):**
- Every animation lasts **under 1 second**.
- Tapping again **skips the animation** straight to the result.
- After the first room, animations speed up slightly, because the student already gets the joke.
- A ⚡ "Fast mode" toggle in the pause menu turns the animations off, and the game also respects the phone's "reduce motion" setting.

### Max's jokes & pop-ups (text only, no recording needed)

Max pops up in a small speech bubble now and then. These lines are **text only**, so there's nothing extra to record, and they're picked at random so two students don't see exactly the same game.

**After an answer (random, neutral, never judging the answer):**
- "Noted! In my very official pixel notebook."
- "Ooh, interesting. Writing that down... in crayon."
- "Got it! The SSLC is going to love this."
- "Nice jump! 10/10 landing."
- "Boing! Sorry, I just like saying that."

> Important: reactions must stay **neutral**. Max never reacts differently to a 1-star or a 5-star answer, so the jokes don't nudge students towards an answer and the data stays honest.

**When the pencil drops:**
- "Oops! Butterfingers."
- "That was on purpose. Obviously."
- "Pencils are heavy, okay?"

**If the student goes idle for 15 seconds:**
- Max yawns: "No rush... I'll just stand here. Being a pixel. Forever."
- Max checks a tiny wristwatch, then starts doing push-ups.

**Easter eggs (hidden fun):**
- **Tap Max 5 times:** "Hey! That tickles!" Then: "Okay, stop poking me." Then Max does a little dance.
- **Tap the café coffee machine:** the avatar's hair goes spiky (caffeine boost) for the rest of the game.
- **Loading screen tips:** random lines such as *"Tip: lecturers can't see your answers. We checked. Twice."* or *"Tip: no avatars were harmed in the making of this survey."*

### 8A — Lecture Theatre (Teaching & learning)
**NPC:** Professor character beside a projector screen.
**NPC:** *"Ah, a student! Tell me, how are lectures going this term?"*
**Sample questions (placeholders, to be replaced with the SSLC's real ones):**
1. ⭐ How would you rate the overall quality of teaching on your modules?
2. 😀 Lecture materials (slides, recordings) are clear and available on time.
3. 😀 I get useful feedback on my assessments.
4. ✏️ One thing that would improve your lectures? *(optional)*

### 8B — Library / Study Space (Resources)
**NPC:** Librarian behind a desk with stacks of books.
**NPC:** *"Shhh... just kidding! Quick questions about study resources."*
1. ⭐ How easy is it to find a study space at WBS?
2. 😀 I can access the online resources and software I need.
3. ✏️ What study resource is missing? *(optional)*

### 8C — Café / Common Room (Facilities & wellbeing)
**NPC:** Barista behind a coffee machine (steam animation).
**NPC:** *"Grab a coffee! How's life at WBS outside the classroom?"*
1. 😀 I feel part of a community at WBS.
2. 😀 I know where to go for wellbeing support.
3. 🔘 How do you mostly hear about WBS events? (Email / Instagram / Moodle / Friends / I don't)

### 8D — Careers Office (Employability)
**NPC:** Careers adviser with a pixel laptop.
**NPC:** *"Let's talk about your future, superstar."*
1. 😀 WBS is helping me prepare for my career.
2. 🔘 Have you used the careers service this year? (Yes / No / Didn't know it existed)
3. ✏️ What careers support would you like more of? *(optional)*

---

## SCENE 9 — The Suggestion Box (open feedback)

**Visual:** After the 4th room, Max leads the player back to the foyer, where a glowing pixel **"Suggestion Box"** appears with sparkles.

**Voice (Max):**
> "Last stop! This is the Suggestion Box. If you could change ONE thing about WBS, what would it be? Apart from making me taller."

**Input:** Text box (optional) + `SUBMIT` / `SKIP`.
**Animation on submit:** A paper note folds up, flies into the box, and the box glows. Sound: "whoosh, clunk, ding!"

---

## SCENE 10 — Finale: badge & certificate

**Visual:**
1. Confetti made of pixel squares falls. A victory fanfare plays.
2. The player avatar and Max stand side by side and do a **jump/celebrate** animation.
3. A **badge** spins in: 🏆 **WBS FEEDBACK CHAMPION**.
4. A **pixel certificate** appears showing the player's avatar, "Survey Complete — [Term] [Year]", and a stamp graphic. No name, so it stays anonymous.

**Voice (Max):**
> "That's it, you did it! Thank you so much. You're officially more productive than me on a Monday."
> "Your answers go straight to the SSLC, and we'll use them to make WBS better for everyone."
> "Share your badge and get your coursemates to play too. See you around!"

**Buttons:**
- `📸 SAVE MY BADGE` (downloads the certificate image, which students can share on Instagram stories or group chats. This is free marketing for the survey.)
- `🔁 PLAY AGAIN` is **not** offered, to avoid duplicate answers. The game remembers on that device that it was already completed.

**Final screen:** Max waves goodbye, the doors close, and the camera pulls back to the WBS building at sunset (the same view as the title screen). `THANKS FOR PLAYING ♥` fades in.

---

## Full sequence at a glance

```
[0] Loading
   ↓
[1] Title screen — "Welcome to the WBS Survey" — PRESS START
   ↓
[2] Anonymity promise 🔒
   ↓
[3] Player select: gender
   ↓
[3B] Select your course
   ↓
[4] Character creator (skin tone, hair, outfit...)
   ↓
[5] Avatar walks to WBS → doors open → Max walks out and waves: "Hi, hello, welcome!"
   ↓
[6] Max explains the game
   ↓
[7] Foyer hub ──► [8A] Lecture Theatre ──► back to foyer
               ──► [8B] Library ─────────► back to foyer
               ──► [8C] Café ────────────► back to foyer
               ──► [8D] Careers Office ──► back to foyer
   ↓
[9] Suggestion Box
   ↓
[10] Confetti → Badge → Certificate → Goodbye
```

---

## Voiceover line list (for recording)

Paste the whole block into ElevenLabs in one go. The blank lines give natural pauses, and the finished audio is cut into separate clips during the build. (16 lines, about 2 minutes of audio.)

```
Looking good! Honestly, better than my student ID photo.

Hey! Hi, hello, welcome to W.B.S.!

I'm Max, your guide today. I've been here so long, I'm basically part of the building.

Here's the deal: the Student Staff Liaison Committee wants to know what you really think about W.B.S.

We'll walk through the building together. In each room, someone will ask you a few quick questions.

Just tap your answer. No right or wrong answers, and it's totally anonymous. Not even I know who you are... and I'm very nosy.

It takes about four minutes. That's shorter than the coffee queue at lunchtime! Finish the tour and you'll earn your W.B.S. Feedback Champion badge.

Ready? Let's go!

This is the main foyer. Mind the floor, it's freshly pixelated. Let's start with the lecture theatre. Tap the glowing door!

Nice one! Next up, the library. Shhh... we have to whisper in there. Okay, not really.

Halfway there! Let's grab a coffee. I run on caffeine and deadlines.

One more room: the Careers Office. Time to pretend we all have a five-year plan.

Last stop! This is the Suggestion Box. If you could change one thing about W.B.S., what would it be? Apart from making me taller.

That's it, you did it! Thank you so much. You're officially more productive than me on a Monday.

Your answers go straight to the S.S.L.C., and we'll use them to make W.B.S. better for everyone.

Share your badge and get your coursemates to play too. See you around!
```

---

## Open questions for the SSLC

1. **Guide's name:** "Max" is a placeholder. Something WBS-themed?
2. **Real survey questions:** replace the sample questions in Scene 8.
3. **Rooms:** do these 4 rooms match the sections you need, and which real WBS spaces should they be? (Please send photos of each.)
4. **Course list:** 20 MSc courses received. Is the list complete, and is the subject grouping OK? Extra "About you" questions (home/international)?
5. **Voiceover:** a real SSLC member recording, or a generated voice?
6. **Prize/incentive:** needed? If so, it must be a separate link so it stays anonymous.
7. **Where results go:** a Google Sheet (simplest) or a database.
