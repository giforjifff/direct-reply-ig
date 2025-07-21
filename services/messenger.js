// services/messenger.js
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function apiRequest(is_privatemessage, platform, endpoint, method = 'POST', body = {}) {
  const url = `https://graph.${platform}.com/v23.0/${endpoint}`;
  const head = {
    'Content-Type': 'application/json',
  }

  if (is_privatemessage === true) {
    head['Authorization'] = `Bearer ${PAGE_ACCESS_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: head,
      body: JSON.stringify(body)

    });
    const data = await response.json();
    if(data.error) throw new Error(JSON.stringify(data.error));
    console.log(`API call to ${endpoint} successful.`);
    return data;
  } catch (error) {
    console.error(`Error in API call to ${url}:`, error);
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

  return apiRequest(true, 'instagram', endpoint, 'POST', body);
}

export async function sendInstagramPublicReply(reply, commentId) {
  const endpoint = `${commentId}/replies`;
  const body = {
    message: reply
  };
  return apiRequest(false, 'instagram', endpoint, 'POST', body);
}