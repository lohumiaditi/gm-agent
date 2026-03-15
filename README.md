
# 💌 AutoBae: Your AI-assisted Love Bot.

> An AI that loves your boyfriend on your behalf. Responsibly.

---

## The Origin Story

I'm a builder. I had three side projects running simultaneously. I was testing every component like it was going to the moon.

I was also, apparently, terrible at texting good morning.

After weeks of waking up to radio silence, my boyfriend finally said *"just... good morning? maybe?"*

So instead of setting a reminder like a normal person, I automated my entire emotional availability before 7AM.

You're welcome, babe.

---

## What It Does

Every morning at **7:00 AM IST**, your boyfriend gets a freshly AI-generated good morning message on WhatsApp.

Every night at **12:00 AM IST**, a tender good night message lands in his chat.

No two messages are ever the same. One day it's a Hindi poem. Next day it's Hinglish banter. Sometimes Marathi. Sometimes a metaphor so beautiful he'll wonder which poet you've been secretly reading.

You built it. You get all the credit.

---

## Sample Messages

🌅 **Morning (Hindi poem):**
> सुबह की पहली किरण तुम हो,
> मेरे दिल की धड़कन तुम हो ☀️

🌙 **Night (Hinglish):**
> So ja jaanu 🌙 aaj ka din tera tha, kal bhi tera hi hoga. Sweet dreams, mera favorite person.

🌅 **Morning (English metaphor):**
> The sun showed up today, probably just to compete with you. It's losing. Good morning 🌸

---

## Tech Stack

| Thing | Why |
|-------|-----|
| `whatsapp-web.js` | Sends messages through your personal WhatsApp |
| `Node.js` | Runs the whole thing |
| `Groq API (free tier)` | Blazing fast inference. Writes the messages. Romantic AND free. |
| `llama-3.3-70b-versatile` | The model doing all the sweet talking |
| `node-cron` | Schedules messages at exactly 7AM and 12AM IST |
| `Railway` | Keeps it running 24/7 in the cloud |

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/DelegatedAffection.git
cd DelegatedAffection
npm install
```

### 2. Get your free Groq API key
Go to [console.groq.com](https://console.groq.com) → Sign up → API Keys → Create API Key → Copy it.

### 3. Install the Groq SDK
```bash
npm install groq-sdk
```

### 4. Create your `.env` file
```env
GROQ_API_KEY=your_key_here
BOYFRIEND_NAME=his_name_here
BOYFRIEND_NUMBER=91xxxxxxxxxx
```
> Phone number format: country code + number, no spaces, no +

### 5. Run it locally first (to scan QR)
```bash
node index.js
```
A QR code will appear. Open WhatsApp → Linked Devices → Link a Device → scan it.

Wait for:
```
✅ WhatsApp connected! Agent is running...
📅 Scheduled: Good morning at 7AM & Good night at 12AM IST
```

Press `Ctrl+C` — your session is now saved.

### 6. Deploy to Railway
- Push code to GitHub
- Connect repo on [railway.app](https://railway.app)
- Add your 3 environment variables
- Deploy

He'll never know you almost forgot again.

---

## Message Styles

The agent randomly picks from these styles every time:

- Sweet loving message in English
- Tender message in Hindi
- Sweet message in Marathi
- Romantic poem in English
- Romantic poem in Hindi
- Hinglish love message
- Playful and cute message
- Deeply emotional message
- Short Marathi poem
- Beautiful metaphor about love

---

## Project Structure

```
DelegatedAffection/
├── index.js           # The whole agent lives here
├── backup-session.js  # Saves your WhatsApp session
├── .env               # Your secrets (never commit this)
├── .gitignore         # Keeps your secrets secret
├── Procfile           # Tells Railway how to run it
└── package.json       # Dependencies
```

---

## Important Notes

- This uses your **personal WhatsApp number** to send messages, not WhatsApp Business
- The session is saved so you only scan QR once
- If WhatsApp logs out your linked device, just re-run locally and re-scan
- Groq free tier is extremely generous — more than enough for 2 messages a day
- `llama-3.3-70b-versatile` is one of the best open source models available and it's completely free on Groq

---

## Customisation

Want to change the timing? Find these lines in `index.js`:

```js
cron.schedule("0 7 * * *"   // 7:00 AM — good morning
cron.schedule("0 0 * * *"   // 12:00 AM — good night
```

Want to add your own message styles? Add to the `messageStyles` array in `index.js`:
```js
"a cheesy bollywood dialogue style love message",
"a message referencing our favourite show",
```

---

## Built With Love And

- Dry shampoo energy at 7AM
- Three simultaneous side projects that were going nowhere
- One patient boyfriend who just wanted a good morning text
- Claude AI helping debug at midnight

---

## License

MIT — use it, fork it, send your own boyfriend better messages than I do.

---

*Made with 💕 by someone who codes faster than she texts*
