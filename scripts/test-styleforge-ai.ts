import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // Adjust if different

async function testStyleForgeAI() {
    console.log('--- Starting StyleForge AI Tests ---');

    // 1. Test Fashion Advice
    console.log('\nTesting Scenario 1: Fashion Advice');
    try {
        const res1 = await axios.post(`${BASE_URL}/api/fashion-chat`, {
            messages: [{ role: 'user', content: 'What should I wear to a traditional Yoruba wedding in Lagos?' }]
        });
        console.log('Advice Response:', res1.data.chat.messages.at(-1).content);
    } catch (err: any) {
        console.error('Advice Error:', err.response?.data || err.message);
    }

    // 2. Test Product Search (via tool calling simulation)
    console.log('\nTesting Scenario 2: Product Search');
    try {
        const res2 = await axios.post(`${BASE_URL}/api/fashion-chat`, {
            messages: [{ role: 'user', content: 'Can you find me some blue senator wear for men?' }]
        });
        console.log('Search Response:', res2.data.chat.messages.at(-1).content);
    } catch (err: any) {
        console.error('Search Error:', err.response?.data || err.message);
    }

    // 3. Test Human Escalation
    console.log('\nTesting Scenario 3: Human Escalation');
    try {
        const res3 = await axios.post(`${BASE_URL}/api/fashion-chat`, {
            messages: [{ role: 'user', content: 'I want to speak to a human about a tailoring dispute.' }]
        });
        console.log('Escalation Response:', res3.data.chat.messages.at(-1).content);
        console.log('Handoff Flag:', res3.data.handoffRequired);
    } catch (err: any) {
        console.error('Escalation Error:', err.response?.data || err.message);
    }

    console.log('\n--- StyleForge AI Tests Completed ---');
}

// Note: Vision testing requires a real image URL or base64, usually done manually or with a local file.
// We'll skip automated vision test here but verify manually if possible.

testStyleForgeAI();
