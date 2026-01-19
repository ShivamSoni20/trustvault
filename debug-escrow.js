
import { hexToCV, cvToValue, Cl } from '@stacks/transactions';
import axios from 'axios';

const API_BASE_URL = 'https://api.testnet.hiro.so';
const CONTRACT_ADDRESS = 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A';
const CONTRACT_NAME = 'usdcx-escrow';

async function testParsing() {
    console.log('Testing Escrow Parsing with Fixed Logic...\n');

    const response = await axios.post(
        `${API_BASE_URL}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-escrow`,
        {
            sender: CONTRACT_ADDRESS,
            arguments: [Cl.serialize(Cl.uint(0))],
        }
    );

    if (response.data.okay && response.data.result) {
        const cv = hexToCV(response.data.result);
        const parsed = cvToValue(cv);
        const tupleData = parsed.value;

        console.log('✅ Escrow #0 Data:');
        console.log('  Client:', tupleData.client.value);
        console.log('  Freelancer:', tupleData.freelancer.value);
        console.log('  Amount:', Number(tupleData.amount.value) / 1_000_000, 'USDCx');
        console.log('  Status:', tupleData.status.value);
        console.log('  Deadline:', tupleData.deadline.value);

        const metaValue = tupleData.metadata?.value;
        const metadata = typeof metaValue === 'string' ? metaValue : (metaValue?.value || null);
        console.log('  Metadata:', metadata);

        console.log('\n✅ Parsing successful!');
    }
}

testParsing().catch(console.error);
