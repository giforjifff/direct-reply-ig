import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', err => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis client is connecting...'));
redisClient.on('ready', () => console.log('Redis client is ready.'));
redisClient.on('end', () => console.log('Redis client connection closed.'));


export async function getPostDetails(platform, postId) {
  const key = `${platform}:${postId}`;
  console.log('key inside the getPostDetail function: ', key);
  const all_data = await fetch('https://direct-reply-ig.vercel.app/admin/postdata', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  console.log('data is : ', all_data[key]);
  
  const data = await redisClient.get(key);
  console.log('data inside the getPostDetail function: ', data);
  
  return data ? JSON.parse(data) : null;
}

export async function allPostDetails(){
  const keys = await redisClient.keys('*');
  const postDetails = {};
  
  for (const key of keys) {
    const value = await redisClient.get(key);
    postDetails[key] = value ? JSON.parse(value) : null;
  }
  
  return postDetails;
}

export async function setPostDetails(platform, postId, links) {
  const key = `${platform}:${postId}`;
  const value = JSON.stringify(links);
  return await redisClient.set(key, value);
}