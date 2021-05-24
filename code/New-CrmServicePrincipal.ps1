<#
.SYNOPSIS
Add AAD Application and SPN to Dynamics365 AAD and configure Dynamics365 to accept the SPN as tenant admin user.

.DESCRIPTION
This script assists in creating and configuring the ServicePrincipal to be used with
the Power Platform Build Tools AzureDevOps task library.

Registers an Application object and corresponding ServicePrincipalName (SPN) with the Dynamics365 AAD instance.
This Application is then added as admin user to the Dynamics365 tenant itself.
NOTE: This script will prompt *TWICE* with the AAD login dialogs:
    1. time: to login as admin to the AAD instance associated with the Dynamics365 tenant
    2. time: to login as tenant admin to the Dynamics365 tenant itself

.INPUTS
None

.OUTPUTS
Object with D365 TenantId, ApplicationId and client secret (in clear text);
use this triple to configure the AzureDevOps ServiceConnection

.LINK
https://marketplace.visualstudio.com/items?itemName=microsoft-IsvExpTools.PowerPlatform-BuildTools

.EXAMPLE
> New-CrmServicePrincipal
> New-CrmServicePrincipal -TenantLocation "Europe"
> New-CrmServicePrincipal -AdminUrl "https://admin.services.crm4.dynamics.com"
#>
[CmdletBinding()]
Param(
    # gather permission requests but don't create any AppId nor ServicePrincipal
    [switch] $DryRun = $false,
    # other possible Azure environments, see: https://docs.microsoft.com/en-us/powershell/module/azuread/connect-azuread?view=azureadps-2.0#parameters
    [string] $AzureEnvironment = "AzureCloud",

    [ValidateSet(
        "UnitedStates",
        "Preview(UnitedStates)",
        "Europe",
        "EMEA",
        "Asia",
        "Australia",
        "Japan",
        "SouthAmerica",
        "India",
        "Canada",
        "UnitedKingdom",
        "France"
    )]
    [string] $TenantLocation = "UnitedStates",
    [string] $AdminUrl
)

$adminUrls = @{
    "UnitedStates"	            =	"https://admin.services.crm.dynamics.com"
    "Preview(UnitedStates)"	    =	"https://admin.services.crm9.dynamics.com"
    "Europe"		            =	"https://admin.services.crm4.dynamics.com"
    "EMEA"	                    =	"https://admin.services.crm4.dynamics.com"
    "Asia"	                    =	"https://admin.services.crm5.dynamics.com"
    "Australia"	                =	"https://admin.services.crm6.dynamics.com"
    "Japan"		                =	"https://admin.services.crm7.dynamics.com"
    "SouthAmerica"	            =	"https://admin.services.crm2.dynamics.com"
    "India"		                =	"https://admin.services.crm8.dynamics.com"
    "Canada"		            =	"https://admin.services.crm3.dynamics.com"
    "UnitedKingdom"	            =	"https://admin.services.crm11.dynamics.com"
    "France"		            =	"https://admin.services.crm12.dynamics.com"
    }

    function ensureModules {
    $dependencies = @(
        # the more general and modern "Az" a "AzureRM" do not have proper support to manage permissions
        @{ Name = "AzureAD"; Version = [Version]"2.0.2.76"; "InstallWith" = "Install-Module -Name AzureAD -AllowClobber -Scope CurrentUser" },
        @{ Name = "Microsoft.PowerApps.Administration.PowerShell"; Version = [Version]"2.0.108"; "InstallWith" = "Install-Module -Name Microsoft.PowerApps.Administration.PowerShell -AllowClobber -Scope CurrentUser"}
    )
    $missingDependencies = $false
    $dependencies | ForEach-Object -Process {
        $moduleName = $_.Name
        $deps = (Get-Module -ListAvailable -Name $moduleName `
            | Sort-Object -Descending -Property Version)
        if ($deps -eq $null) {
            Write-Error "Required module not installed; install from PowerShell prompt with: '$($_.InstallWith)'"
            $missingDependencies = $true
            return
        }
        $dep = $deps[0]
        if ($dep.Version -lt $_.Version) {
            Write-Error "Required module installed but does not meet minimal required version: found: $($dep.Version), required: >= $($_.Version); run: 'Update-Module '$($_.Name)'"
            $missingDependencies = $true
            return
        }
        Import-Module $moduleName
    }
    if ($missingDependencies) {
        throw "Missing required dependencies!"
    }
}

function connectAAD {
    Write-Host @"

Connecting to AzureAD: Please log in, using your Dynamics365 / Power Platform tenant ADMIN credentials:

"@
    try {
        Connect-AzureAD -AzureEnvironmentName $AzureEnvironment -ErrorAction Stop | Out-Null
    }
    catch {
        throw "Failed to login: $($_.Exception.Message)"
    }
    return Get-AzureADCurrentSessionInfo
}

function reconnectAAD {
    # for tenantID, see DirectoryID here: https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview
    try {
        $session = Get-AzureADCurrentSessionInfo -ErrorAction SilentlyContinue
        if ($session.Environment.Name -ne $AzureEnvironment) {
            Disconnect-AzureAd
            $session = connectAAD
        }
    }
    catch [Microsoft.Open.Azure.AD.CommonLibrary.AadNeedAuthenticationException] {
        $session = connectAAD
    }
    $tenantId = $session.TenantId
    Write-Host @"
Connected to AAD tenant: $($session.TenantDomain) ($($tenantId)) in $($session.Environment.Name)

"@
    return $tenantId
}

function addRequiredAccess {
    param(
        [System.Collections.Generic.List[Microsoft.Open.AzureAD.Model.RequiredResourceAccess]] $requestList,
        [Microsoft.Open.AzureAD.Model.ServicePrincipal[]] $spns,
        [string] $spnDisplayName,
        [string] $permissionName
    )
    Write-Host "  - requiredAccess for $spnDisplayName - $permissionName"
    $selectedSpns = $spns | Where-Object { $_.DisplayName -eq $spnDisplayName }

    # have to build the List<ResourceAccess> item by item since PS doesn't deal well with generic lists (which is the signature for .ResourceAccess)
    $selectedSpns | ForEach-Object -process {
        $spn = $_
        $accessList = New-Object -TypeName 'System.Collections.Generic.List[Microsoft.Open.AzureAD.Model.ResourceAccess]'
        ( $spn.OAuth2Permissions `
        | Where-Object { $_.Value -eq $permissionName } `
        | ForEach-Object -process {
            $acc = New-Object -TypeName 'Microsoft.Open.AzureAD.Model.ResourceAccess'
            $acc.Id = $_.Id
            $acc.Type = "Scope"
            $accessList.Add($acc)
        } )
        Write-Verbose "accessList: $accessList"

        # TODO: filter out the now-obsoleted SPN for CDS user_impersonation: id = 9f7cb6a3-2591-431e-b80d-385fce1f93aa (PowerApps Runtime), see once granted admin consent in SPN permissions
        $req  = New-Object -TypeName 'Microsoft.Open.AzureAD.Model.RequiredResourceAccess'
        $req.ResourceAppId = $spn.AppId
        $req.ResourceAccess = $accessList
        $requestList.Add($req)
    }
}

function calculateSecretKey {
    param (
        [int] $length = 32
    )
    $secret = [System.Byte[]]::new($length)
    $rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider

    # restrict to printable alpha-numeric characters
    $validCharSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    function getRandomChar {
        param (
            [uint32] $min = 0,
            [uint32] $max = $validCharSet.length - 1
        )
        $diff = $max - $min + 1
        [Byte[]] $bytes = 1..4
        $rng.getbytes($bytes)
        $number = [System.BitConverter]::ToUInt32(($bytes), 0)
        $index = [char] ($number % $diff + $min)
        return $validCharSet[$index]
    }
    for ($i = 0; $i -lt $length; $i++) {
        $secret[$i] = getRandomChar
    }
    return $secret
}

ensureModules
$ErrorActionPreference = "Stop"
$tenantId = reconnectAAD

$allSPN = Get-AzureADServicePrincipal -All $true

$requiredAccess = New-Object -TypeName 'System.Collections.Generic.List[Microsoft.Open.AzureAD.Model.RequiredResourceAccess]'

addRequiredAccess $requiredAccess $allSPN "Microsoft Graph" "User.Read"
addRequiredAccess $requiredAccess $allSPN "PowerApps-Advisor" "Analysis.All"
addRequiredAccess $requiredAccess $allSPN "Common Data Service" "user_impersonation"

$appBaseName = "$((Get-AzureADTenantDetail).VerifiedDomains.Name)-$(get-date -Format "yyyyMMdd-HHmmss")"
$spnDisplayName = "App-$($appBaseName)"

Write-Verbose "Creating AAD Application: '$spnDisplayName'..."
$appId = "<dryrun-no-app-created>"
$spnId = "<dryrun-no-spn-created>"
if (!$DryRun) {
    # https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals
    $app = New-AzureADApplication -DisplayName $spnDisplayName -PublicClient $true -ReplyUrls "urn:ietf:wg:oauth:2.0:oob" -RequiredResourceAccess $requiredAccess
    $appId = $app.AppId
}
Write-Host "Created AAD Application: '$spnDisplayName' with appID $appId (objectId: $($app.ObjectId)"

$secretText = [System.Text.Encoding]::UTF8.GetString((calculateSecretKey))

Write-Verbose "Creating Service Principal Name (SPN): '$spnDisplayName'..."
if (!$DryRun) {
    # display name of SPN must be same as for the App itself
    # https://docs.microsoft.com/en-us/powershell/module/azuread/new-azureadserviceprincipal?view=azureadps-2.0
    $spn = New-AzureADServicePrincipal -AccountEnabled $true -AppId $appId -AppRoleAssignmentRequired $true -DisplayName $spnDisplayName -Tags {WindowsAzureActiveDirectoryIntegratedApp}
    $spnId = $spn.ObjectId

    $spnKey = New-AzureADServicePrincipalPasswordCredential -ObjectId $spn.ObjectId -StartDate (get-date).AddHours(-1) -EndDate (get-date).AddYears(1) -Value $secretText
    Set-AzureADServicePrincipal -ObjectId $spn.ObjectId -PasswordCredentials @($spnKey)
}
Write-Host "Created SPN '$spnDisplayName' with objectId: $spnId"

Write-Host @"

Connecting to Dynamics365 CRM managment API and adding appID to Dynamics365 tenant:
    Please log in, using your Dynamics365 / Power Platform tenant ADMIN credentials:
"@

if (!$DryRun) {
    if ($PSBoundParameters.ContainsKey("AdminUrl")) {
        $adminApi = $AdminUrl
    } else {
        $adminApi = $adminUrls[$TenantLocation]
    }
    Write-Host "Admin Api is: $adminApi"

    Add-PowerAppsAccount -Endpoint "prod"
    $mgmtApp = New-PowerAppManagementApp -ApplicationId $appId
    Write-Host @"

Added appId $($appId) to D365 tenant ($($tenantId))

"@
}
$result = [PSCustomObject] @{
    TenantId = $tenantId;
    ApplicationId = $appId;
    ClientSecret = $secretText
}
Write-Output $result

# SIG # Begin signature block
# MIIjkQYJKoZIhvcNAQcCoIIjgjCCI34CAQExDzANBglghkgBZQMEAgEFADB5Bgor
# BgEEAYI3AgEEoGswaTA0BgorBgEEAYI3AgEeMCYCAwEAAAQQH8w7YFlLCE63JNLG
# KX7zUQIBAAIBAAIBAAIBAAIBADAxMA0GCWCGSAFlAwQCAQUABCD56k70AuRqMWgQ
# kgqQFPURVwheF2BZJMyAhZohhjHL8aCCDYEwggX/MIID56ADAgECAhMzAAABh3IX
# chVZQMcJAAAAAAGHMA0GCSqGSIb3DQEBCwUAMH4xCzAJBgNVBAYTAlVTMRMwEQYD
# VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25p
# bmcgUENBIDIwMTEwHhcNMjAwMzA0MTgzOTQ3WhcNMjEwMzAzMTgzOTQ3WjB0MQsw
# CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
# ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMR4wHAYDVQQDExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
# AQDOt8kLc7P3T7MKIhouYHewMFmnq8Ayu7FOhZCQabVwBp2VS4WyB2Qe4TQBT8aB
# znANDEPjHKNdPT8Xz5cNali6XHefS8i/WXtF0vSsP8NEv6mBHuA2p1fw2wB/F0dH
# sJ3GfZ5c0sPJjklsiYqPw59xJ54kM91IOgiO2OUzjNAljPibjCWfH7UzQ1TPHc4d
# weils8GEIrbBRb7IWwiObL12jWT4Yh71NQgvJ9Fn6+UhD9x2uk3dLj84vwt1NuFQ
# itKJxIV0fVsRNR3abQVOLqpDugbr0SzNL6o8xzOHL5OXiGGwg6ekiXA1/2XXY7yV
# Fc39tledDtZjSjNbex1zzwSXAgMBAAGjggF+MIIBejAfBgNVHSUEGDAWBgorBgEE
# AYI3TAgBBggrBgEFBQcDAzAdBgNVHQ4EFgQUhov4ZyO96axkJdMjpzu2zVXOJcsw
# UAYDVR0RBEkwR6RFMEMxKTAnBgNVBAsTIE1pY3Jvc29mdCBPcGVyYXRpb25zIFB1
# ZXJ0byBSaWNvMRYwFAYDVQQFEw0yMzAwMTIrNDU4Mzg1MB8GA1UdIwQYMBaAFEhu
# ZOVQBdOCqhc3NyK1bajKdQKVMFQGA1UdHwRNMEswSaBHoEWGQ2h0dHA6Ly93d3cu
# bWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY0NvZFNpZ1BDQTIwMTFfMjAxMS0w
# Ny0wOC5jcmwwYQYIKwYBBQUHAQEEVTBTMFEGCCsGAQUFBzAChkVodHRwOi8vd3d3
# Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01pY0NvZFNpZ1BDQTIwMTFfMjAx
# MS0wNy0wOC5jcnQwDAYDVR0TAQH/BAIwADANBgkqhkiG9w0BAQsFAAOCAgEAixmy
# S6E6vprWD9KFNIB9G5zyMuIjZAOuUJ1EK/Vlg6Fb3ZHXjjUwATKIcXbFuFC6Wr4K
# NrU4DY/sBVqmab5AC/je3bpUpjtxpEyqUqtPc30wEg/rO9vmKmqKoLPT37svc2NV
# BmGNl+85qO4fV/w7Cx7J0Bbqk19KcRNdjt6eKoTnTPHBHlVHQIHZpMxacbFOAkJr
# qAVkYZdz7ikNXTxV+GRb36tC4ByMNxE2DF7vFdvaiZP0CVZ5ByJ2gAhXMdK9+usx
# zVk913qKde1OAuWdv+rndqkAIm8fUlRnr4saSCg7cIbUwCCf116wUJ7EuJDg0vHe
# yhnCeHnBbyH3RZkHEi2ofmfgnFISJZDdMAeVZGVOh20Jp50XBzqokpPzeZ6zc1/g
# yILNyiVgE+RPkjnUQshd1f1PMgn3tns2Cz7bJiVUaqEO3n9qRFgy5JuLae6UweGf
# AeOo3dgLZxikKzYs3hDMaEtJq8IP71cX7QXe6lnMmXU/Hdfz2p897Zd+kU+vZvKI
# 3cwLfuVQgK2RZ2z+Kc3K3dRPz2rXycK5XCuRZmvGab/WbrZiC7wJQapgBodltMI5
# GMdFrBg9IeF7/rP4EqVQXeKtevTlZXjpuNhhjuR+2DMt/dWufjXpiW91bo3aH6Ea
# jOALXmoxgltCp1K7hrS6gmsvj94cLRf50QQ4U8Qwggd6MIIFYqADAgECAgphDpDS
# AAAAAAADMA0GCSqGSIb3DQEBCwUAMIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
# V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
# IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0
# ZSBBdXRob3JpdHkgMjAxMTAeFw0xMTA3MDgyMDU5MDlaFw0yNjA3MDgyMTA5MDla
# MH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
# ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMT
# H01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENBIDIwMTEwggIiMA0GCSqGSIb3DQEB
# AQUAA4ICDwAwggIKAoICAQCr8PpyEBwurdhuqoIQTTS68rZYIZ9CGypr6VpQqrgG
# OBoESbp/wwwe3TdrxhLYC/A4wpkGsMg51QEUMULTiQ15ZId+lGAkbK+eSZzpaF7S
# 35tTsgosw6/ZqSuuegmv15ZZymAaBelmdugyUiYSL+erCFDPs0S3XdjELgN1q2jz
# y23zOlyhFvRGuuA4ZKxuZDV4pqBjDy3TQJP4494HDdVceaVJKecNvqATd76UPe/7
# 4ytaEB9NViiienLgEjq3SV7Y7e1DkYPZe7J7hhvZPrGMXeiJT4Qa8qEvWeSQOy2u
# M1jFtz7+MtOzAz2xsq+SOH7SnYAs9U5WkSE1JcM5bmR/U7qcD60ZI4TL9LoDho33
# X/DQUr+MlIe8wCF0JV8YKLbMJyg4JZg5SjbPfLGSrhwjp6lm7GEfauEoSZ1fiOIl
# XdMhSz5SxLVXPyQD8NF6Wy/VI+NwXQ9RRnez+ADhvKwCgl/bwBWzvRvUVUvnOaEP
# 6SNJvBi4RHxF5MHDcnrgcuck379GmcXvwhxX24ON7E1JMKerjt/sW5+v/N2wZuLB
# l4F77dbtS+dJKacTKKanfWeA5opieF+yL4TXV5xcv3coKPHtbcMojyyPQDdPweGF
# RInECUzF1KVDL3SV9274eCBYLBNdYJWaPk8zhNqwiBfenk70lrC8RqBsmNLg1oiM
# CwIDAQABo4IB7TCCAekwEAYJKwYBBAGCNxUBBAMCAQAwHQYDVR0OBBYEFEhuZOVQ
# BdOCqhc3NyK1bajKdQKVMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1Ud
# DwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaAFHItOgIxkEO5FAVO
# 4eqnxzHRI4k0MFoGA1UdHwRTMFEwT6BNoEuGSWh0dHA6Ly9jcmwubWljcm9zb2Z0
# LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dDIwMTFfMjAxMV8wM18y
# Mi5jcmwwXgYIKwYBBQUHAQEEUjBQME4GCCsGAQUFBzAChkJodHRwOi8vd3d3Lm1p
# Y3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dDIwMTFfMjAxMV8wM18y
# Mi5jcnQwgZ8GA1UdIASBlzCBlDCBkQYJKwYBBAGCNy4DMIGDMD8GCCsGAQUFBwIB
# FjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2RvY3MvcHJpbWFyeWNw
# cy5odG0wQAYIKwYBBQUHAgIwNB4yIB0ATABlAGcAYQBsAF8AcABvAGwAaQBjAHkA
# XwBzAHQAYQB0AGUAbQBlAG4AdAAuIB0wDQYJKoZIhvcNAQELBQADggIBAGfyhqWY
# 4FR5Gi7T2HRnIpsLlhHhY5KZQpZ90nkMkMFlXy4sPvjDctFtg/6+P+gKyju/R6mj
# 82nbY78iNaWXXWWEkH2LRlBV2AySfNIaSxzzPEKLUtCw/WvjPgcuKZvmPRul1LUd
# d5Q54ulkyUQ9eHoj8xN9ppB0g430yyYCRirCihC7pKkFDJvtaPpoLpWgKj8qa1hJ
# Yx8JaW5amJbkg/TAj/NGK978O9C9Ne9uJa7lryft0N3zDq+ZKJeYTQ49C/IIidYf
# wzIY4vDFLc5bnrRJOQrGCsLGra7lstnbFYhRRVg4MnEnGn+x9Cf43iw6IGmYslmJ
# aG5vp7d0w0AFBqYBKig+gj8TTWYLwLNN9eGPfxxvFX1Fp3blQCplo8NdUmKGwx1j
# NpeG39rz+PIWoZon4c2ll9DuXWNB41sHnIc+BncG0QaxdR8UvmFhtfDcxhsEvt9B
# xw4o7t5lL+yX9qFcltgA1qFGvVnzl6UJS0gQmYAf0AApxbGbpT9Fdx41xtKiop96
# eiL6SJUfq/tHI4D1nvi/a7dLl+LrdXga7Oo3mXkYS//WsyNodeav+vyL6wuA6mk7
# r/ww7QRMjt/fdW1jkT3RnVZOT7+AVyKheBEyIXrvQQqxP/uozKRdwaGIm1dxVk5I
# RcBCyZt2WwqASGv9eZ/BvW1taslScxMNelDNMYIVZjCCFWICAQEwgZUwfjELMAkG
# A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
# HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9z
# b2Z0IENvZGUgU2lnbmluZyBQQ0EgMjAxMQITMwAAAYdyF3IVWUDHCQAAAAABhzAN
# BglghkgBZQMEAgEFAKCBoDAZBgkqhkiG9w0BCQMxDAYKKwYBBAGCNwIBBDAcBgor
# BgEEAYI3AgELMQ4wDAYKKwYBBAGCNwIBFTAvBgkqhkiG9w0BCQQxIgQgy8f1zqNw
# FJkPbnwjfCa/gupQ1V69YCpldQK54kczV8cwNAYKKwYBBAGCNwIBDDEmMCSgEoAQ
# AFQAZQBzAHQAUwBpAGcAbqEOgAxodHRwOi8vdGVzdCAwDQYJKoZIhvcNAQEBBQAE
# ggEAq6sUUORQXTB1PG4vqBeHm2sw9TxUKFbF2vmXq+H8D10X79gwO/rK5Tp4dXPD
# fvmZKIYYB3/uFYeyHq8pc8d/GEfWRFzxtt76nNsvnnKQ21cFynVxMAbNGWIusi10
# HPnqm2bwkCbhh8yvINMbbT9oDcNMoDaFB3G7308LTRWgHcmqbTXSfV8IfFn7i+dB
# LgS4+QK4TDSaAa/2Ze37rcRxcBqIo+N8zWYgt/8olOvgSkkBckpfOr+94AMAHCdZ
# 17dbLTdxozTyTxDv6/G0UWuUcKWnuzEGUoAAzZDOkQVleFsZhTv79TVRXZ1QXtYc
# /JKvUj0FgJePIf7yfWDChX3iC6GCEv4wghL6BgorBgEEAYI3AwMBMYIS6jCCEuYG
# CSqGSIb3DQEHAqCCEtcwghLTAgEDMQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG
# 9w0BCRABBKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0GCWCGSAFlAwQC
# AQUABCBQyET+IcQ/PkveC+ggUr2F6Ge2n3L5vRt4hpEokB7KmgIGYCWpof6xGBMy
# MDIxMDIxNjIzMDAyMi42NjZaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQGEwJVUzET
# MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
# TWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJlbGFu
# ZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkQw
# ODItNEJGRC1FRUJBMSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
# aWNloIIOTTCCBPkwggPhoAMCAQICEzMAAAFBr39Sl1zy3EUAAAAAAUEwDQYJKoZI
# hvcNAQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
# BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEm
# MCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcNMjAxMDE1
# MTcyODI3WhcNMjIwMTEyMTcyODI3WjCB0jELMAkGA1UEBhMCVVMxEzARBgNVBAgT
# Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
# dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0
# aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpEMDgyLTRCRkQt
# RUVCQTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCCASIw
# DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAPIqy6i9vHWpfjyVJlCTsL2J/7Dg
# hM0M2co/eF2xT7UYQ4T42oL7yjr9RoDKDrl75KTN7jOROu78jgj8aoUwM6uwJN85
# BF1wb+yaDPF5tMeVHJwJKVIhKNHsnEZem52CAdypWVt7s+CXNr9hVdCghpC676ny
# j/Ff4toVcjfOeDno1qcfMBlGszOAmFFaMHIBA3O+jmPl2uFtuwwmSZtn/aJeAY0i
# /m9i/0/J/yxBpJ2lMcEkEzdS0ArfrgQwgEnelUEeQiyyVbejAS9FtTZWlsRACcJS
# HcgZ0tYoS70YNY3PylGXtLERXQ934Sq4z2nN4aMtNOxb6+hqNFieKa9qyXUCAwEA
# AaOCARswggEXMB0GA1UdDgQWBBQtKD8sbi6Q/UVwa/XPDTtBBRLGxDAfBgNVHSME
# GDAWgBTVYzpcijGQ80N7fEYbxTNoWoVtVTBWBgNVHR8ETzBNMEugSaBHhkVodHRw
# Oi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWNUaW1TdGFQ
# Q0FfMjAxMC0wNy0wMS5jcmwwWgYIKwYBBQUHAQEETjBMMEoGCCsGAQUFBzAChj5o
# dHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1RpbVN0YVBDQV8y
# MDEwLTA3LTAxLmNydDAMBgNVHRMBAf8EAjAAMBMGA1UdJQQMMAoGCCsGAQUFBwMI
# MA0GCSqGSIb3DQEBCwUAA4IBAQBSet8ifdgoagoKXsQ+PKJL4hrguIpDbL5sJQkn
# rdbBabyRMyyQfHExeM+KkE8/ALELXHsOpgFZkAmA7vX+XntdcV49S8B2LGRp0rPz
# n0bpdVSpmOdTkKaryuTvwreH7NCG5c6PHsjiycoE5Pe2l1QOFM6vBm5S+y0OV4sA
# GOOOjDgC5zVxaPyqvbb84qcGNWHEZ/55TEPm/djoiy5h1TItsAFDkYihb2gH2Fo4
# UHftqhyzLHaTZbsAW1nuxReQAbA6NB0TjFsgoMXS0N76q9wzEh92ViooqxbL1iZn
# IX2TxkTm8KrM70lzxZjwWfaPnq/uFKC1fudBlp50JMux1YC5MIIGcTCCBFmgAwIB
# AgIKYQmBKgAAAAAAAjANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMxEzAR
# BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
# Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2Vy
# dGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMTAwNzAxMjEzNjU1WhcNMjUwNzAx
# MjE0NjU1WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
# A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
# JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCCASIwDQYJKoZI
# hvcNAQEBBQADggEPADCCAQoCggEBAKkdDbx3EYo6IOz8E5f1+n9plGt0VBDVpQoA
# goX77XxoSyxfxcPlYcJ2tz5mK1vwFVMnBDEfQRsalR3OCROOfGEwWbEwRA/xYIiE
# VEMM1024OAizQt2TrNZzMFcmgqNFDdDq9UeBzb8kYDJYYEbyWEeGMoQedGFnkV+B
# VLHPk0ySwcSmXdFhE24oxhr5hoC732H8RsEnHSRnEnIaIYqvS2SJUGKxXf13Hz3w
# V3WsvYpCTUBR0Q+cBj5nf/VmwAOWRH7v0Ev9buWayrGo8noqCjHw2k4GkbaICDXo
# eByw6ZnNPOcvRLqn9NxkvaQBwSAJk3jN/LzAyURdXhacAQVPIk0CAwEAAaOCAeYw
# ggHiMBAGCSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBTVYzpcijGQ80N7fEYbxTNo
# WoVtVTAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYD
# VR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2UkFvXzpoYxDBW
# BgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
# bC9wcm9kdWN0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYIKwYBBQUH
# AQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
# L2NlcnRzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNydDCBoAYDVR0gAQH/BIGV
# MIGSMIGPBgkrBgEEAYI3LgMwgYEwPQYIKwYBBQUHAgEWMWh0dHA6Ly93d3cubWlj
# cm9zb2Z0LmNvbS9QS0kvZG9jcy9DUFMvZGVmYXVsdC5odG0wQAYIKwYBBQUHAgIw
# NB4yIB0ATABlAGcAYQBsAF8AUABvAGwAaQBjAHkAXwBTAHQAYQB0AGUAbQBlAG4A
# dAAuIB0wDQYJKoZIhvcNAQELBQADggIBAAfmiFEN4sbgmD+BcQM9naOhIW+z66bM
# 9TG+zwXiqf76V20ZMLPCxWbJat/15/B4vceoniXj+bzta1RXCCtRgkQS+7lTjMz0
# YBKKdsxAQEGb3FwX/1z5Xhc1mCRWS3TvQhDIr79/xn/yN31aPxzymXlKkVIArzgP
# F/UveYFl2am1a+THzvbKegBvSzBEJCI8z+0DpZaPWSm8tv0E4XCfMkon/VWvL/62
# 5Y4zu2JfmttXQOnxzplmkIz/amJ/3cVKC5Em4jnsGUpxY517IW3DnKOiPPp/fZZq
# kHimbdLhnPkd/DjYlPTGpQqWhqS9nhquBEKDuLWAmyI4ILUl5WTs9/S/fmNZJQ96
# LjlXdqJxqgaKD4kWumGnEcua2A5HmoDF0M2n0O99g/DhO3EJ3110mCIIYdqwUB5v
# vfHhAN/nMQekkzr3ZUd46PioSKv33nJ+YWtvd6mBy6cJrDm77MbL2IK0cs0d9LiF
# AR6A+xuJKlQ5slvayA1VmXqHczsI5pgt6o3gMy4SKfXAL1QnIffIrE7aKLixqduW
# sqdCosnPGUFN4Ib5KpqjEWYw07t0MkvfY3v1mYovG8chr1m1rtxEPJdQcdeh0sVV
# 42neV8HR3jDA/czmTfsNv11P6Z0eGTgvvM9YBS7vDaBQNdrvCScc1bN+NR4Iuto2
# 29Nfj950iEkSoYIC1zCCAkACAQEwggEAoYHYpIHVMIHSMQswCQYDVQQGEwJVUzET
# MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
# TWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJlbGFu
# ZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkQw
# ODItNEJGRC1FRUJBMSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
# aWNloiMKAQEwBwYFKw4DAhoDFQCq5b8ptQqriKEHK853C75A9VqVA6CBgzCBgKR+
# MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
# ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
# HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA
# 49a/FTAiGA8yMDIxMDIxNzA2MDA1M1oYDzIwMjEwMjE4MDYwMDUzWjB3MD0GCisG
# AQQBhFkKBAExLzAtMAoCBQDj1r8VAgEAMAoCAQACAicXAgH/MAcCAQACAhE4MAoC
# BQDj2BCVAgEAMDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKgCjAIAgEA
# AgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAT1Q9gf1RCm0CUWyc
# sMtm9Rxwtu3B7Dx8Ve7B21pSnm42JQBabaQnjAAD05Kz9P6pxYmsbJJdOqrAiHbm
# VE+9hDM8uatOeM3CIS3J7FT9AFT25v7aJND6ptVd/XHmTutb7goMt5g2YLyFiZyR
# 1tTXxvkzjSrWh3r20OwIsmsRLOIxggMNMIIDCQIBATCBkzB8MQswCQYDVQQGEwJV
# UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
# ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
# ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAUGvf1KXXPLcRQAAAAABQTANBglghkgBZQME
# AgEFAKCCAUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJ
# BDEiBCDR7IYQb4DufVcEuVWwMinwO6uN4ksejx5d/s4pjh2a8zCB+gYLKoZIhvcN
# AQkQAi8xgeowgecwgeQwgb0EIFE/ATyM6nN0nnB0TyygbVtLzjp0/u/IWlqPl3MV
# Xq3eMIGYMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
# EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
# bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAFB
# r39Sl1zy3EUAAAAAAUEwIgQgMbU6LbYAegJ/+/1cKcVLRvoDaG4cvesNNWRtFQEB
# UzYwDQYJKoZIhvcNAQELBQAEggEAMAJ6K3n5RsOmsk83++s35VoH77MpJVpXX55a
# ZiLh3quGLt+/Hm4gl5xUODwfL2nXEPiOgf09v2n+EfIvATrHJZ4CucPvwaypqWzI
# XerXN+Y4AZqYIS4kns8PI1EW4lIdCoAoGZK6mNhlu06jn+s2kcFd8XJCCh24JSJ4
# /CBbvCZg/bvZdpenDXydiyXBab88xdeOgXy9iwKRXWkEpcMRcHmJMXeqm9MXcHRt
# nC8y+v61JwZTZMbK852zIm4XFkzC9RW7GHveArDrDkqII0qhimqJDSiNsUltwzee
# q7Oae8Rg38neX1lAj+Egw2yD2rmVteJ0v6W9bij3NmZMD8ZtFA==
# SIG # End signature block
