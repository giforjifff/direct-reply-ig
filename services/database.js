import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', err => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();


export async function getPostDetails(platform, postId) {
  const key = `${platform}:${postId}`;
  const data = await redisClient.get(key);
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