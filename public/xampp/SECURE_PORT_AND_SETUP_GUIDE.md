# Kanu G. Agabi & Associates — XAMPP Deployment & Secure Port Guide

This document contains step-by-step instructions for deploying the **Case File Inventory and Tracking System** on an on-premise Windows server running **XAMPP (Apache + MySQL/MariaDB)**, changing the ports to secure non-conflicting numbers (with HTTPS/SSL encryption), and launching the system on desktop workstations.

---

## 1. Changing XAMPP Apache to a Secure & Non-Conflicting Port

By default, Apache listens on **Port 80 (HTTP)** and **Port 443 (HTTPS/SSL)**. In many law firm offices, Windows services (such as IIS, Skype, or VMware) may already occupy port 80 or 443. Changing them to **Port 8080 (HTTP)** and **Port 8443 (HTTPS)** ensures zero port conflicts and allows enabling secure SSL encryption across local chambers Wi-Fi.

### Step 1: Change Apache HTTP Port (e.g. to 8080)
1. Open the **XAMPP Control Panel**.
2. Click the **Config** button next to **Apache**, then select **Apache (httpd.conf)**.
3. Press `Ctrl + F` and find:
   ```apache
   Listen 80
   ```
   Change it to:
   ```apache
   Listen 8080
   ```
4. Find:
   ```apache
   ServerName localhost:80
   ```
   Change it to:
   ```apache
   ServerName localhost:8080
   ```
5. Save the file (`Ctrl + S`) and close Notepad.

---

### Step 2: Change Apache Secure SSL Port (e.g. to 8443)
1. In **XAMPP Control Panel**, click **Config** next to **Apache**, then select **Apache (httpd-ssl.conf)**.
2. Press `Ctrl + F` and find:
   ```apache
   Listen 443
   ```
   Change it to:
   ```apache
   Listen 8443
   ```
3. Find:
   ```apache
   <VirtualHost _default_:443>
   ```
   Change it to:
   ```apache
   <VirtualHost _default_:8443>
   ```
4. Find:
   ```apache
   ServerName localhost:443
   ```
   Change it to:
   ```apache
   ServerName localhost:8443
   ```
5. Save the file (`Ctrl + S`) and close Notepad.

---

### Step 3: Update XAMPP Control Panel Settings
1. At the top-right of **XAMPP Control Panel**, click **Config** (gear icon).
2. Click **Service and Port Settings**.
3. Under the **Apache** tab:
   - Change **Main Port** to: `8080`
   - Change **SSL Port** to: `8443`
4. Click **Save**, then click **Save** again.
5. In XAMPP Control Panel, click **Stop** on Apache, then click **Start**.
   - Notice Apache will now show green with ports **8080, 8443**.

---

### Step 4: Automatically Redirect HTTP to Secure HTTPS (Recommended)
To prevent unencrypted Wi-Fi transmission of case files and client details, force all traffic to HTTPS:
Open `C:\xampp\apache\conf\extra\httpd-vhosts.conf` and add:
```apache
<VirtualHost *:8080>
    ServerName localhost
    Redirect permanent / https://localhost:8443/
</VirtualHost>
```

---

## 2. Deploying the Chambers Registry Files

1. Copy the folder containing these files into your XAMPP web root:
   ```text
   C:\xampp\htdocs\LawFirmInventory\
   ├── index.html
   ├── db.php
   ├── auth.php
   ├── api.php
   ├── database.sql
   ├── desktop-launcher.bat
   └── desktop-launcher.vbs
   ```
2. Open your browser and navigate to:
   ```text
   http://localhost:8080/phpmyadmin/
   ```
3. Click the **Import** tab at the top.
4. Select `database.sql` and click **Import**.
   - All 4 database tables (`CaseFiles`, `FileMovements`, `AdminUsers`, `GuestAccessLogs`) and all **388 authentic case files** will be instantly indexed into MySQL!

---

## 3. How to Launch on Desktop

There are **three convenient ways** to launch the system on desktop computers:

### Method 1: Instant PWA Desktop App (Zero Install, Native Window)
1. Open Google Chrome or Microsoft Edge on the computer.
2. Visit the application URL (e.g. `http://localhost:3000` or `https://192.168.1.100:8443/LawFirmInventory`).
3. In the browser address bar, click the **Install App** icon (looks like a computer screen with a downward arrow) or click **Settings (3 dots) -> Apps -> Install this site as an app**.
4. The system will launch in its own **frameless, distraction-free desktop window** and create an official desktop icon on the Windows Desktop and Start Menu!

---

### Method 2: One-Click Desktop Batch Launcher (`desktop-launcher.bat`)
1. Copy `desktop-launcher.bat` to the Windows Desktop.
2. Right-click the file and click **Rename** -> rename it to `Kanu Agabi Case Registry.bat`.
3. Double-click the file anytime: it automatically launches Microsoft Edge or Chrome in `--app` mode without any browser tabs, URL bar, or menus, giving the experience of a compiled desktop software.

---

### Method 3: Silent Desktop Launcher (`desktop-launcher.vbs`)
1. Copy `desktop-launcher.vbs` to the Windows Desktop.
2. Double-click it. It silently opens the application window without showing any command prompt window.

---

## 4. Offline & Disconnected Synchronization (JSON Backups)

The system includes a resilient offline architecture:
- **Automatic Disconnect Detection**: If a laptop or workstation loses connection to the server or Wi-Fi router, the application automatically enters **Offline Mode**.
- **Local Cache**: Any case files added, edited, or checked out while disconnected are saved into browser storage.
- **Download Offline Backup**: Click **Download Backup (.json)** on the top offline banner or toolbar. The `.json` file contains all newly inputted records, edits, and timestamps.
- **Import Offline Backup**: When reconnecting to the server (or switching machines), click **Import JSON**. Choose:
  - **Overwrite Registry**: Completely restores the full backup.
  - **Merge & Synchronize**: Merges offline changes into the server database by Suit Number/ID without deleting other files.
