Option Explicit

Dim shell, fso, projectDir, dashboardUrl, attempt
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

If WScript.Arguments.Count > 0 Then
  If LCase(WScript.Arguments(0)) = "--check" Then WScript.Quit 0
End If

projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
dashboardUrl = "http://localhost:8766/app.html"

If DashboardReady(dashboardUrl) Then
  shell.Run dashboardUrl, 1, False
  WScript.Quit 0
End If

' Start the existing Node server without showing a terminal window.
shell.Run "cmd.exe /d /c cd /d """ & projectDir & """ && node serve.mjs", 0, False

For attempt = 1 To 30
  WScript.Sleep 500
  If DashboardReady(dashboardUrl) Then
    shell.Run dashboardUrl, 1, False
    WScript.Quit 0
  End If
Next

MsgBox "Cipher Marketing could not start." & vbCrLf & vbCrLf & _
  "Confirm that Node.js is installed, then try this launcher again.", _
  vbExclamation, "Cipher Marketing"
WScript.Quit 1

Function DashboardReady(targetUrl)
  On Error Resume Next
  Dim request
  Set request = CreateObject("MSXML2.ServerXMLHTTP.6.0")
  request.setTimeouts 500, 500, 1000, 1000
  request.open "GET", targetUrl, False
  request.send
  DashboardReady = (Err.Number = 0 And request.status >= 200 And request.status < 500)
  Set request = Nothing
  Err.Clear
  On Error GoTo 0
End Function
