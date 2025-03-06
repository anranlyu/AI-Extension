### **How to Run the Project**

#### **Option 1: Run Everything Together (Recommended)**
In the root directory of the project, run:
```sh
npm run dev
```
This will start both the extension and the backend simultaneously.

#### **Option 2: Run Separately**
1. **Run the Extension**
   - Navigate to the `extension` directory:
     ```sh
     cd extension
     ```
   - Start development mode:
     ```sh
     npm run dev
     ```
   - Or, build the extension:
     ```sh
     npm run build
     ```
   - Load the `dist` folder into Chrome:
     - Open Chrome and go to `chrome://extensions/`
     - Enable **Developer mode** (toggle in the top right)
     - Click **Load unpacked** and select the `dist` folder

2. **Run the Backend**
   - In the root directory, start the server:
     ```sh
     node backend/server.js
     ```

---
