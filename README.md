### **How to Run the Project**

You can run the project in one of two ways. **In both methods, you will need to load the extension into Chrome** once it has been built.

---

#### **Option 1: Run Everything Together (Recommended)**

1. **In the root directory of the project, run:**

   ```sh
   npm run dev
   ```

   This will start both the backend and build the extension in development mode.

2. **Load the built extension into Chrome:**
   - Go to **chrome://extensions/** in Chrome.
   - Toggle on **Developer mode** in the top-right corner.
   - Click **Load unpacked** and select the `extension/.output/chrome-mv3` folder.

---

#### **Option 2: Run Separately**

1. **Run the Extension**

   - Navigate to the extension directory:
     ```sh
     cd extension
     ```
   - Start development mode:
     ```sh
     npm run dev
     ```
     or build the extension:
     ```sh
     npm run build
     ```
   - **Load the extension into Chrome**:
     - Go to **chrome://extensions/** in Chrome.
     - Toggle on **Developer mode** in the top-right corner.
     - Click **Load unpacked** and select the `extension/.output/chrome-mv3` folder.

2. **Run the Backend**
   - In the root directory, start the server:
     ```sh
     node backend/server.js
     ```
