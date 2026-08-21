Option Explicit

Dim shell, fso, projectDir, dashboardUrl, halUrl, attempt
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

If WScript.Arguments.Count > 0 Then
  If LCase(WScript.Arguments(0)) = "--check" Then WScript.Quit 0
End If

projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
dashboardUrl = "http://localhost:8766/app.html"
halUrl = "http://127.0.0.1:9142/"

' Brad's brain is a SEPARATE local server. Without it the rail still opens and
' greets, but every real question answers "I can't reach HAL" - which reads as
' a bug rather than a missing service (Dave hit this 2026-08-21). Start it here
' so one launch gives a working Brad.
StartHal projectDir, halUrl

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

Sub StartHal(projectDir, targetUrl)
  Dim shellLocal
  If DashboardReady(targetUrl) Then Exit Sub
  Set shellLocal = CreateObject("WScript.Shell")
  ' pythonw = no console window, so no cmd.exe wrapper is needed - and a
  ' wrapper actively breaks this: cmd /c mangles a command line that starts
  ' with a quoted path, so HAL silently never started (caught 2026-08-21).
  shellLocal.Run """G:\Python311\pythonw.exe"" ""G:\Users\daveq\2nd Brain\hal.py"" app --dir """ & projectDir & """", 0, False
  Set shellLocal = Nothing
End Sub

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
