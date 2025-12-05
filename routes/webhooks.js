// routes/webhooks.js
import express from 'express';
import { getPostDetails } from '../services/database.js';
import { sendInstagramPrivateReply, sendInstagramPublicReply } from '../services/messenger.js';

const router = express.Router();
const notifications = [];

// Instagram Webhook
router.post('/instagram', async (req, res) => {
  // res.sendStatus(200); // Removed early response to prevent Vercel freezing the process
  notifications.push(req.body); // Store the notification for processing

  try {
    for (const entry of req.body.entry) {
      const ig_user_id = entry.id;
      console.log('ig_user_id: ', ig_user_id);

      const commentData = entry.changes[0].value;
      if (commentData.parent_id) continue; // Ignore replies to other comments

      const commentText = commentData.text.toLowerCase();
      if (commentText.includes('link') || commentText.includes('price')) {
        const postId = commentData.media.id;
        const commentId = commentData.id;
        console.log('commentdata: ', commentData);

        const links = await getPostDetails('instagram', postId);
        console.log(links);

        const amazonMessage = links.amazon ? `Amazon: ${links.amazon} \n` : '';
        const flipkartMessage = links.flipkart ? `Flipkart: ${links.flipkart}` : '';

        if (links) {
          const message = `Here are the links!\n` + amazonMessage + flipkartMessage;
          const reply = `DM sent! Please follow to recieve in the Inbox or check your message requests if you're not following our page :)`
          await sendInstagramPrivateReply(message, commentId, ig_user_id);
          await sendInstagramPublicReply(reply, commentId);
        } else {
          console.log(`No links found in DB for Instagram post: ${postId}`);
        }
      }
    }
    res.sendStatus(200); // Respond after processing
  } catch (error) {
    console.error('Error processing Instagram webhook:', error);
    res.sendStatus(200); // Acknowledge receipt even on error
  }
});

router.get('/instagram', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});
router.get('/facebook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});
router.get('/webhooks', (req, res) => {
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