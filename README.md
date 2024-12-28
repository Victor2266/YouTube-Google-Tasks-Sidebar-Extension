<h1> Integrates Google Tasks into a sidebar menu on the YouTube homepage </h1>
<h3> I constantly get distracted and end up procastinating hours on youtube, this way my tasks will be right in front of my face the whole time. </h3>

<b> Notes: </b>
- You can hide / unhide the tasks with the blue button
- You can mark tasks as complete and undo that action to bring the task back
- Changes are reflected in your Google Tasks immediately


https://github.com/user-attachments/assets/5dc0cd21-7f57-48e7-aed3-d3fdb59202db

---
![image](https://github.com/user-attachments/assets/bf4b2a96-3699-4877-b32c-71d0040a6c28)

---
## Generating Your Own Client ID for Google Tasks API (Chrome Extension)

Currently, the Google Tasks API has a courtesy limit of **50,000 queries per day**. You need to generate your own client ID to be able to use the API within your Chrome Extension. Here are the steps:

**1. Create a Google Cloud Project:**

   - Go to the [Google Cloud Platform Console](https://console.cloud.google.com/).
   - Create a **new project**.

**2. Enable the Google Tasks API:**

   - In your project, navigate to **"APIs & Services" > "Library"**.
   - Search for and enable the **"Google Tasks API"**.

**3. Create OAuth 2.0 Credentials:**

   - Go to **"APIs & Services" > "Credentials"**.
   - Click **"Create credentials"**.
   - Choose **"OAuth client ID"**.

**4. Configure OAuth 2.0 Client ID:**

   - Select **"Application type"** as **"Chrome App"**.
   - **Crucially, you need your Extension ID.**
     - Load your unpacked extension in Chrome by going to `chrome://extensions/`.
     - The **Extension ID** will be displayed for your extension.
   - Enter your **Extension ID** in the **"Application ID"** field.

**5. Get your Client ID:**

   - Once created, your **Client ID** will be displayed.
   - You will use this **Client ID** in your `manifest.json` file.
