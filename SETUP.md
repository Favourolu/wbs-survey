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
- **Changing questions or dialogue:** everything is in `js/data.js`.
- **Voiceover:** the clips are in `audio/vo/` (`vo_01.mp3` to `vo_16.mp3`). Replace a file to change a line.
- **Fast mode:** the ⚡ button in the top bar skips animations.
- **One go per phone:** after finishing, the game remembers it on that device and shows a thank-you screen instead. This stops casual repeat entries, but it isn't foolproof (e.g. a private browser window).
