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

> Optional extra "About you" questions on the same screen, if the SSLC wants them: year of study, course (e.g. BSc Management, Accounting & Finance, MSc...), home/international. Every extra question here makes the game longer, so only add what you will actually use.

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
**Voice (Max, off-screen):** *"Looking good! Make yourself at home."*
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
> "I'm Max, and I'll be your guide today."

---

## SCENE 6 — Max explains the game (tutorial)

**Visual:** Max talks in the dialogue box, and his mouth animates while the voice plays. The player avatar nods (a 2-frame animation) at each line.

**Voice (Max):**
> "Here's the deal: the Student Staff Liaison Committee wants to know what you *really* think about WBS."
> "We'll walk through the building together. In each room, someone will ask you a few quick questions."
> "Just tap your answer. No right or wrong answers, and it's totally anonymous."
> "It takes about four minutes. Finish the tour and you'll earn your **WBS Feedback Champion** badge!"
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
> "This is the main foyer. Let's start with the lecture theatre. Tap the glowing door!"

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
> "Last stop! This is the Suggestion Box. If you could change ONE thing about WBS, what would it be?"

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
> "That's it, you did it! Thank you so much."
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

All lines for the male voice actor in one place (~20 lines, about 2 minutes of audio in total):

1. "Looking good! Make yourself at home."
2. "Hey! Hi, hello, welcome to WBS!"
3. "I'm Max, and I'll be your guide today."
4. "Here's the deal: the Student Staff Liaison Committee wants to know what you really think about WBS."
5. "We'll walk through the building together. In each room, someone will ask you a few quick questions."
6. "Just tap your answer. No right or wrong answers, and it's totally anonymous."
7. "It takes about four minutes. Finish the tour and you'll earn your WBS Feedback Champion badge!"
8. "Ready? Let's go!"
9. "This is the main foyer. Let's start with the lecture theatre. Tap the glowing door!"
10. "Nice one! Next up, the library."
11. "Halfway there! Let's grab a coffee."
12. "One more room: the Careers Office."
13. "Last stop! This is the Suggestion Box. If you could change ONE thing about WBS, what would it be?"
14. "That's it, you did it! Thank you so much."
15. "Your answers go straight to the SSLC, and we'll use them to make WBS better for everyone."
16. "Share your badge and get your coursemates to play too. See you around!"

---

## Open questions for the SSLC

1. **Guide's name:** "Max" is a placeholder. Something WBS-themed?
2. **Real survey questions:** replace the sample questions in Scene 8.
3. **Rooms:** do these 4 rooms match the sections you need, and which real WBS spaces should they be? (Please send photos of each.)
4. **Extra "About you" questions:** year, course, home/international?
5. **Voiceover:** a real SSLC member recording, or a generated voice?
6. **Prize/incentive:** needed? If so, it must be a separate link so it stays anonymous.
7. **Where results go:** a Google Sheet (simplest) or a database.
