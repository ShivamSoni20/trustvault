
import { hexToCV, cvToValue, Cl } from '@stacks/transactions';
import axios from 'axios';

const API_BASE_URL = 'https://api.testnet.hiro.so';
const CONTRACT_ADDRESS = 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A';
const CONTRACT_NAME = 'usdcx-escrow';

async function testTotalEscrows() {
    console.log('Testing get-total-escrows...\n');

    const response = await axios.post(
        `${API_BASE_URL}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-total-escrows`,
        {
            sender: CONTRACT_ADDRESS,
            arguments: [],
        }
    );

    if (response.data.okay && response.data.result) {
        const cv = hexToCV(response.data.result);
        const parsed = cvToValue(cv);

        console.log('Parsed Result:', parsed);
        console.log('Value type:', typeof parsed);

        if (typeof parsed === 'object' && parsed !== null) {
            console.log('Parsed.value:', parsed.value);
            console.log('Parsed.type:', parsed.type);
        }

        const value = typeof parsed === 'bigint' ? parsed : (parsed.value !== undefined ? parsed.value : parsed);
        console.log('Determined Value:', value);
        console.log('Determined Value Number:', Number(value));
    } else {
        console.log('Response not okay:', response.data);
    }
}

testTotalEscrows().catch(console.error);
