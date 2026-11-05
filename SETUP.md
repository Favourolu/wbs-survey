# WBS Survey Game: setup guide

## 1. Connect the game to a Google Sheet (about 5 minutes)

Do this from the Google account that should own the results. A shared SSLC account is best, so it can be handed over next year.

1. Go to [sheets.new](https://sheets.new) to create a blank Google Sheet. Name it e.g. **WBS Survey Results**.
2. In the Sheet, click **Extensions → Apps Script**.
3. Delete everything in the editor, then paste in the whole of [`apps-script/Code.gs`](apps-script/Code.gs). Click 💾 **Save**.
4. Click **Deploy → New deployment**.
   - Click the ⚙️ next to "Select type" and choose **Web app**.
   - **Execute as:** Me.
   - **Who has access:** Anyone.
   - Click **Deploy**, then **Authorize access** and allow it. Google may show an "unverified app" warning: click **Advanced → Go to (project name)**. This is your own script.
5. Copy the **Web app URL** (it ends in `/exec`).
6. Send that URL to Claude, or paste it into `js/data.js` yourself:
   ```js
   SHEET_URL: "https://script.google.com/macros/s/XXXX/exec",
   ```

Each student who plays gets **one row**, updated after each room. The `status` column shows how far they got (`Completed` means they finished).

"Anyone" access only means the game can *send* answers to the Sheet. Nobody can read the Sheet unless you share it.

## 2. Put the game online (free, GitHub Pages)

1. In the GitHub repository, open **Settings → Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**, choose the branch, and the `/ (root)` folder. Click **Save**.
3. After a minute, GitHub shows the link (e.g. `https://<username>.github.io/wbs-survey/`). That's the link to share or turn into a QR code.

## 3. Handy things to know

- **Testing:** add `?again` to the end of the link to play again on a device that has already finished (e.g. `.../wbs-survey/?again`). Use this for testing, and delete test rows from the Sheet before launch.
- **Changing questions or dialogue:** the wording is in `js/lang/en.js` (and the other language files); the question order and follow-up rules are in `js/data.js`.
- **Voiceover:** the English clips are in `audio/vo/en/` (`vo_01.mp3` to `vo_16.mp3`). Replace a file to change a line.
- **Fast mode:** the ⚡ button in the top bar skips animations.
- **One go per phone:** after finishing, the game remembers it on that device and shows a thank-you screen instead. This stops casual repeat entries, but it isn't foolproof (e.g. a private browser window).

## 4. Languages

The game asks students to pick one of 10 languages first: English, 中文, हिन्दी, العربية, Español, Français, 한국어, 日本語, Bahasa Indonesia, Português.

- **Text:** each language has its own file in `js/lang/` (e.g. `js/lang/zh.js`), with the same keys as `js/lang/en.js`. To fix a translation, edit the text in that file. Don't change the keys on the left, or anything in `{curly braces}`.
- **Answers stay in English:** button answers ("Yes", "7", "In-person"…) are saved in English whatever language the student used, so results can be compared. The `language` column shows which language they played in.
- **Written answers are auto-translated:** if a student writes in another language, the Sheet adds an English translation in a `<question>_en` column (e.g. `positive_feedback_en`), using Google Translate.
- **Voiceover:** clips go in `audio/vo/<code>/` (e.g. `audio/vo/zh/vo_01.mp3`). The scripts for each language are in [`VOICEOVER.md`](VOICEOVER.md). Until a language is recorded, the device's built-in voice for that language is used if it has one; otherwise subtitles only.
- **Language-specific links:** add `?lang=zh` (or `hi`, `ar`, `es`, `fr`, `ko`, `ja`, `id`, `pt`) to the link to skip the language screen, e.g. for a QR code on a poster aimed at one group.
- **Before launch:** ask a native speaker to play through each language once. The translations were written carefully but haven't been checked by a person yet.
