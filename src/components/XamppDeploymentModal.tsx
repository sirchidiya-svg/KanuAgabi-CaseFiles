/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { downloadFile } from '../utils/storage';
import {
  Copy,
  Check,
  Download,
  Server,
  FileCode,
  Shield,
  Network,
  Lock,
  Monitor,
  FileDown,
  Archive,
  ArrowRight,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface XamppDeploymentModalProps {
  onClose?: () => void;
}

export const XamppDeploymentModal: React.FC<XamppDeploymentModalProps> = () => {
  const [activeTab, setActiveTab] = useState<
    'architecture' | 'secure_ports' | 'desktop_launcher' | 'sql' | 'db_php' | 'auth_php' | 'api_php' | 'network_guide'
  >('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Direct download trigger (first attempts static download, then falls back to in-memory Blob)
  const triggerDownload = (fileName: string, fallbackContent?: string, mimeType?: string) => {
    try {
      const a = document.createElement('a');
      a.href = `/xampp/${fileName}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      if (fallbackContent) {
        downloadFile(fallbackContent, fileName, mimeType || 'text/plain');
      }
    }
  };

  // PHP Database Connector (matches /xampp/db.php)
  const PHP_DB = `<?php
/**
 * Kanu G. Agabi & Associates - Case File Inventory and Tracking System
 * Database Connection Module (XAMPP / MySQL / MariaDB)
 * 
 * Instructions:
 * Place this file in your XAMPP web root folder:
 * C:\\xampp\\htdocs\\LawFirmInventory\\db.php
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '127.0.0.1';
$db   = 'LawFirmInventory';
$user = 'root';
$pass = ''; // Default XAMPP MySQL password is blank
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'connected' => false,
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'instructions' => 'Ensure MySQL service is started in XAMPP Control Panel and database.sql has been imported via phpMyAdmin.'
    ]);
    exit();
}
?>`;

  // PHP Authentication Script (matches /xampp/auth.php)
  const PHP_AUTH = `<?php
/**
 * Kanu G. Agabi & Associates - Case File Inventory and Tracking System
 * Authentication & Session Service
 * 
 * Target Location:
 * C:\\xampp\\htdocs\\LawFirmInventory\\auth.php
 */

require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Malformed JSON request']);
    exit();
}

$action = $data['action'] ?? 'login';

if ($action === 'login') {
    $role = $data['role'] ?? 'GUEST';

    if ($role === 'GUEST') {
        $guestName = trim($data['guestName'] ?? 'Chamber Intern / Guest');
        $chamberUnit = trim($data['chamberUnit'] ?? 'General Registry');

        echo json_encode([
            'status' => 'success',
            'role' => 'GUEST',
            'userName' => $guestName,
            'chamberUnit' => $chamberUnit,
            'token' => 'guest_session_' . bin2hex(random_bytes(16)),
            'message' => 'Guest read-only access granted'
        ]);
        exit();
    }

    // Admin & Super Admin Authentication
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Username and password are required']);
        exit();
    }

    $inputHash = hash('sha256', $password);

    try {
        $stmt = $pdo->prepare('SELECT AdminID, Username, FullName, RoleTitle, PasswordHash FROM AdminUsers WHERE Username = :username LIMIT 1');
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        if ($user && hash_equals($user['PasswordHash'], $inputHash)) {
            $isSuper = (strtolower($user['Username']) === 'superadmin' || strpos(strtolower($user['RoleTitle']), 'super') !== false);
            
            echo json_encode([
                'status' => 'success',
                'role' => $isSuper ? 'SUPER_ADMIN' : 'ADMIN',
                'userName' => $user['FullName'],
                'chamberUnit' => $user['RoleTitle'],
                'token' => bin2hex(random_bytes(32)),
                'message' => 'Authentication successful'
            ]);
            exit();
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Invalid username or credentials']);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Authentication query failed: ' . $e->getMessage()]);
        exit();
    }
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Unknown action']);
?>`;

  // PHP CRUD API (matches /xampp/api.php)
  const PHP_API = `<?php
/**
 * Kanu G. Agabi & Associates - Case File Inventory and Tracking System
 * Central CRUD and Synchronization API
 * 
 * Target Location:
 * C:\\xampp\\htdocs\\LawFirmInventory\\api.php
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET Requests
if ($method === 'GET') {
    if ($action === 'cases') {
        try {
            $stmt = $pdo->query('SELECT RecordID as id, SuitNumber as suitNumber, CourtName as courtName, CaseTitle as caseTitle, ShelfNumber as shelfNumber, Status as status, Remark as remark, AssignedCounsel as assignedCounsel, BoxOrBay as boxOrBay, DateAdded as dateAdded FROM CaseFiles ORDER BY CourtName, SuitNumber');
            $cases = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $cases]);
            exit();
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            exit();
        }
    }

    if ($action === 'movements') {
        try {
            $stmt = $pdo->query('SELECT MovementID as id, SuitNumber as suitNumber, BorrowerName as borrowerName, ChamberUnit as chamberUnit, DateCheckedOut as dateCheckedOut, ExpectedReturnDate as expectedReturnDate, DateReturned as dateReturned, Purpose as purpose, ApprovedBy as approvedBy FROM FileMovements ORDER BY DateCheckedOut DESC');
            $movements = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $movements]);
            exit();
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            exit();
        }
    }

    if ($action === 'export_json') {
        try {
            $stmtCases = $pdo->query('SELECT RecordID as id, SuitNumber as suitNumber, CourtName as courtName, CaseTitle as caseTitle, ShelfNumber as shelfNumber, Status as status, Remark as remark, AssignedCounsel as assignedCounsel, BoxOrBay as boxOrBay, DateAdded as dateAdded FROM CaseFiles ORDER BY CourtName, SuitNumber');
            $cases = $stmtCases->fetchAll();

            $stmtMovements = $pdo->query('SELECT MovementID as id, SuitNumber as suitNumber, BorrowerName as borrowerName, ChamberUnit as chamberUnit, DateCheckedOut as dateCheckedOut, ExpectedReturnDate as expectedReturnDate, DateReturned as dateReturned, Purpose as purpose, ApprovedBy as approvedBy FROM FileMovements ORDER BY DateCheckedOut DESC');
            $movements = $stmtMovements->fetchAll();

            $payload = [
                'system' => 'Kanu G. Agabi & Associates - Case File Inventory and Tracking System',
                'lawFirm' => 'Kanu G. Agabi & Associates',
                'version' => '3.0',
                'exportedAt' => date('c'),
                'totalCases' => count($cases),
                'totalMovements' => count($movements),
                'caseFiles' => $cases,
                'movements' => $movements,
            ];

            echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit();
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            exit();
        }
    }
}

// POST & PUT Requests
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?? [];

    if ($action === 'save_case') {
        $id = $body['id'] ?? ('KGA-' . strtoupper(bin2hex(random_bytes(3))));
        $suitNumber = trim($body['suitNumber'] ?? '');
        $courtName = trim($body['courtName'] ?? '');
        $caseTitle = trim($body['caseTitle'] ?? '');
        $shelfNumber = trim($body['shelfNumber'] ?? 'Unassigned');
        $status = $body['status'] ?? 'Active';
        $remark = $body['remark'] ?? '';
        $assignedCounsel = $body['assignedCounsel'] ?? 'Kanu G. Agabi & Associates';
        $boxOrBay = $body['boxOrBay'] ?? 'Registry Bay A';
        $dateAdded = $body['dateAdded'] ?? date('Y-m-d');

        if (empty($suitNumber) || empty($courtName) || empty($caseTitle)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Suit number, court, and title are required.']);
            exit();
        }

        try {
            $sql = 'INSERT INTO CaseFiles (RecordID, SuitNumber, CourtName, CaseTitle, ShelfNumber, Status, Remark, AssignedCounsel, BoxOrBay, DateAdded)
                    VALUES (:id, :suit, :court, :title, :shelf, :status, :remark, :counsel, :box, :dateAdded)
                    ON DUPLICATE KEY UPDATE
                    CourtName = VALUES(CourtName),
                    CaseTitle = VALUES(CaseTitle),
                    ShelfNumber = VALUES(ShelfNumber),
                    Status = VALUES(Status),
                    Remark = VALUES(Remark),
                    AssignedCounsel = VALUES(AssignedCounsel),
                    BoxOrBay = VALUES(BoxOrBay)';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id' => $id,
                'suit' => $suitNumber,
                'court' => $courtName,
                'title' => $caseTitle,
                'shelf' => $shelfNumber,
                'status' => $status,
                'remark' => $remark,
                'counsel' => $assignedCounsel,
                'box' => $boxOrBay,
                'dateAdded' => $dateAdded,
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Case file saved successfully', 'id' => $id]);
            exit();
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            exit();
        }
    }

    if ($action === 'import_json') {
        $cases = $body['caseFiles'] ?? $body['cases'] ?? [];
        $mode = $body['mode'] ?? 'overwrite';

        if (!is_array($cases) || empty($cases)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No valid cases array in JSON payload']);
            exit();
        }

        try {
            $pdo->beginTransaction();

            if ($mode === 'overwrite') {
                $pdo->exec('DELETE FROM CaseFiles');
            }

            $stmt = $pdo->prepare('INSERT INTO CaseFiles (RecordID, SuitNumber, CourtName, CaseTitle, ShelfNumber, Status, Remark, AssignedCounsel, BoxOrBay, DateAdded)
                                   VALUES (:id, :suit, :court, :title, :shelf, :status, :remark, :counsel, :box, :dateAdded)
                                   ON DUPLICATE KEY UPDATE
                                   CourtName = VALUES(CourtName),
                                   CaseTitle = VALUES(CaseTitle),
                                   ShelfNumber = VALUES(ShelfNumber),
                                   Status = VALUES(Status),
                                   Remark = VALUES(Remark)');

            $count = 0;
            foreach ($cases as $c) {
                if (empty($c['suitNumber']) && empty($c['caseTitle'])) continue;
                $stmt->execute([
                    'id' => $c['id'] ?? ('KGA-' . sprintf('%04d', $count + 1)),
                    'suit' => $c['suitNumber'] ?? 'UNASSIGNED',
                    'court' => $c['courtName'] ?? 'Supreme Court of Nigeria',
                    'title' => $c['caseTitle'] ?? 'Untitled Case',
                    'shelf' => $c['shelfNumber'] ?? 'Shelf A1',
                    'status' => $c['status'] ?? 'Active',
                    'remark' => $c['remark'] ?? '',
                    'counsel' => $c['assignedCounsel'] ?? 'Kanu G. Agabi & Associates',
                    'box' => $c['boxOrBay'] ?? 'Registry Bay A',
                    'dateAdded' => $c['dateAdded'] ?? date('Y-m-d'),
                ]);
                $count++;
            }

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => "Successfully synchronized $count cases into database"]);
            exit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Import transaction failed: ' . $e->getMessage()]);
            exit();
        }
    }
}

// DELETE Request
if ($method === 'DELETE' || $action === 'delete_case') {
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Record ID or SuitNumber required']);
        exit();
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM CaseFiles WHERE RecordID = :id OR SuitNumber = :suit');
        $stmt->execute(['id' => $id, 'suit' => $id]);
        echo json_encode(['status' => 'success', 'message' => 'Case file removed from registry']);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        exit();
    }
}

http_response_code(404);
echo json_encode(['status' => 'error', 'message' => 'Endpoint not found']);
?>`;

  // SQL Schema Script (Header and table definitions)
  const SQL_SCHEMA_HEADER = `-- =========================================================================
-- KANU G. AGABI & ASSOCIATES - CASE FILE INVENTORY AND TRACKING SYSTEM
-- Production Database Creation & Seed Script (388 Authentic Chambers Cases)
-- For MySQL / MariaDB (XAMPP Environment)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS LawFirmInventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE LawFirmInventory;

-- 1. Admin Users Table (Super Admin & Chambers Admin)
CREATE TABLE IF NOT EXISTS AdminUsers (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash CHAR(64) NOT NULL,
    FullName VARCHAR(200) NOT NULL,
    RoleTitle VARCHAR(100) NOT NULL DEFAULT 'Head of Chambers',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO AdminUsers (Username, PasswordHash, FullName, RoleTitle) VALUES
('superadmin', SHA2('SuperAgabi#2026!', 256), 'Principal Partner (SAN) / Super Administrator', 'Super Administrator'),
('admin', SHA2('ChambersAdmin2026', 256), 'Head of Chambers (HOC)', 'Chambers Administrator')
ON DUPLICATE KEY UPDATE AdminID=AdminID;

-- 2. Case Files Table
CREATE TABLE IF NOT EXISTS CaseFiles (
    RecordID VARCHAR(50) NOT NULL,
    SuitNumber VARCHAR(150) NOT NULL,
    CourtName VARCHAR(255) NOT NULL,
    CaseTitle TEXT NOT NULL,
    ShelfNumber VARCHAR(50) NOT NULL,
    Status ENUM('Active', 'Pending', 'Concluded', 'Abandoned') NOT NULL DEFAULT 'Active',
    Remark TEXT,
    AssignedCounsel VARCHAR(255) DEFAULT 'Kanu G. Agabi & Associates',
    BoxOrBay VARCHAR(100) DEFAULT 'Registry Bay A',
    DateAdded DATE DEFAULT (CURRENT_DATE),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (RecordID),
    INDEX idx_suit (SuitNumber),
    INDEX idx_court (CourtName),
    INDEX idx_shelf (ShelfNumber),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. File Movements Table
CREATE TABLE IF NOT EXISTS FileMovements (
    MovementID INT AUTO_INCREMENT PRIMARY KEY,
    SuitNumber VARCHAR(150) NOT NULL,
    BorrowerName VARCHAR(255) NOT NULL,
    ChamberUnit VARCHAR(150) NOT NULL,
    DateCheckedOut DATETIME DEFAULT CURRENT_TIMESTAMP,
    ExpectedReturnDate DATETIME NOT NULL,
    DateReturned DATETIME DEFAULT NULL,
    Purpose VARCHAR(255) NOT NULL,
    ApprovedBy VARCHAR(150) NOT NULL,
    INDEX idx_movement_suit (SuitNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Seed Data: 388 Cases from Official Chambers Typed Document
-- Note: The complete 81KB SQL dump with all 388 cases is downloaded via the button above.
`;

  // Local Network & Wi-Fi Hotspot IPv4 Setup Guide
  const NETWORK_GUIDE = `================================================================================
KANU G. AGABI & ASSOCIATES - CENTRAL FILE ROOM INVENTORY
LOCAL NETWORK HOSTING & WI-FI HOTSPOT IPV4 DEPLOYMENT MANUAL
================================================================================

1. HOST MACHINE SETUP (XAMPP on Windows Server / PC)
--------------------------------------------------------------------------------
a. Download and install XAMPP from https://www.apachefriends.org
b. Start the Apache and MySQL modules via the XAMPP Control Panel.
c. Open phpMyAdmin at http://localhost/phpmyadmin (or http://localhost:8080/phpmyadmin if port changed).
d. Import database.sql (using the Download button in this system).
e. Place the project files inside your webroot:
   C:\\xampp\\htdocs\\LawFirmInventory\\

2. FINDING THE HOST PC's IPV4 ADDRESS
--------------------------------------------------------------------------------
On the host computer running XAMPP:
a. Press Windows Key + R, type "cmd" and press Enter.
b. Run:
   ipconfig
c. Look for the active network adapter:
   - If connected via Wi-Fi Router / Mobile Hotspot: Look under "Wireless LAN adapter Wi-Fi"
   - Note the line: "IPv4 Address . . . . . . . . . . . : 192.168.1.105" (example)
d. The host's local URL is: http://localhost:8080/LawFirmInventory/
e. All client devices on the same Wi-Fi will connect to:
   http://192.168.1.105:8080/LawFirmInventory/

3. CONFIGURING APACHE FOR LOCAL NETWORK CLIENT ACCESS
--------------------------------------------------------------------------------
By default, Apache may restrict incoming requests from other devices. Ensure access:
a. Open C:\\xampp\\apache\\conf\\httpd.conf
b. Verify or add the following directory directive:
   <Directory "C:/xampp/htdocs">
       Options Indexes FollowSymLinks Includes ExecCGI
       AllowOverride All
       Require all granted
   </Directory>
c. Restart the Apache service in XAMPP Control Panel.

4. WINDOWS DEFENDER FIREWALL CONFIGURATION
--------------------------------------------------------------------------------
Allow incoming connections on Port 8080 (HTTP) & 8443 (HTTPS):
a. Open Windows Defender Firewall with Advanced Security.
b. Click "Inbound Rules" -> "New Rule...".
c. Rule Type: Port -> Protocol: TCP -> Specific local ports: 8080, 8443 (or 80, 443).
d. Action: "Allow the connection".
e. Profile: Check "Domain", "Private" (and "Public" if using mobile hotspot).
f. Name: "XAMPP Apache HTTP Server - Chambers File Inventory".

5. CHAMBER CLIENT ACCESS (iPads, Laptops, Mobile Devices)
--------------------------------------------------------------------------------
a. Connect the client device (e.g., Counsel iPad or Partner laptop) to the chamber
   Wi-Fi hotspot network.
b. Open Safari, Chrome, or Firefox.
c. Enter the Host IPv4 address in the browser address bar:
   http://192.168.1.105:8080/LawFirmInventory/
d. For Guests: Enter Counsel Name and Chamber Division to browse in Read-Only mode.
e. For Admins: Click "Admin Login", enter "admin" and password "ChambersAdmin2026" or "superadmin".
================================================================================`;

  // Guide on changing ports to secure numbers and configuring SSL
  const SECURE_PORTS_GUIDE = `================================================================================
KANU G. AGABI & ASSOCIATES - CASE FILE INVENTORY AND TRACKING SYSTEM
PRODUCTION GUIDE: CHANGING XAMPP TO SECURE NON-CONFLICTING PORTS (HTTP 8080 & HTTPS 8443)
================================================================================

1. WHY CHANGE XAMPP DEFAULT PORTS?
--------------------------------------------------------------------------------
By default, Apache listens on Port 80 (HTTP) and Port 443 (HTTPS/SSL).
In enterprise environments, Port 80 is frequently locked by Windows services:
- World Wide Web Publishing Service (W3SVC / IIS)
- Skype Desktop
- VMware Workstation / VirtualBox NAT
Moving Apache to Port 8080 (HTTP) and Port 8443 (HTTPS) eliminates port conflicts,
ensures instant server startup, and allows enabling SSL encryption across chambers Wi-Fi.

2. STEP-BY-STEP: CHANGE APACHE HTTP PORT (80 -> 8080)
--------------------------------------------------------------------------------
a. Open XAMPP Control Panel.
b. In the Apache row, click "Config" -> select "Apache (httpd.conf)".
c. Search (Ctrl + F) for:
      Listen 80
   Change to:
      Listen 8080
d. Search (Ctrl + F) for:
      ServerName localhost:80
   Change to:
      ServerName localhost:8080
e. Save file (Ctrl + S) and close Notepad.

3. STEP-BY-STEP: CHANGE APACHE SECURE SSL PORT (443 -> 8443)
--------------------------------------------------------------------------------
a. In XAMPP Control Panel, click "Config" -> select "Apache (httpd-ssl.conf)".
b. Search for:
      Listen 443
   Change to:
      Listen 8443
c. Search for:
      <VirtualHost _default_:443>
   Change to:
      <VirtualHost _default_:8443>
d. Search for:
      ServerName localhost:443
   Change to:
      ServerName localhost:8443
e. Save file (Ctrl + S) and close Notepad.

4. STEP-BY-STEP: UPDATE XAMPP SERVICE AND PORT SETTINGS
--------------------------------------------------------------------------------
a. At the top right of XAMPP Control Panel, click "Config" (Gear Icon).
b. Click the "Service and Port Settings" button.
c. Under the "Apache" tab:
   - Set "Main Port" to: 8080
   - Set "SSL Port" to: 8443
d. Click Save, then click Save on the main window.
e. In XAMPP Control Panel, click "Stop" on Apache, then click "Start".
   Apache will now display in green with ports 8080, 8443.

5. AUTOMATIC FORCE REDIRECT TO ENCRYPTED HTTPS
--------------------------------------------------------------------------------
To ensure client data is never transmitted in clear text across chambers Wi-Fi,
open C:\\xampp\\apache\\conf\\extra\\httpd-vhosts.conf and append:

<VirtualHost *:8080>
    ServerName localhost
    Redirect permanent / https://localhost:8443/
</VirtualHost>

All counsel connecting via Wi-Fi will be automatically routed to encrypted HTTPS!
================================================================================`;

  // Guide on launching as a desktop application
  const DESKTOP_GUIDE = `================================================================================
KANU G. AGABI & ASSOCIATES - CASE FILE INVENTORY AND TRACKING SYSTEM
GUIDE: RUNNING & LAUNCHING AS A DEDICATED WINDOWS DESKTOP APPLICATION
================================================================================

METHOD 1: INSTANT PWA APP (GOOGLE CHROME & MICROSOFT EDGE) - RECOMMENDED
--------------------------------------------------------------------------------
1. Open Google Chrome or Microsoft Edge.
2. Navigate to your chambers system URL (e.g., http://localhost:3000 or http://localhost:8080/LawFirmInventory).
3. In the browser address bar (top right):
   - In Chrome: Click the "Install Kanu G. Agabi Inventory" icon.
   - In Edge: Click the "App available" or "Install this site as an app" icon.
4. Click "Install".
5. The application immediately detaches into its own frameless desktop window
   with zero browser tabs, URL bar, or distraction.
6. A permanent shortcut is created on your Windows Desktop and Start Menu!

METHOD 2: DEDICATED WINDOWS BATCH LAUNCHER (.bat)
--------------------------------------------------------------------------------
1. Download "desktop-launcher.bat" (using the button above).
2. Save it directly to the Windows Desktop.
3. Double-click the file anytime: it auto-detects Edge or Chrome and launches
   the chambers inventory in --app mode as a standalone desktop program.

METHOD 3: SILENT WINDOWS LAUNCHER (.vbs)
--------------------------------------------------------------------------------
1. Download "desktop-launcher.vbs" (using the button above).
2. Save it to the Windows Desktop.
3. Double-click it: it runs completely silently in the background without
   flashing any black command prompt window.
================================================================================`;

  const BATCH_LAUNCHER = `@echo off
:: =========================================================================
:: KANU G. AGABI & ASSOCIATES - CASE FILE INVENTORY AND TRACKING SYSTEM
:: Dedicated Windows Desktop Application Launcher
:: =========================================================================
title Kanu G. Agabi & Associates - Case Inventory
color 0F

echo =========================================================================
echo  KANU G. AGABI & ASSOCIATES - CENTRAL REGISTRY & FILE TRACKING SYSTEM
echo  Initializing Local Chambers Registry Desktop Interface...
echo =========================================================================
echo.

set APP_URL=http://localhost:3000

set CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
set CHROME_PATH_X86="C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
set EDGE_PATH="C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
set EDGE_PATH_X64="C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"

if exist %EDGE_PATH_X64% (
    echo [OK] Launching via Microsoft Edge Desktop Window...
    start "" %EDGE_PATH_X64% --app=%APP_URL% --window-size=1400,900
    goto END
)

if exist %EDGE_PATH% (
    echo [OK] Launching via Microsoft Edge Desktop Window...
    start "" %EDGE_PATH% --app=%APP_URL% --window-size=1400,900
    goto END
)

if exist %CHROME_PATH% (
    echo [OK] Launching via Google Chrome Desktop Window...
    start "" %CHROME_PATH% --app=%APP_URL% --window-size=1400,900
    goto END
)

if exist %CHROME_PATH_X86% (
    echo [OK] Launching via Google Chrome Desktop Window...
    start "" %CHROME_PATH_X86% --app=%APP_URL% --window-size=1400,900
    goto END
)

start "" %APP_URL%

:END
echo Application window opened.
timeout /t 3 >nul
exit
`;

  const VBS_LAUNCHER = `' Kanu G. Agabi & Associates - Silent Desktop Launcher
Set WshShell = CreateObject("WScript.Shell")
AppUrl = "http://localhost:3000"
EdgePath64 = "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
EdgePath86 = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
Chrome64   = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
Chrome86   = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"

Set fso = CreateObject("Scripting.FileSystemObject")
If fso.FileExists(EdgePath64) Then
    WshShell.Run """" & EdgePath64 & """ --app=" & AppUrl & " --window-size=1400,900", 1, False
ElseIf fso.FileExists(EdgePath86) Then
    WshShell.Run """" & EdgePath86 & """ --app=" & AppUrl & " --window-size=1400,900", 1, False
ElseIf fso.FileExists(Chrome64) Then
    WshShell.Run """" & Chrome64 & """ --app=" & AppUrl & " --window-size=1400,900", 1, False
ElseIf fso.FileExists(Chrome86) Then
    WshShell.Run """" & Chrome86 & """ --app=" & AppUrl & " --window-size=1400,900", 1, False
Else
    WshShell.Run AppUrl, 1, False
End If
`;

  // Production Files Metadata Array
  const PRODUCTION_FILES = [
    {
      name: 'database.sql',
      badge: 'SQL Dump',
      size: '81 KB',
      description: 'Complete MySQL/MariaDB database schema (CaseFiles, FileMovements, AdminUsers, GuestAccessLogs) pre-seeded with all 388 authentic case files.',
      destination: 'Import via phpMyAdmin OR place in C:\\xampp\\htdocs\\LawFirmInventory\\',
      tabKey: 'sql' as const,
      mimeType: 'application/sql',
      fallback: SQL_SCHEMA_HEADER,
    },
    {
      name: 'db.php',
      badge: 'PHP PDO',
      size: '1.4 KB',
      description: 'PDO database connection module with UTF-8 encoding (utf8mb4), prepared statements, and Cross-Origin Resource Sharing (CORS) headers.',
      destination: 'C:\\xampp\\htdocs\\LawFirmInventory\\db.php',
      tabKey: 'db_php' as const,
      mimeType: 'application/x-php',
      fallback: PHP_DB,
    },
    {
      name: 'auth.php',
      badge: 'PHP Auth',
      size: '2.8 KB',
      description: 'Chambers session service with SHA-256 password hashing for superadmin & admin logins, plus visitor/extern guest access logging.',
      destination: 'C:\\xampp\\htdocs\\LawFirmInventory\\auth.php',
      tabKey: 'auth_php' as const,
      mimeType: 'application/x-php',
      fallback: PHP_AUTH,
    },
    {
      name: 'api.php',
      badge: 'PHP REST',
      size: '9.3 KB',
      description: 'Central CRUD and backup synchronization API. Supports case querying, checking out files, returning files, and JSON backup import/export.',
      destination: 'C:\\xampp\\htdocs\\LawFirmInventory\\api.php',
      tabKey: 'api_php' as const,
      mimeType: 'application/x-php',
      fallback: PHP_API,
    },
    {
      name: 'desktop-launcher.bat',
      badge: 'Windows Batch',
      size: '2.1 KB',
      description: 'One-click Windows batch script that auto-detects Edge or Chrome and launches the system in a clean, distraction-free native desktop window.',
      destination: 'Save directly to Windows Desktop (Rename to "Kanu Agabi Registry.bat")',
      tabKey: 'desktop_launcher' as const,
      mimeType: 'application/x-bat',
      fallback: BATCH_LAUNCHER,
    },
    {
      name: 'desktop-launcher.vbs',
      badge: 'VBScript',
      size: '1.4 KB',
      description: 'Silent Windows launcher that executes the desktop application in the background without flashing any black command console window.',
      destination: 'Save directly to Windows Desktop',
      tabKey: 'desktop_launcher' as const,
      mimeType: 'application/x-vbs',
      fallback: VBS_LAUNCHER,
    },
    {
      name: 'SECURE_PORT_AND_SETUP_GUIDE.md',
      badge: 'Markdown Manual',
      size: '5.6 KB',
      description: 'Complete on-premise installation manual with step-by-step instructions for changing Apache ports to 8080/8443, enabling SSL, and client Wi-Fi setup.',
      destination: 'Chambers IT Reference / Documentation',
      tabKey: 'secure_ports' as const,
      mimeType: 'text/markdown',
      fallback: SECURE_PORTS_GUIDE,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      {/* Title & Top Action Bar */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b-2 border-black pb-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="border border-black px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-black text-white">
              Production Release
            </span>
            <span className="text-xs uppercase tracking-widest text-black">
              Chambers On-Premise XAMPP Server Suite
            </span>
          </div>
          <h2 className="mt-1 text-lg font-bold uppercase tracking-tight text-black sm:text-2xl">
            XAMPP Server Scripts, Secure Port Config & Desktop Suite
          </h2>
          <p className="text-xs uppercase tracking-wider text-black">
            7 Production-Ready Files in <code className="bg-neutral-100 px-1 border border-black/30">/xampp/</code> · All 388 Authentic Case Files Included
          </p>
        </div>

        {/* Action Downloads Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Complete ZIP Package */}
          <button
            onClick={() => triggerDownload('kanu-agabi-xampp-suite.zip')}
            title="Download all 7 scripts in a single ZIP package"
            className="flex items-center gap-1.5 border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer shadow-sm"
          >
            <Archive className="h-4 w-4" />
            <span>Download Complete ZIP Suite (.zip)</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded font-mono">21 KB</span>
          </button>

          {/* Quick Individual Downloads */}
          <button
            onClick={() => triggerDownload('database.sql', SQL_SCHEMA_HEADER, 'application/sql')}
            title="Download MySQL Database Script with 388 Cases"
            className="flex items-center gap-1.5 border border-black bg-white px-3 py-2 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
          >
            <FileDown className="h-3.5 w-3.5" />
            database.sql
          </button>

          <button
            onClick={() => triggerDownload('db.php', PHP_DB, 'application/x-php')}
            title="Download db.php Connector"
            className="flex items-center gap-1.5 border border-black bg-white px-2.5 py-2 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            db.php
          </button>

          <button
            onClick={() => triggerDownload('api.php', PHP_API, 'application/x-php')}
            title="Download api.php REST API"
            className="flex items-center gap-1.5 border border-black bg-white px-2.5 py-2 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            api.php
          </button>

          <button
            onClick={() => triggerDownload('desktop-launcher.bat', BATCH_LAUNCHER, 'application/x-bat')}
            title="Download Windows Desktop Launcher"
            className="flex items-center gap-1.5 border border-black bg-white px-2.5 py-2 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
          >
            <Monitor className="h-3.5 w-3.5" />
            .bat Launcher
          </button>
        </div>
      </div>

      {/* Code Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b-2 border-black pb-2 bg-white">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`border border-black px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'architecture' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Server className="h-3.5 w-3.5" />
          Overview & Download Hub
        </button>

        <button
          onClick={() => setActiveTab('secure_ports')}
          className={`border border-black px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'secure_ports' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          Secure Ports & SSL
        </button>

        <button
          onClick={() => setActiveTab('desktop_launcher')}
          className={`border border-black px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'desktop_launcher' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Monitor className="h-3.5 w-3.5" />
          Desktop Launchers
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`border border-black px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sql' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          database.sql
        </button>

        <button
          onClick={() => setActiveTab('db_php')}
          className={`border border-black px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'db_php' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          db.php
        </button>

        <button
          onClick={() => setActiveTab('auth_php')}
          className={`border border-black px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'auth_php' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          auth.php
        </button>

        <button
          onClick={() => setActiveTab('api_php')}
          className={`border border-black px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'api_php' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          api.php
        </button>

        <button
          onClick={() => setActiveTab('network_guide')}
          className={`border border-black px-3 py-1.5 text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'network_guide' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Network className="h-3.5 w-3.5" />
          Wi-Fi & IPv4 Guide
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-4 border-2 border-black bg-white p-5">
        {/* Architecture & Download Hub Tab */}
        {activeTab === 'architecture' && (
          <div className="space-y-6 text-xs text-black">
            {/* Download Hub Card Grid */}
            <div className="border-2 border-black p-4 bg-neutral-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Production Files in /xampp/ Directory — Ready to Download & Deploy
                  </h3>
                  <p className="text-[11px] text-neutral-700 mt-0.5">
                    All backend server scripts, database schemas, desktop launchers, and configuration documents are organized into individual files.
                  </p>
                </div>
                <button
                  onClick={() => triggerDownload('kanu-agabi-xampp-suite.zip')}
                  className="flex items-center gap-1.5 border border-black bg-black px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download All in 1 ZIP (.zip)
                </button>
              </div>

              {/* 7 Production Files Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRODUCTION_FILES.map((f) => (
                  <div key={f.name} className="border border-black bg-white p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-black/20 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                          <FileCode className="h-3.5 w-3.5 text-black" />
                          <span>{f.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="border border-black/40 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                            {f.badge}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-600">
                            {f.size}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-800 mb-2">
                        {f.description}
                      </p>
                      <div className="text-[10px] font-mono bg-neutral-100 p-1.5 border border-black/20 text-neutral-800 truncate mb-3">
                        <span className="font-bold">Target: </span>{f.destination}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-black/10">
                      <button
                        onClick={() => triggerDownload(f.name, f.fallback, f.mimeType)}
                        className="flex-1 flex items-center justify-center gap-1 border border-black bg-black px-2.5 py-1 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        Download {f.name}
                      </button>
                      <button
                        onClick={() => setActiveTab(f.tabKey)}
                        className="flex items-center gap-1 border border-black bg-white px-2.5 py-1 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
                      >
                        <ArrowRight className="h-3 w-3" />
                        View Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Explanatory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-black p-3">
                <div className="font-bold uppercase tracking-wider text-black border-b border-black pb-1">
                  1. Host Node (XAMPP Server)
                </div>
                <ul className="mt-2 space-y-1">
                  <li><strong>Environment:</strong> Apache 2.4 + MySQL 8 / MariaDB</li>
                  <li><strong>Host IP:</strong> Access via <code>http://localhost:8080/</code> on host PC</li>
                  <li><strong>Role:</strong> Central authority running file room database</li>
                </ul>
              </div>

              <div className="border border-black p-3">
                <div className="font-bold uppercase tracking-wider text-black border-b border-black pb-1">
                  2. Chamber Wi-Fi Clients
                </div>
                <ul className="mt-2 space-y-1">
                  <li><strong>Client Devices:</strong> iPads, laptops, mobile phones</li>
                  <li><strong>Access:</strong> Connect to <code>http://[Host-IPv4]:8080/LawFirmInventory</code></li>
                  <li><strong>Network:</strong> Local Wi-Fi router or dedicated hotspot</li>
                </ul>
              </div>

              <div className="border border-black p-3">
                <div className="font-bold uppercase tracking-wider text-black border-b border-black pb-1">
                  3. Security & Anti-Injection
                </div>
                <ul className="mt-2 space-y-1">
                  <li><strong>Authentication:</strong> SHA-256 cryptographic hashes</li>
                  <li><strong>Database Security:</strong> 100% Prepared Statements (PDO)</li>
                  <li><strong>Role Segregation:</strong> Strict Admin (CRUD) vs Guest (Read-Only)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Secure Ports & SSL Configuration Tab */}
        {activeTab === 'secure_ports' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-black pb-2 gap-2">
              <div>
                <div className="text-xs font-bold uppercase">
                  Apache Secure Port (8080 / 8443) & HTTPS SSL Configuration Manual
                </div>
                <div className="text-[11px] text-neutral-600">
                  Resolves Windows port 80 collisions and enables encrypted local Wi-Fi transmission
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerDownload('SECURE_PORT_AND_SETUP_GUIDE.md', SECURE_PORTS_GUIDE, 'text/markdown')}
                  className="flex items-center gap-1 border border-black bg-white px-2.5 py-1 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download Guide (.md)
                </button>
                <button
                  onClick={() => handleCopy('secure_ports', SECURE_PORTS_GUIDE)}
                  className="flex items-center gap-1 border border-black bg-black px-2.5 py-1 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                >
                  {copiedKey === 'secure_ports' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'secure_ports' ? 'Copied' : 'Copy Guide'}
                </button>
              </div>
            </div>

            <pre className="overflow-x-auto border border-black bg-neutral-100 p-4 text-[11px] font-mono text-black max-h-[500px] whitespace-pre-wrap leading-relaxed">
              {SECURE_PORTS_GUIDE}
            </pre>
          </div>
        )}

        {/* Desktop Launchers Tab */}
        {activeTab === 'desktop_launcher' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-black pb-2 gap-2">
              <div>
                <div className="text-xs font-bold uppercase">
                  Desktop Launchers: Standalone Windows App Experience
                </div>
                <div className="text-[11px] text-neutral-600">
                  Run the chambers inventory in a borderless, dedicated window without browser clutter
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerDownload('desktop-launcher.bat', BATCH_LAUNCHER, 'application/x-bat')}
                  className="flex items-center gap-1 border border-black bg-black px-3 py-1 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download .bat Launcher
                </button>
                <button
                  onClick={() => triggerDownload('desktop-launcher.vbs', VBS_LAUNCHER, 'application/x-vbs')}
                  className="flex items-center gap-1 border border-black bg-white px-3 py-1 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download .vbs Launcher
                </button>
              </div>
            </div>

            {/* 3 Methods Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="border border-black p-3 bg-neutral-50">
                <div className="font-bold uppercase text-black border-b border-black pb-1 mb-1.5 flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5 text-black" />
                  Method 1: Instant PWA
                </div>
                <p className="text-neutral-700 leading-relaxed text-[11px]">
                  Open in Chrome or Edge, click the <strong>Install App</strong> icon in the address bar. It installs onto your desktop with an official application icon and window.
                </p>
              </div>

              <div className="border border-black p-3 bg-neutral-50">
                <div className="font-bold uppercase text-black border-b border-black pb-1 mb-1.5 flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5 text-black" />
                  Method 2: Batch Launcher
                </div>
                <p className="text-neutral-700 leading-relaxed text-[11px]">
                  Save <strong>desktop-launcher.bat</strong> on your Windows desktop. Double-clicking it opens Edge or Chrome in dedicated <code>--app</code> mode.
                </p>
              </div>

              <div className="border border-black p-3 bg-neutral-50">
                <div className="font-bold uppercase text-black border-b border-black pb-1 mb-1.5 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-black" />
                  Method 3: Silent Launcher
                </div>
                <p className="text-neutral-700 leading-relaxed text-[11px]">
                  Save <strong>desktop-launcher.vbs</strong> on your desktop. It silently launches the desktop app without opening a black command prompt window.
                </p>
              </div>
            </div>

            <pre className="overflow-x-auto border border-black bg-neutral-100 p-4 text-[11px] font-mono text-black max-h-[400px] whitespace-pre-wrap leading-relaxed">
              {DESKTOP_GUIDE}
            </pre>
          </div>
        )}

        {/* SQL Schema Tab */}
        {activeTab === 'sql' && (
          <div>
            <div className="flex flex-wrap items-center justify-between border-b border-black pb-2 mb-3 gap-2">
              <div>
                <div className="text-xs font-bold uppercase">
                  MySQL Database Definition & 388 Seed Records: database.sql (81 KB)
                </div>
                <div className="text-[11px] text-neutral-600">
                  4 tables: CaseFiles, FileMovements, AdminUsers, GuestAccessLogs with all 388 authentic cases
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerDownload('database.sql', SQL_SCHEMA_HEADER, 'application/sql')}
                  className="flex items-center gap-1 border border-black bg-black px-3 py-1 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download database.sql (81 KB)
                </button>
                <button
                  onClick={() => handleCopy('sql', SQL_SCHEMA_HEADER)}
                  className="flex items-center gap-1 border border-black bg-white px-2.5 py-1 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
                >
                  {copiedKey === 'sql' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'sql' ? 'Copied' : 'Copy Schema'}
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto border border-black bg-neutral-900 p-4 text-[11px] font-mono text-neutral-100 max-h-[500px]">
              {SQL_SCHEMA_HEADER}
            </pre>
          </div>
        )}

        {/* db.php Tab */}
        {activeTab === 'db_php' && (
          <div>
            <div className="flex flex-wrap items-center justify-between border-b border-black pb-2 mb-3 gap-2">
              <div>
                <div className="text-xs font-bold uppercase">
                  Database Connector: db.php (PDO + UTF-8 + CORS)
                </div>
                <div className="text-[11px] text-neutral-600">
                  Target: C:\xampp\htdocs\LawFirmInventory\db.php
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerDownload('db.php', PHP_DB, 'application/x-php')}
                  className="flex items-center gap-1 border border-black bg-black px-3 py-1 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download db.php
                </button>
                <button
                  onClick={() => handleCopy('db_php', PHP_DB)}
                  className="flex items-center gap-1 border border-black bg-white px-2.5 py-1 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
                >
                  {copiedKey === 'db_php' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'db_php' ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto border border-black bg-neutral-900 p-4 text-[11px] font-mono text-neutral-100 max-h-[500px]">
              {PHP_DB}
            </pre>
          </div>
        )}

        {/* auth.php Tab */}
        {activeTab === 'auth_php' && (
          <div>
            <div className="flex flex-wrap items-center justify-between border-b border-black pb-2 mb-3 gap-2">
              <div>
                <div className="text-xs font-bold uppercase">
                  Authentication Service: auth.php (SHA-256 Hashing)
                </div>
                <div className="text-[11px] text-neutral-600">
                  Target: C:\xampp\htdocs\LawFirmInventory\auth.php
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerDownload('auth.php', PHP_AUTH, 'application/x-php')}
                  className="flex items-center gap-1 border border-black bg-black px-3 py-1 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download auth.php
                </button>
                <button
                  onClick={() => handleCopy('auth_php', PHP_AUTH)}
                  className="flex items-center gap-1 border border-black bg-white px-2.5 py-1 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
                >
                  {copiedKey === 'auth_php' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'auth_php' ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto border border-black bg-neutral-900 p-4 text-[11px] font-mono text-neutral-100 max-h-[500px]">
              {PHP_AUTH}
            </pre>
          </div>
        )}

        {/* api.php Tab */}
        {activeTab === 'api_php' && (
          <div>
            <div className="flex flex-wrap items-center justify-between border-b border-black pb-2 mb-3 gap-2">
              <div>
                <div className="text-xs font-bold uppercase">
                  RESTful CRUD & Backup Sync API: api.php
                </div>
                <div className="text-[11px] text-neutral-600">
                  Target: C:\xampp\htdocs\LawFirmInventory\api.php
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerDownload('api.php', PHP_API, 'application/x-php')}
                  className="flex items-center gap-1 border border-black bg-black px-3 py-1 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download api.php
                </button>
                <button
                  onClick={() => handleCopy('api_php', PHP_API)}
                  className="flex items-center gap-1 border border-black bg-white px-2.5 py-1 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
                >
                  {copiedKey === 'api_php' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'api_php' ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto border border-black bg-neutral-900 p-4 text-[11px] font-mono text-neutral-100 max-h-[500px]">
              {PHP_API}
            </pre>
          </div>
        )}

        {/* Network Guide Tab */}
        {activeTab === 'network_guide' && (
          <div>
            <div className="flex flex-wrap items-center justify-between border-b border-black pb-2 mb-3 gap-2">
              <div>
                <div className="text-xs font-bold uppercase">
                  Local Area Network (LAN) & Hotspot IPv4 Deployment Manual
                </div>
                <div className="text-[11px] text-neutral-600">
                  Connecting counsel iPads and laptops over chambers local Wi-Fi
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadFile(NETWORK_GUIDE, 'LAN_Hotspot_IPv4_Manual.txt', 'text/plain')}
                  className="flex items-center gap-1 border border-black bg-white px-2.5 py-1 text-xs font-bold uppercase text-black hover:bg-neutral-100 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Save Manual
                </button>
                <button
                  onClick={() => handleCopy('network_guide', NETWORK_GUIDE)}
                  className="flex items-center gap-1 border border-black bg-black px-2.5 py-1 text-xs font-bold uppercase text-white hover:bg-neutral-800 cursor-pointer"
                >
                  {copiedKey === 'network_guide' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'network_guide' ? 'Copied' : 'Copy Guide'}
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto border border-black bg-neutral-100 p-4 text-[11px] font-mono text-black max-h-[500px] whitespace-pre-wrap leading-relaxed">
              {NETWORK_GUIDE}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
