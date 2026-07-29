#define MyAppName "Cyber Lab Ops: Mission Control"
#ifndef AppVersion
  #define AppVersion "2.0.0"
#endif
#ifndef PayloadDir
  #error PayloadDir preprocessor define is required.
#endif
#ifndef OutputDir
  #error OutputDir preprocessor define is required.
#endif

[Setup]
AppId={{8A97A0A9-E9D1-4AA1-B443-6A67725A3DE4}}
AppName={#MyAppName}
AppVersion={#AppVersion}
AppPublisher=Carbon Chaos
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
UninstallDisplayIcon={app}\run-cyber-ops.cmd
OutputDir={#OutputDir}
OutputBaseFilename=CyberSecurityOpsSetup-{#AppVersion}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked
Name: "launchhub"; Description: "Open Mission Control after setup"; GroupDescription: "Post-install:"; Flags: checkedonce

[Files]
Source: "{#PayloadDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\run-cyber-ops.cmd"; WorkingDir: "{app}"
Name: "{autoprograms}\Gamified Hacking Lab Guide"; Filename: "{app}\Gamified_Hacking_Lab\README.md"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\run-cyber-ops.cmd"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\run-cyber-ops.cmd"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent; Tasks: launchhub
