' =========================================================================
' Kanu G. Agabi & Associates - Case File Inventory and Tracking System
' Silent Desktop Launcher (Runs with zero command console popup)
' =========================================================================

Set WshShell = CreateObject("WScript.Shell")
AppUrl = "http://localhost:3000"

' Attempt to launch Edge in App Mode (Dedicated Desktop Window)
EdgePath64 = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
EdgePath86 = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
Chrome64   = "C:\Program Files\Google\Chrome\Application\chrome.exe"
Chrome86   = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

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
