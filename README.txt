RUTIK SYSTEM HUB v0.1
=====================

Files:
- index.html
- style.css
- app.js

Purpose:
A lightweight HTML/CSS/JavaScript Cloud Phone prototype for selecting and inspecting local package files and opening online download links.

Important limitations:
- This is a package-selection and inspection prototype, NOT a working native installer.
- A Cloud Phone web app cannot install apps into the IT9020 native OS unless the device exposes a supported installer/API bridge.
- JAR/JAD detection here is only a basic format check. IT9020 Java runtime and sideloading support are not yet confirmed.
- PAC files are firmware packages, not application installers. Never flash a PAC from this app.
- The app intentionally keeps INSTALL TO PHONE disabled to avoid falsely claiming installation.

How to run:
Open index.html in the Cloud Phone browser/app environment, or host the folder on a web server and open index.html.
If the Cloud Phone environment does not expose local storage to the file picker, use its supported file-access mechanism if available.

Firmware reference used during research:
itel IT9020 / UMS9117 / LS2002
India PAC filename: UMS9117_LS2002_it9020_QQVGA_LANG13_IN.pac

The PAC is not bundled in this project. It is not needed for the UI prototype and including firmware in an app package would be unnecessary and potentially risky.
