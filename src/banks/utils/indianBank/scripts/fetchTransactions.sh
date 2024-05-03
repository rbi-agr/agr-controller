url=$1
apiInteractionId=$2
channel=$3
branchNumber=$4
tellerNumber=$5
terminalNumber=$6
overrideFlag=$7
recoveryFlag=$8
healthCheck=$9
healthType=$10
clientId=$11
clientSecret=$12
clientCertificate=$13
accountNumber=$14
fromDate=$15
toDate=$16
# Making curl request and capturing output
response=$(curl -v -k -X POST \
  "'"$url"'" \
  -H 'Content-Type: application/json' \
  -H 'X-API-Interaction-ID: "'"$apiInteractionId"'"' \
  -H 'Channel: "'"$channel"'"' \
  -H 'Branch-Number: "'"$branchNumber"'"' \
  -H 'Teller-Number: "'"$tellerNumber"'"' \
  -H 'Terminal-Number: "'"$terminalNumber"'"' \
  -H 'Override-Flag: "'"$overrideFlag"'"' \
  -H 'Recovery-Flag: "'"$recoveryFlag"'"' \
  -H 'HealthCheck: "'"$healthCheck"'"' \
  -H 'HealthType: "'"$healthType"'"' \
  -H 'X-IB-Client-Id: "'"$clientId"'"' \
  -H 'X-IB-Client-Secret: "'"$clientSecret"'"' \
  -H 'X-Client-Certificate: "'"$clientCertificate"'"' \
  -d '{
    "Account_Number": "'"$accountNumber"'",
    "From_Date": "'"$fromDate"'",
    "To_Date": "'"$toDate"'"
  }')
# Returning the response
echo "$response"