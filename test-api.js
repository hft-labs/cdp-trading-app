async function testAPI() {
    try {
        console.log('Testing transactions-parsed API...');
        
        // Use the user's actual address
        const address = '0x4F05d367085Bc7196dC90F5f02b0f7996e8Cc136';
        const url = `http://localhost:3000/api/transactions-parsed?address=${address}&limit=10`;
        
        console.log('URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('\n=== API RESPONSE ===');
            console.log(`Total transactions: ${data.total}`);
            console.log(`Parsed: ${data.parsed}`);
            console.log(`Failed: ${data.failed}`);
            console.log(`Source: ${data.source}`);
            
            console.log('\n=== BREAKDOWN ===');
            console.log(`Swaps: ${data.breakdown.swaps}`);
            console.log(`ERC20 transfers: ${data.breakdown.erc20_transfers}`);
            console.log(`Native transfers: ${data.breakdown.native_transfers}`);
            console.log(`Unknown: ${data.breakdown.unknown}`);
            
            console.log('\n=== TRANSACTIONS ===');
            data.transactions.forEach((tx, index) => {
                console.log(`\n${index + 1}. Transaction Hash: ${tx.transactionHash}`);
                console.log(`   Type: ${tx.type}`);
                console.log(`   Direction: ${tx.direction}`);
                console.log(`   Description: ${tx.description}`);
                console.log(`   Amount: ${tx.formattedAmount} ${tx.tokenSymbol}`);
                console.log(`   From: ${tx.from}`);
                console.log(`   To: ${tx.to}`);
                console.log(`   Block: ${tx.blockNumber}`);
                console.log(`   Timestamp: ${tx.blockTimestamp}`);
            });
            
            // Check for duplicates
            const hashes = data.transactions?.map(tx => tx.transactionHash || tx.hash) || [];
            const uniqueHashes = [...new Set(hashes)];
            
            console.log('\n=== DUPLICATE CHECK ===');
            console.log(`Total transactions: ${data.transactions?.length || 0}`);
            console.log(`Unique hashes: ${uniqueHashes.length}`);
            
            if (hashes.length !== uniqueHashes.length) {
                console.log('❌ DUPLICATES FOUND!');
                console.log('Duplicate hashes:', hashes.filter((hash, index) => hashes.indexOf(hash) !== index));
            } else {
                console.log('✅ No duplicates found');
            }
            
            // Check descriptions
            console.log('\n=== DESCRIPTION CHECK ===');
            const hasCorrectDescriptions = data.transactions.every(tx => 
                tx.description && (tx.description.includes('Received') || tx.description.includes('Sent'))
            );
            
            if (hasCorrectDescriptions) {
                console.log('✅ All transactions have proper descriptions');
            } else {
                console.log('❌ Some transactions missing proper descriptions');
            }
            
        } else {
            const errorText = await response.text();
            console.log('Error response:', errorText);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Mock data for testing frontend (keeping for reference)
const mockTransactions = [
    {
        transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        blockNumber: "12345678",
        gasUsed: "21000",
        blockTimestamp: "1703123456",
        type: "native_transfer",
        tokenSymbol: "ETH",
        tokenName: "Ethereum",
        from: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        to: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
        amount: "1000000000000000000", // 1 ETH
        formattedAmount: "1.000000",
        direction: "outgoing",
        description: "Sent 1.000000 ETH"
    },
    {
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        blockNumber: "12345679",
        gasUsed: "21000",
        blockTimestamp: "1703123457",
        type: "native_transfer",
        tokenSymbol: "ETH",
        tokenName: "Ethereum",
        from: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
        to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        amount: "500000000000000000", // 0.5 ETH
        formattedAmount: "0.500000",
        direction: "incoming",
        description: "Received 0.500000 ETH"
    }
];

// Run the test
testAPI(); 