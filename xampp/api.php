<?php
/**
 * Kanu G. Agabi & Associates - Case File Inventory and Tracking System
 * Central CRUD and Synchronization API
 * 
 * Target Location:
 * C:\xampp\htdocs\LawFirmInventory\api.php
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
?>
