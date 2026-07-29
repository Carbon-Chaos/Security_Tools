# GitHub Push Checklist

1. Create a new GitHub repository.
2. In the project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial release"
   git branch -M main
   git remote add origin https://github.com/<your-user>/<your-repo>.git
   git push -u origin main
   ```
3. Create a release tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. Update the install script URL in [linux-cli/install.sh](linux-cli/install.sh) to match your GitHub repo.
5. Share the install command:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/<your-user>/<your-repo>/main/linux-cli/install.sh | bash
   ```
