# Handoff: Chris & Yumi wedding invitation site

This is for Claude Code. Chris is handing off a finished wedding invitation website. Your job is to deploy it to his personal GitHub Pages and connect the RSVP form to a Google Sheet. The design and content are already approved, so don't redesign anything.

## Wedding details (for reference only, already in the page)

- Couple: Chris & Yumi (families Yabut – Morales)
- Date: Saturday, December 26, 2026
- Venue: The Apo View Hotel, Camus Street, Davao City
- RSVP contact: Naomi Gül S. Morales, 0966 645 3997

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole site in one file. Images are embedded as base64 data URIs, and fonts load from Google Fonts. There's no build step. |
| `apps-script/Code.gs` | Google Apps Script that receives RSVP submissions and adds a row to a Google Sheet. |
| `HANDOFF.md` | This file. |

## How the site works

- **Opening:** an envelope that guests tap to open. It only plays once per browser session (it uses sessionStorage).
- **Sections, in order:** hero (caricature, 12.26.26), Save the date (calendar plus countdown to `2026-12-26T00:00:00+08:00`), Location, Entourage, Dress code / motif / adults-only, RSVP, Gift guide (GoTyme InstaPay QR).
- **Personal links:** each guest gets a URL like `?to=Tita%20Ana&seats=2`.
  - `to` pre-fills the name field and greets the guest by name.
  - `seats` shows "We have reserved N seats for you."
  - Guests **cannot** choose how many people attend. This is on purpose, because the couple wants to control the guest count. Don't add a headcount field.
- **RSVP form:** the fields are complete name and attend yes/no. When submitted, it does:
  `fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: URLSearchParams{name, attending, seats, to} })`.
  The response is opaque because of no-cors, so a fetch that doesn't throw counts as success.
- **If `SCRIPT_URL` is empty,** the form shows "RSVP isn't connected yet. Please text Naomi…". **It is currently empty.** It's at about line 394 of `index.html`:
  ```js
  var SCRIPT_URL = '';
  ```
- **Search engines:** `<meta name="robots" content="noindex, nofollow">` is already set, so the site stays out of search results.

## Apps Script (`apps-script/Code.gs`)

- `doPost(e)` writes to a tab called `RSVPs`, creating it and adding headers if it's missing.
- Columns: `Timestamp | Complete name | Attending | Seats reserved | Invited as`.
- It uses `LockService` so that two submissions arriving at once are both saved.
- `clean_()` trims each value, limits it to 120 characters, and prefixes values starting with `= + - @` with `'` so nothing runs as a formula.

## Tasks

### 1. Create the repo and push

On a free GitHub account, Pages needs a **public** repo. Confirm the repo name with Chris first. `chris-yumi-wedding` is suggested.

```bash
git init -b main
git add index.html apps-script/Code.gs HANDOFF.md
git commit -m "Wedding invitation site"
gh repo create chris-yumi-wedding --public --source=. --push
```

The site (and so the repo) contains Naomi's phone number, a payment QR code, and the entourage names. That's all on the printed invitation anyway, but tell Chris the repo is public before you push, and don't add anything that isn't already in these files.

### 2. Enable GitHub Pages

```bash
gh api -X POST repos/{owner}/chris-yumi-wedding/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

The site goes live at `https://<username>.github.io/chris-yumi-wedding/` after about a minute. Check it with `gh api repos/{owner}/chris-yumi-wedding/pages`.

### 3. Set up the Google Sheet (Chris does this step by hand)

This needs Chris's Google account, so walk him through it rather than doing it yourself. Using `clasp` is possible but probably not worth the setup for a single deployment.

1. Create a new Google Sheet, for example "Chris & Yumi RSVPs".
2. Open Extensions → Apps Script, replace the default code with `apps-script/Code.gs`, and save.
3. Click Deploy → New deployment → type **Web app**. Set Execute as **Me** and Who has access **Anyone**. Authorize when asked.
4. Copy the web app URL, which ends in `/exec`, and give it to Claude Code.

If the script is edited later, use Deploy → Manage deployments → edit → **New version**. That keeps the same URL. Creating a brand-new deployment gives a new URL, which would then need updating in `index.html`.

### 4. Connect the form and redeploy

Put the `/exec` URL into `SCRIPT_URL` in `index.html`, then commit and push. Pages redeploys automatically.

### 5. Test

- Open `https://<username>.github.io/chris-yumi-wedding/?to=Test%20Guest&seats=2` on a phone.
- Check that the envelope opens, the countdown runs, and the page shows "Test Guest, we have reserved 2 seats for you."
- Submit an RSVP and confirm a row shows up in the `RSVPs` tab.
- Ask Chris to delete the test row before sending invitations.

### 6. Optional: build the guest links

If Chris provides a guest list (name and seats), generate one personal link per guest, URL-encoding the names. A CSV with columns `name, seats, link` that he can send from is the most useful format.

## Constraints

- Don't change the design, copy, colors, fonts, or entourage names unless Chris asks.
- Keep the whole site in one self-contained `index.html`, with no build step or framework.
- Don't add a headcount or plus-one field.
- Possible later additions, only if Chris asks: ceremony time (the countdown currently targets midnight), a love story section, a prenup gallery, a love song, a custom domain (Settings → Pages → Custom domain, plus a `CNAME` file).
