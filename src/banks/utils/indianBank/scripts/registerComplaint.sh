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
currentDateTime=$14
accountNumber=$15
mobileNumber=$16
complaintCategoryId=$17
complaintCategory=$18
complaintCategoryType=$19
complaintCategorySubtype=$20
amount=$21
transactionDateInFormat=$22
complaintDetails=$23
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
    "CGRSRegistration_Request": {
        "Body": {
            "Payload": {
                "data": {
                    "Request_Date_and_Time": "'"$currentDateTime"'",
                    "Customer_Account_Number": "'"$accountNumber"'",
                    "Customer_Mobile_Number": "'"$mobileNumber"'",
                    "Customer_Cat_ID": "'"$complaintCategoryId"'",
                    "Complaint_category": "'"$complaintCategory"'",
                    "Complaint_category_type": "'"$complaintCategoryType"'",
                    "Complaint_category_subtype": "'"$complaintCategorySubtype"'",
                    "Amount": "'"$amount"'",
                    "txn_Date": "'"$transactionDateInFormat"'",
                    "Complaint_detail": "'"$complaintDetails"'"
                }
            }
        }
    }
}')
# Returning the response
echo "$response"