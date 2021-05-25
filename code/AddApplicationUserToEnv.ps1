Install-Module -Name AzureAD -AllowClobber -Scope CurrentUser
Install-Module -Name Microsoft.Xrm.OnlineManagementAPI -MaximumVersion 1.2.0.1 -Scope CurrentUser
Install-Module -Name Microsoft.Xrm.Data.Powershell -Scope CurrentUser  -AllowClobber

$appId = [Guid]"61bebcd1-d430-4a77-a77e-ed58df823453"


# Create the Application User
Connect-CrmOnlineDiscovery -InteractiveMode
$userid= New-CrmRecord -EntityLogicalName systemuser -Fields @{
  "applicationid"=$appId;
  "businessunitid"=(New-CrmEntityReference -Id (Invoke-CrmWhoAmI).BusinessUnitId -EntityLogicalName systemuser)
}
Write-Host "Application User Created with ID: $userid"


# Add the Administrator Role

$users = Get-CrmRecords -EntityLogicalName systemuser -FilterAttribute systemuserid -FilterOperator eq -FilterValue $userid -Fields "businessunitid"

$SecurityRoleName = "System Administrator"
$systemUserId = $users.CrmRecords[0].systemuserid
$businessUnitId = $users.CrmRecords[0].businessunitid_Property.Value.Id


$fetch = @"
<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false" no-lock="true">
  <entity name="role">
    <attribute name="roleid" />
    <filter type="and">
      <condition attribute="name" operator="eq" value="{0}" />
      <condition attribute="businessunitid" operator="eq" value="{1}" />
    </filter>
  </entity>
</fetch>
"@

    $fetch = $fetch -F $SecurityRoleName, $businessUnitId
    $securityRole = Get-CrmRecordsByFetch -Fetch $fetch


    If($securityRole.CrmRecords.Count -eq 0)
    {
        Write-Error "SecurityRole $SecurityRoleName does not exist"
        return
    }
    Else
    {
        Write-Output "Assign $SecurityRoleName role to user"
        $securityRoleId = $securityRole.CrmRecords[0].roleid.Guid
        Add-CrmSecurityRoleToUser -UserId $systemUserId -SecurityRoleId $securityRoleId
    }    

