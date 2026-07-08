@echo off
rem ============================================================
rem  Campaign-expert HAL for the CipherExam marketing dashboard.
rem
rem  Serves the local HAL console on http://127.0.0.1:9142 so the
rem  "TALK TO HAL" widget in the dashboard (site/app.html) can reach
rem  it. In this mode HAL reasons over THIS repo's campaign files
rem  (posts, strategy, brand voice) AND Dave's shared Second Brain.
rem
rem  Leave this window running while you use the dashboard.
rem ============================================================
if "%ANTHROPIC_API_KEY%"=="" echo [warn] ANTHROPIC_API_KEY is not set -- HAL will start, but campaign questions need it to reason over the files. Set it and re-run for full answers.
"G:\Python311\python.exe" "G:\Users\daveq\2nd Brain\hal.py" app --dir "%~dp0."
pause
