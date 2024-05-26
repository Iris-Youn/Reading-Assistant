document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('sendButton').addEventListener('click', sendMessage);
});

let userId;

function login() {
    userId = document.getElementById('userId').value;
    console.log('Login function called');
    if (userId) {
        console.log('User ID:', userId);
        document.getElementById('login').style.display = 'none';
        document.getElementById('chatbot').style.display = 'block';
    } else {
        console.log('No user ID entered');
        alert('Please enter your ID');
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput) {
        console.log('User Input:', userInput);
        try {
            const response = await fetchGPTResponse(userInput);
            console.log('Received response:', response);
            displayMessage(userInput, response);
            await logToGoogleSheets(userInput, response);
        } catch (error) {
            console.error('Error fetching GPT response or logging to Google Sheets:', error);
        }
    } else {
        console.log('No user input provided');
    }
}

function displayMessage(input, response) {
    const chatbox = document.getElementById('chatbox');
    const userMessage = document.createElement('div');
    userMessage.textContent = `You: ${input}`;
    
    const botMessage = document.createElement('div');
    botMessage.innerHTML = response.replace(/\n/g, '<br>');

    chatbox.appendChild(userMessage);
    chatbox.appendChild(botMessage);
    document.getElementById('userInput').value = '';
}

async function fetchGPTResponse(query) {
    const apiKey = 'sk-proj-I6yqTq67G8opn9EPR3IbT3BlbkFJBbARM46wnk4Ttv6lmiZJ'; // 실제 OpenAI API 키로 교체하세요.
    try {
        console.log('Fetching GPT response for query:', query);
        const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: `Translate the word "${query}" to Korean and provide an A1 level English definition with two example sentences.`,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('GPT Response:', data);

        if (!data.choices || data.choices.length === 0) {
            throw new Error('No choices returned from OpenAI API');
        }

        return data.choices[0].text.trim();
    } catch (error) {
        console.error('Error fetching GPT response:', error);
        throw error;
    }
}

async function logToGoogleSheets(input, response) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwVl2gzpoF_HNRLnD-TIb4DwLFIcz4N2OAItGgiPk23j7tigaBi6Uv2hfcZ6y27GRX5Mw/exec';
    const payload = {
        userId: userId,
        word: input,
        response: response
    };

    try {
        console.log('Logging to Google Sheets:', payload);
        const response = await fetch(scriptURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Google Sheets Logging Result:', result);
    } catch (error) {
        console.error('Error logging to Google Sheets:', error);
        throw error;
    }
}
