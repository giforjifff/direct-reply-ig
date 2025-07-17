// services/messenger.js
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function apiRequest(platform, endpoint, method = 'POST', body = {}) {
  const url = `https://graph.${platform}.com/v23.0/${endpoint}`;
  body.access_token = PAGE_ACCESS_TOKEN;
  
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAGE_ACCESS_TOKEN}` 
       },
      body: JSON.stringify(body)

    });
    const data = await response.json();
    if(data.error) throw new Error(JSON.stringify(data.error));
    console.log(`API call to ${endpoint} successful.`);
    return data;
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
  }
}

export async function sendInstagramPrivateReply(message, commentId, ig_user_id) {
  const endpoint = `${ig_user_id}/messages`;

  // CORRECT: Building the new request body structure
  const body = {
    recipient: {
      comment_id: commentId
    },
    message: {
      text: message
    }
  };

  return apiRequest('instagram', endpoint, 'POST', body);
}

export async function sendInstagramPublicReply(message, commentId) {
  const body = {
    message: message
  };
  return apiRequest('instagram',`${commentId}/replies`, 'POST', body);
}