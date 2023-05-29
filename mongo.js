
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
const { config } = require(__dirname + "/config.js");
// API endpoint URL
const apiUrl = 'https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Hu46PTPaSMgs3zU3HU4RyfVdQHkBKWHssLEaj8vWfd_19qzXg3xlKu_AsUkBQp1_EG-lSge7NXRx4A/ids?start=0&count=50&api_key='+config.RIOT_API_KEY;

// MongoDB connection string
const mongoUrl = 'mongodb+srv://<credentials>@cluster0.0rsrjm5.mongodb.net/?appName=mongosh+1.9.0';
const dbName = 'match';
const collectionName = 'matchHistory';

async function fetchDataAndUpload() {
    try {
      // Fetch data from the API
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      // Connect to MongoDB
      const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
      const db = client.db('match'); // Replace with your MongoDB database name
      const collection = db.collection('matchHistory'); // Replace with your MongoDB collection name
  
      // Insert the fetched data into MongoDB
      const result = await collection.insertMany(data);
      console.log(`${result.insertedCount} documents inserted`);
  
      // Close the MongoDB connection
      client.close();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  

// Call the function to fetch data, process it, and upload to MongoDB
fetchDataAndUpload();
