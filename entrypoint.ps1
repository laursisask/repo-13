if ($env:DOCKER_CONFIG_CONTENTS -ne $null) {
    New-Item $env:USERPROFILE\.docker -ItemType Directory | Out-Null
    $env:DOCKER_CONFIG_CONTENTS | Out-File $env:USERPROFILE\.docker\config.json
} else {
    Write-Output "The DOCKER_CONFIG_CONTENTS variable is not defined. Not creating a Docker config.json file."
}

pwsh.exe -f C:\ProgramData\Jenkins\jenkins-agent.ps1 $args