// const baseURL = "http://localhost:3000";
const baseURL = "https://four2-event-sorter-1.onrender.com";

const getAccessToken = async () =>
{
  try
  {
    const response = await fetch(`${baseURL}/api/get-access-token`, {
      method: 'POST',
    });

    if (!response.ok)
    {
      throw new Error('Failed to fetch access token');
    }
    const data = await response.json();
    const token = data.token;
    return token;
  } catch (error) {
    console.error('Error:', error);
  }
}

const fetchFeedbackForEvent = async (token, page) =>
{
  console.log("fuck", page)
  try {
    const res = await fetch(`${baseURL}/api/event_feedback?token=${token}&page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch feedbacks');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching feedback for event ${eventId}:`, err);
    return []; // or null
  }
};

const getAccessToken_and_events = async (page = 1) =>
{
  console.log(page)
  try {
		const response = await fetch(`${baseURL}/api/get-access-token`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch access token');
    }

    const data = await response.json();
    const token = data.token;

    const testRes = await fetch(`${baseURL}/api/get-past-events?token=${token}&page=${page}`);
    if (!testRes.ok) {
      throw new Error('Failed to fetch events');
    }

    const eventsData = await testRes.json();

    fetchFeedbackForEvent(token, page).then(feedbacks =>
    {
      console.log(feedbacks)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {
          action: "updateEventFeedback",
          feedbacks,
        });
      });
    });

		return eventsData;
  } catch (error) {
    console.error('Error:', error);
  }
};

const getAccessToken_and_Future_events = async () =>
{
  try {
		const response = await fetch(`${baseURL}/api/get-access-token`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch access token');
    }

    const data = await response.json();
    const token = data.token;

    // Now, use the token to fetch events
    const eventsResponse = await fetch(`${baseURL}/api/get-events?token=${token}`); // Passing the token in the query string

    if (!eventsResponse.ok) {
      throw new Error('Failed to fetch events');
    }

    // const eventsData = await eventsResponse.json();
    const eventsData = await eventsResponse.json();

		return eventsData;
  } catch (error) {
    console.error('Error:', error);
  }
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) =>
{
  if (message.action === "fetch_future")
  {
    try {
      const events = await getAccessToken_and_Future_events();

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ["content.js"],
          },
          (results) =>
          {
            if (!results || !results[0]?.result) {
              console.warn("⚠️ content.js not loaded, injecting...");
              chrome.scripting.executeScript(
                {
                  target: { tabId: tabId },
                  files: ["content.js"],
                },
                () => {
                  console.log("✅ content.js injected successfully!");

                  // Now send message
                  chrome.tabs.sendMessage(tabId, { action: "getFutureEvents", events: events }, (response) => {
                    if (chrome.runtime.lastError) {
                      console.error("❌ Error sending message:", chrome.runtime.lastError);
                      sendResponse({ action: "error", error: chrome.runtime.lastError.message });
                    } else {
                      sendResponse({ action: "success", events });
                    }
                  });
                }
              );
            } else {
              console.log("✅ content.js already loaded.");

              // Send message directly
              chrome.tabs.sendMessage(tabId, { action: "getFutureEvents", events: events }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error("❌ Error sending message:", chrome.runtime.lastError);
                  sendResponse({ action: "error", error: chrome.runtime.lastError.message });
                } else {
                  sendResponse({ action: "success", events});
                }
              });
            }
          }
        );
      });
      return true;

    } catch (error) {
      sendResponse({ action: "error", error: error.message });
    }
  }


  if (message.action === "fetch_past") {
		try
		{
      const events = await getAccessToken_and_events();
      const token = await getAccessToken();

      console.log(token)

       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ["content.js"],
          },
          (results) =>
          {
            if (!results || !results[0]?.result) {
              console.warn("⚠️ content.js not loaded, injecting...");
              chrome.scripting.executeScript(
                {
                  target: { tabId: tabId },
                  files: ["content.js"],
                },
                () => {
                  console.log("✅ content.js injected successfully!");

                  // Now send message
                  chrome.tabs.sendMessage(tabId, { action: "getEvents", events: events, token: token, page: 1 }, (response) => {
                    if (chrome.runtime.lastError) {
                      console.error("❌ Error sending message:", chrome.runtime.lastError);
                      sendResponse({ action: "error", error: chrome.runtime.lastError.message });
                    } else {
                      sendResponse({ action: "success", events });
                    }
                  });
                }
              );
            } else {
              console.log("✅ content.js already loaded.");

              // Send message directly
              chrome.tabs.sendMessage(tabId, { action: "getEvents", events: events, token: token, page: 1 }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error("❌ Error sending message:", chrome.runtime.lastError);
                  sendResponse({ action: "error", error: chrome.runtime.lastError.message });
                } else {
                  sendResponse({ action: "success", events });
                }
              });
            }
          }
        );
      });
      return true;
		} catch (error)
		{
      sendResponse({ action: "error", error: error.message });
    }
  }

  if (message.action === "fetch_page") {
    const page = message.page;
    console.log(`Background received request to fetch data for page ${page}`);
    try
		{
      const events = await getAccessToken_and_events(page);
      const token = await getAccessToken();

      console.log(token)

       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ["content.js"],
          },
          (results) =>
          {
            if (!results || !results[0]?.result) {
              console.warn("⚠️ content.js not loaded, injecting...");
              chrome.scripting.executeScript(
                {
                  target: { tabId: tabId },
                  files: ["content.js"],
                },
                () => {
                  console.log("✅ content.js injected successfully!");

                  // Now send message
                  chrome.tabs.sendMessage(tabId, { action: "getEvents", events: events, token: token, page: page }, (response) => {
                    if (chrome.runtime.lastError) {
                      console.error("❌ Error sending message:", chrome.runtime.lastError);
                      sendResponse({ action: "error", error: chrome.runtime.lastError.message });
                    } else {
                      sendResponse({ action: "success", events });
                    }
                  });
                }
              );
            } else {
              console.log("✅ content.js already loaded.");

              // Send message directly
              chrome.tabs.sendMessage(tabId, { action: "getEvents", events: events, token: token, page: page }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error("❌ Error sending message:", chrome.runtime.lastError);
                  sendResponse({ action: "error", error: chrome.runtime.lastError.message });
                } else {
                  sendResponse({ action: "success", events });
                }
              });
            }
          }
        );
      });
      return true;
		} catch (error)
		{
      sendResponse({ action: "error", error: error.message });
    }
  }

});
