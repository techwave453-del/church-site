@echo off
cd /d c:\Users\DENNIE\Desktop\dunamis-church-landing-source
echo.
echo ===== Git Repository Status =====
git status
echo.
echo ===== Git Configuration =====
git config --list | findstr user
echo.
echo ===== Remote Configuration =====
git remote -v
echo.
echo ===== Attempting to push to GitHub =====
echo Please authenticate with your GitHub credentials when prompted.
echo You can use:
echo   - GitHub Personal Access Token (recommended)
echo   - SSH key (if configured)
echo   - Username/Password (if not using 2FA)
echo.
git push -u origin main
echo.
echo Push complete! Check the output above for success/error messages.
pause
