// routes/admin.js
import express from 'express';
import { setPostDetails } from '../services/database.js';

const router = express.Router();

router.post('/postdata', async (req, res) => {
  if (req.headers['x-api-key'] !== process.env.INTERNAL_API_KEY) {
    return res.status(401).send('Unauthorized');
  }

  const { igPostId, fbPostId, amazonLink, flipkartLink } = req.body;

  if ((!amazonLink && !flipkartLink) || (!igPostId && !fbPostId)) {
    return res.status(400).send('Missing required fields.');
  }
  
  const links = {};
  if (amazonLink) {
    links.amazon = amazonLink;
  }
  if (flipkartLink) {
    links.flipkart = flipkartLink;
  }
  
  try {
    if (igPostId) {
      await setPostDetails('instagram', igPostId, links);
    }
    if (fbPostId) {
      await setPostDetails('facebook', fbPostId, links);
    }
    res.status(200).send('Successfully added/updated post links.');
  } catch (error) {
    console.error("Error in /postdata:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;