# escape=`

FROM mcr.microsoft.com/powershell:nanoserver-1809 as downloader

ENV VERSION 20.10.15
ENV SHA256 045d618275c93bedd3bbca1fe12538f60400d3d8eb4a1510c596065fd9e5451f

SHELL ["pwsh", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreferences = 'SilentlyContinue';"]
RUN New-Item -ItemType Directory -Path C:\download; `
    Invoke-WebRequest `
      -Uri "https://download.docker.com/win/static/stable/x86_64/docker-${env:VERSION}.zip" `
      -Outfile C:\download\docker.zip; `
    if ($(Get-FileHash C:\download\docker.zip).Hash -ne ${env:SHA256}) `
    { `
      Write-Error "Error performing checksum."; `
      Exit 1; `
    }

FROM jenkins/inbound-agent:4.13-2-jdk8-nanoserver-1809

ENV PATH="${PATH};${ProgramFiles}\docker"

COPY entrypoint.ps1 C:/entrypoint.ps1
COPY --from=downloader C:/download/docker.zip C:/download/docker.zip
RUN Expand-Archive C:\download\docker.zip -DestinationPath $env:ProgramFiles; `
    Remove-Item @( `
      'C:\download\docker.zip', `
      ('{0}\docker\dockerd.exe' -f $env:ProgramFiles) `
    ) -Force

ENTRYPOINT ["pwsh.exe", "-f", "C:/entrypoint.ps1"]