# 📤 How to Upload CipherChat to GitHub

Follow these steps exactly. You do NOT need to know how to code to do this.

---

## Step 1 — Create a GitHub Account (skip if you have one)

1. Go to [github.com](https://github.com)
2. Click **Sign up**
3. Follow the steps to create a free account
4. Verify your email address

---

## Step 2 — Create a New Repository

1. Log in to GitHub
2. Click the **+** button in the top-right corner
3. Click **New repository**
4. Fill in the form:
   - **Repository name:** `cipherchat` (or anything you like)
   - **Description:** `🔐 End-to-end encrypted chat in the browser`
   - **Visibility:** Choose **Public** (so others can see and use it)
   - ✅ Check **Add a README file** — NO, leave it unchecked (we have our own)
5. Click **Create repository**

---

## Step 3 — Upload the Files

You are now on an empty repository page. Do this:

1. Click **uploading an existing file** (it appears as a link in the middle of the page)
   - Or click **Add file** → **Upload files**

2. Open the `encrypted-chat` folder on your computer

3. Select ALL files and folders:
   - `index.html`
   - `src/` folder (contains `style.css`, `crypto.js`, `chat.js`)
   - `docs/` folder (contains `server-example.js`)
   - `README.md`
   - `LICENSE`
   - `.gitignore`

   > **Tip on Windows:** Press Ctrl+A to select all, then drag them all into the GitHub upload area.
   >
   > **Important:** You need to upload the files INSIDE the folders too. GitHub's drag-and-drop supports folders — just drag the whole `encrypted-chat` folder contents in.

4. Scroll down to **Commit changes**
5. In the first box, type: `Initial commit — CipherChat`
6. Click the green **Commit changes** button

---

## Step 4 — Enable GitHub Pages (makes it live online!)

1. In your repository, click **Settings** (top tab bar)
2. Scroll down the left sidebar and click **Pages**
3. Under **Branch**, click the dropdown that says `None`
4. Select **main**
5. Make sure the folder says `/ (root)`
6. Click **Save**
7. Wait 1–2 minutes
8. Refresh the page — you'll see a green banner saying:
   > **Your site is live at https://yourusername.github.io/cipherchat/**

---

## Step 5 — Share It!

Your chat is now:
- **Live online** at `https://yourusername.github.io/cipherchat/`
- **Open source** — anyone can view, fork, and contribute
- **Free forever** on GitHub Pages

Share the GitHub link so people can look at the code:
`https://github.com/yourusername/cipherchat`

Share the live link so people can use it:
`https://yourusername.github.io/cipherchat/`

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| Files uploaded but site shows 404 | Wait 2 minutes and refresh. GitHub Pages takes a moment. |
| Folders didn't upload | Upload files inside the folders manually using Add file → Upload files again |
| `.gitignore` is invisible on Windows | Enable "Show hidden files" in File Explorer settings |
| Pages option not showing | Make sure the repository is **Public**, not Private |

---

That's it! 🎉 Your encrypted chat is on GitHub.
