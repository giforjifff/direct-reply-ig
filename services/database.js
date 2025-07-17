// services/database.js
import { createClient } from 'redis';

const reddis = ()=> createClient({
  url: process.env.KV_REST_API_URL
}).connect();

export async function getPostDetails(platform, postId) {
  kv = await reddis();
  const key = `${platform}:${postId}`;
  console.log(`Querying DB for key: ${key}`);
  return await kv.get(key);
}


export async function setPostDetails(platform, postId, links) {
  kv = await reddis();
  const key = `${platform}:${postId}`;
  console.log(`Setting data for key: ${key}`);
  return await kv.set(key, links);
}