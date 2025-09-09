@echo off
cd "%~dp0"

echo === Initialisation du projet Git ===
git init

echo === Ajout des fichiers ===
git add .

echo === Premier commit ===
git commit -m "First commit - upload project stage aptiv"

echo === Renommer la branche en main ===
git branch -M main

echo === Lier avec GitHub ===
git remote add origin https://github.com/the-evilyn/project-stage-aptiv.git

echo === Envoi du projet sur GitHub ===
git push -u origin main

echo === Terminé avec succès ! ===
pause
