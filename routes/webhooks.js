// routes/webhooks.js
import express from 'express';
import { getPostDetails } from '../services/database.js';
import { sendInstagramPrivateReply, sendInstagramPublicReply } from '../services/messenger.js';

const router = express.Router();
const notifications = [];

// Instagram Webhook
router.post('/instagram', async (req, res) => {
  res.sendStatus(200); // Respond immediately
  notifications.push(req.body); // Store the notification for processing

  try {
    for (const entry of req.body.entry) {
      ig_user_id = entry.id; 
      const commentData = entry.changes[0].value;
      if (commentData.parent_id) continue; // Ignore replies to other comments

      const commentText = commentData.text.toLowerCase();
      if (commentText.includes('link') || commentText.includes('price')) {
        const postId = commentData.media.id;
        const commentId = commentData.id;

        const links = await getPostDetails('instagram', postId);
        const amazonMessage = links.amazon ? `Amazon: ${links.amazon} \n` : '';
        const flipkartMessage = links.flipkart ? `Flipkart: ${links.flipkart}` : '';

        if (links) {
          const message = `Here are the links!\n` + amazonMessage + flipkartMessage;
          await sendInstagramPrivateReply(message, commentId, ig_user_id);
          await sendInstagramPublicReply("DM sent! Please follow to recieve in the Inbox or check your message requests if you're not following our page :)", commentId);
        } else {
          console.log(`No links found in DB for Instagram post: ${postId}`);
        }
      }
    }
  } catch (error) {
    console.error('Error processing Instagram webhook:', error);
  }
});

router.get('/instagram', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});
router.get('/facebook',(req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

router.get('/notifications', (req, res) => {
  res.json(notifications);
});

// Add your /facebook webhook handler here later...

export default router;