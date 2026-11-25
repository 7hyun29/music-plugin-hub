# 음악 플러그인 스캔 (Windows)
# 실행: PowerShell에서  powershell -ExecutionPolicy Bypass -File .\scan_windows.ps1
# 결과: 바탕화면\plugins_windows.csv

$out  = Join-Path ([Environment]::GetFolderPath('Desktop')) 'plugins_windows.csv'
$rows = New-Object System.Collections.Generic.List[object]

$targets = @(
    @{ Fmt = 'VST3'; Ext = '*.vst3';       Path = "$env:CommonProgramFiles\VST3" },
    @{ Fmt = 'VST2'; Ext = '*.dll';        Path = "$env:ProgramFiles\VSTPlugins" },
    @{ Fmt = 'VST2'; Ext = '*.dll';        Path = "$env:ProgramFiles\Steinberg\VSTPlugins" },
    @{ Fmt = 'VST2'; Ext = '*.dll';        Path = "$env:CommonProgramFiles\VST2" },
    @{ Fmt = 'VST2'; Ext = '*.dll';        Path = "$env:CommonProgramFiles\Steinberg\VST2" },
    @{ Fmt = 'AAX';  Ext = '*.aaxplugin';  Path = "$env:CommonProgramFiles\Avid\Audio\Plug-Ins" }
)

foreach ($t in $targets) {
    if (-not (Test-Path $t.Path)) { continue }
    Get-ChildItem -Path $t.Path -Filter $t.Ext -Recurse -ErrorAction SilentlyContinue |
        # 번들(.vst3/.aaxplugin 폴더) 안쪽 파일은 건너뛰어 중복 방지
        Where-Object { $_.FullName -notmatch '\.(vst3|aaxplugin)\\.+' } |
        ForEach-Object {
            $bin = $_
            if ($_.PSIsContainer) {
                $inner = Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue |
                         Where-Object { $_.Extension -in '.vst3', '.aaxplugin', '.dll' } |
                         Select-Object -First 1
                if ($inner) { $bin = $inner }
            }
            $vi = $null
            if (-not $bin.PSIsContainer) { $vi = $bin.VersionInfo }
            $rows.Add([pscustomobject]@{
                name    = [IO.Path]::GetFileNameWithoutExtension($_.Name)
                format  = $t.Fmt
                version = if ($vi) { $vi.ProductVersion } else { '' }
                vendor  = if ($vi) { $vi.CompanyName } else { '' }
                path    = $_.FullName
            })
        }
}

# Native Instruments 제품/라이브러리 (Kontakt 라이브러리 포함)
foreach ($root in 'HKLM:\SOFTWARE\Native Instruments', 'HKLM:\SOFTWARE\WOW6432Node\Native Instruments') {
    if (-not (Test-Path $root)) { continue }
    Get-ChildItem $root -ErrorAction SilentlyContinue | ForEach-Object {
        $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
        $rows.Add([pscustomobject]@{
            name    = $_.PSChildName
            format  = 'NI'
            version = $p.Version
            vendor  = 'Native Instruments'
            path    = if ($p.ContentDir) { $p.ContentDir } elseif ($p.InstallDir) { $p.InstallDir } else { '' }
        })
    }
}

$rows | Sort-Object format, name -Unique | Export-Csv -Path $out -NoTypeInformation -Encoding UTF8
Write-Host "완료: $($rows.Count)개 -> $out"
