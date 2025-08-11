import pg from 'pg';

console.log(process.env.SUPABASE_DB_URL);

const pool = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL, 

});

// Listen for errors on idle clients
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});


export async function checkDbConnection() {
  await pool.query('SELECT NOW()'); // A simple query to check if we can connect.
}

export async function getPostDetails(platform, postId) {
  console.log(`Querying PG for key: ${platform}:${postId}`);
  const query = {
    text: 'SELECT links FROM posts WHERE platform = $1 AND post_id = $2',
    values: [platform, postId],
  };

  try {
    const res = await pool.query(query);
    if (res.rows.length > 0) {
      console.log('Data found in PG:', res.rows[0].links);
      return res.rows[0].links; // The 'links' column is already a JS object
    }
    console.log('No data found in PG for this key.');
    return null; // No post found
  } catch (err) {
    console.error('Error in getPostDetails:', err);
    throw err; // Re-throw the error to be handled by the route
  }
}


export async function allPostDetails() {
  const query = 'SELECT platform, post_id, links FROM posts';
  try {
    const res = await pool.query(query);
    
    // Transform the array of rows into the key-value object format you had with Redis
    const postDetails = {};
    for (const row of res.rows) {
      const key = `${row.platform}:${row.post_id}`;
      postDetails[key] = row.links;
    }
    return postDetails;
  } catch (err) {
    console.error('Error in allPostDetails:', err);
    throw err;
  }
}

/**
 * Sets or updates the links for a specific post. (This is an "upsert").
 * @param {string} platform
 * @param {string} postId
 * @param {object} links
 */
export async function setPostDetails(platform, postId, links) {

  const query = {
    text: `
      INSERT INTO posts (platform, post_id, links) 
      VALUES ($1, $2, $3)
      ON CONFLICT (platform, post_id) 
      DO UPDATE SET links = EXCLUDED.links;
    `,
    values: [platform, postId, JSON.stringify(links)], // links must be stringified for the query
  };

  try {
    await pool.query(query);
    console.log(`Successfully set/updated details for ${platform}:${postId}`);
  } catch (err) {
    console.error('Error in setPostDetails:', err);
    throw err;
  }
}