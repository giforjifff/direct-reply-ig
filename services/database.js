// services/database.js
import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

/**
 * Retrieves post details from the database using a prefixed key.
 * @param {'instagram' | 'facebook'} platform - The platform name.
 * @param {string} postId - The ID of the post.
 * @returns {Promise<object|null>} The links object or null.
 */
export async function getPostDetails(platform, postId) {
  const key = `${platform}:${postId}`;
  console.log(`Querying DB for key: ${key}`);
  return await kv.get(key);
}

/**
 * Sets the post details in the database.
 * @param {'instagram' | 'facebook'} platform - The platform name.
 * @param {string} postId - The ID of the post.
 * @param {object} links - The object containing links { amazon, flipkart }.
 */
export async function setPostDetails(platform, postId, links) {
  const key = `${platform}:${postId}`;
  console.log(`Setting data for key: ${key}`);
  return await kv.set(key, links);
}