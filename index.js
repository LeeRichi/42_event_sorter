import express from 'express';
import axios from 'axios';
import qs from 'qs';
import dotenv from 'dotenv';
import { saveToken } from './token.js';
import cors from 'cors';  // Import CORS middleware

dotenv.config(); // Load .env variables

const app = express();
const port = process.env.PORT || 3000; // Set port to use from env or default to 3000

const UID = process.env.UID;
const SECRET = process.env.SECRET;

app.use(cors());  // This will allow requests from all domains
app.use(express.json());  // Enable JSON body parsing

// Route to get access token
app.post('/api/get-access-token', async (req, res) => {
  const url = 'https://api.intra.42.fr/oauth/token';
  const data = qs.stringify({
    grant_type: 'client_credentials',
    client_id: UID,
    client_secret: SECRET,
  });

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const token = response.data.access_token;
    console.log('Access Token:', token);

    // Save the token (you can adjust this to use a database or in-memory store)
    saveToken(token, response.data.expires_in);

    res.json({ token });
  } catch (error) {
    console.error('Error getting access token:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error getting access token' });
  }
});

// Route to fetch events //future
app.get('/api/get-events', async (req, res) => {
  const token = req.query.token; // Token passed in query params

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const eventsResponse = await axios.get('https://api.intra.42.fr/v2/campus/13/events', {
      params: {
        // Pass sort query here as well as other params if needed
        sort: 'begin_at',  // Sorting by id in ascending order
        filter: {
          future: true,  // Filtering for future events
        },
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const eventsData = eventsResponse.data;

    res.json({ success: true, events: eventsData });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

const fetchPastEvents = async (token, page) => {
  const response = await axios.get(`https://api.intra.42.fr/v2/campus/13/events`, {
    params: {
      sort: '-end_at',
      filter: { future: false },
      per_page: 15,
      page: page
    },
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

app.get('/api/event_feedback', async (req, res) => {
  const token = req.query.token;
  const page = req.query.page || 1; // Get the page number from query params, default to 1

  console.log("page", page)

  console.log(token)

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const eventsData = await fetchPastEvents(token, page);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const eventsWithFeedback = await Promise.all(eventsData.map(async (event, index) => {
      await delay((index + 1) * 500);
      try {
        const feedbackResponse = await axios.get(`https://api.intra.42.fr/v2/events/${event.id}/feedbacks`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        event.feedbacks = feedbackResponse.data || [];

        console.log(event)
        return event;

      } catch (error) {
        console.error(`Error fetching feedback for event ${event.id}:`, error.message);
        event.feedbacks = [];
        return event;
      }
    }));

    res.json({ success: true, events: eventsWithFeedback });

  } catch (err) {
    console.error("Failed to fetch past events:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/get-past-events', async (req, res) => {
  const token = req.query.token; // Token passed in query params
  const page = req.query.page || 1; // Get the page number from query params, default to 1

  console.log(page)

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  //get all the past events but without feedback
  try {
    const eventsResponse = await axios.get('https://api.intra.42.fr/v2/campus/13/events', {
      params: {
        // Pass sort query here as well as other params if needed
        sort: '-end_at',  // Sorting by id in ascending order
        filter: {
          future: false,  // Filtering for future events
        },
        per_page: 15,
        page: page
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const eventsData = eventsResponse.data;

    // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // const eventsWithFeedback = await Promise.all(eventsData.map(async (event, index) => {
    //   // Add a delay before making each request, using the index to calculate time delay
    //   await delay(index * 500); // 500ms delay for each event (adjust the delay as needed)

    //   try {
    //     // Fetch feedback for the event
    //     const feedbackResponse = await axios.get(`https://api.intra.42.fr/v2/events/${event.id}/feedbacks`, {
    //       headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'Content-Type': 'application/json',
    //       },
    //     });

    //     // Attach the feedback to the event object
    //     event.feedbacks = feedbackResponse.data || [];
    //     return event;

    //   } catch (error) {
    //     console.error(`Error fetching feedback for event ${event.id}:`, error);
    //     event.feedbacks = []; // If an error occurs, we assign an empty array for feedback
    //     return event;
    //   }
    // }));

    res.json({ success: true, events: eventsData });

  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Start Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

