
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function curlFetchTransactions(url: string, headers: any, body: any) {
    const scriptPath = 'scripts/fetchTransactions.sh'; // Path to your script file
    let command = `${scriptPath} "${url}"`; // Command to execute the script with text parameter
    command += ` "${headers['X-API-Interaction-ID']}" "${headers['Channel']}" "${headers['Branch-Number']}" "${headers['Teller-Number']}" "${headers['Terminal-Number']}" "${headers['Override-Flag']}" "${headers['Recovery-Flag']}" "${headers['HealthCheck']}" "${headers['HealthType']}" "${headers['X-IB-Client-Id']}" "${headers['X-IB-Client-Secret']}" "${headers['X-Client-Certificate']}"` //headers
    command += ` "${body['Account_Number']}" "${body['From_Date']}" "${body['To_Date']}"` //body

    const { stdout, stderr } = await execPromise(command);
    const response = JSON.parse(stdout);
    console.log('Response from Bank: ', response)
    return response
}

export async function curlRegisterComplaint(url: string, headers: any, body: any) {
    const scriptPath = 'scripts/registerComplaint.sh'; // Path to your script file
    let command = `${scriptPath} "${url}"`; // Command to execute the script with text parameter
    command += ` "${headers['X-API-Interaction-ID']}" "${headers['Channel']}" "${headers['Branch-Number']}" "${headers['Teller-Number']}" "${headers['Terminal-Number']}" "${headers['Override-Flag']}" "${headers['Recovery-Flag']}" "${headers['HealthCheck']}" "${headers['HealthType']}" "${headers['X-IB-Client-Id']}" "${headers['X-IB-Client-Secret']}" "${headers['X-Client-Certificate']}"` //headers
    command += ` "${body['Request_Date_and_Time']}" "${body['Customer_Account_Number']}" "${body['Customer_Mobile_Number']}" "${body['Customer_Cat_ID']}" "${body['Complaint_category']}" "${body['Complaint_category_type']}" "${body['Complaint_category_subtype']}" "${body['Amount']}" "${body['txn_Date']}" "${body['Complaint_detail']}"` //body

    const { stdout, stderr } = await execPromise(command);
    const response = JSON.parse(stdout);
    console.log('Response from Bank: ', response)
    return response
}