const moreStyle = document.createElement('style');
moreStyle.textContent = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  .bounce {
    animation: bounce 3s ease infinite;
  }
`;

document.head.appendChild(moreStyle);

function createStars(rating)
{
  const starContainer = document.createElement("span");
  starContainer.className = "ml-3 mr-3";
  starContainer.setAttribute("data-placement", "top");
  starContainer.setAttribute("data-toggle", "tooltip");
  starContainer.setAttribute("title", `Evaluation Rated ${rating}/5`);

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.className = "iconf-star-9";
    if (rating < 2)
    {
      console.log(rating)
      star.classList.add(i <= rating ? "text-danger" : "text-muted");
    } else {
      star.classList.add(i <= rating ? "text-success" : "text-muted");
    }
    starContainer.appendChild(star);
  }

  return starContainer;
}

function updateFeedbacksInDOM(eventsWithFeedbacks)
{
  for (const event of eventsWithFeedbacks)
  {
    const feedbackSection = document.querySelector(`#event-${event.id}`);
    feedbackSection.innerHTML = "";
    feedbackSection.id = `event-${event.id}`;
    feedbackSection.className = "d-flex flex-column flex-md-row-reverse flex-wrap align-items-center";

    if (event.feedbacks && event.feedbacks.length > 0)
    {
      const feedbackLink = document.createElement("a");
      feedbackLink.className = "btn btn-info btn-xs";
      feedbackLink.href = `https://profile.intra.42.fr/events/${event.id}/feedbacks`
      feedbackLink.textContent = "show";

      const feedbackCount = document.createElement("div");
      feedbackCount.className = "d-flex mr-2 text-center pl-2";
      feedbackCount.textContent = event.feedbacks.length;

      const iconDiv = document.createElement("div");
      iconDiv.className = "d-flex icon-bubble-comment-1";

      const ratingStars = createStars((event.feedbacks.reduce((total, feedback) => total + feedback.rating, 0) / event.feedbacks.length).toFixed(1));

      const ratingText = document.createElement("div");
      const averageRating = event.feedbacks.reduce((total, feedback) => total + feedback.rating, 0) / event.feedbacks.length;
      if (averageRating.toFixed(1) < 2)
      {
        ratingText.className = "text-danger";
      } else
      {
        ratingText.className = "text-success";
      }

      ratingText.textContent = `${(event.feedbacks.reduce((total, feedback) => total + feedback.rating, 0) / event.feedbacks.length).toFixed(1)} / 5`;

      feedbackSection.appendChild(feedbackLink);
      feedbackSection.appendChild(feedbackCount);
      feedbackSection.appendChild(iconDiv);
      feedbackSection.appendChild(ratingStars);
      feedbackSection.appendChild(ratingText);
      feedbackSection.id = `event-${event.id}`;
    }
    else
    {
      const feedbackSection = document.querySelector(`#event-${event.id}`);
      feedbackSection.className = "d-flex flex-column flex-md-row-reverse flex-wrap align-items-center";
      feedbackSection.textContent = "No feedback yet.";
    }
  }
}

function openEventModal(event)
{
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.setAttribute("id", "smartModal");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");
  modal.style.display = "block";
  document.body.appendChild(modal);

  const modalDialog = document.createElement("div");
  modalDialog.classList.add("modal-dialog");
  modal.appendChild(modalDialog);

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalDialog.appendChild(modalContent);

  const modalHeader = document.createElement("div");
  modalHeader.classList.add("modal-header");
  modalContent.appendChild(modalHeader);

  const closeButton = document.createElement("button");
  closeButton.setAttribute("aria-hidden", "true");
  closeButton.classList.add("close");
  closeButton.setAttribute("type", "button");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", closeModal);
  modalHeader.appendChild(closeButton);

  const headerKind = document.createElement("p");
  headerKind.textContent = event.kind;
  modalHeader.appendChild(headerKind);

  const headerTitle = document.createElement("h3");
  headerTitle.textContent = event.name;
  modalHeader.appendChild(headerTitle);

  const beginDate = new Date(event.begin_at);
  const beginAt = document.createElement("span");
  beginAt.textContent = `🏁 ${beginDate.toLocaleDateString()} at ${beginDate.toLocaleTimeString()}`;
  modalHeader.appendChild(beginAt);

  const eventInfo = document.createElement("div");
  eventInfo.classList.add("event-info", "d-flex", "flex-wrap", "justify-content-between");
  modalHeader.appendChild(eventInfo);

  const currentDate = new Date();
  const timeDiff = beginDate - currentDate;
  const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const daysText = daysRemaining > 0 ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}` : "Today";
  const inDays = document.createElement("span");
  inDays.textContent = `📅 In ${daysText}`;
  eventInfo.appendChild(inDays);

  const endDate = new Date(event.end_at);
  const durationMs = endDate - beginDate;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationText = `${durationHours} hour${durationHours !== 1 ? 's' : ''} ${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`;
  const forDuration = document.createElement("span");
  forDuration.textContent = `🕛️ For about ${durationText}`;
  eventInfo.appendChild(forDuration);

  const location = document.createElement("span");
  location.textContent = `📍 Location: ${event.location}`;
  eventInfo.appendChild(location);

  if (event.max_people !== null && event.nbr_subscribers !== 0)
  {
    const subscribers = document.createElement("span");
    subscribers.textContent = `👤 ${event.subscribers} / ${event.max_people} subscribers`;
    eventInfo.appendChild(subscribers);
  }

  const modalBody = document.createElement("div");
  modalBody.classList.add("modal-body");
  modalContent.appendChild(modalBody);

  const descriptionParagraph = document.createElement("div");
  descriptionParagraph.classList.add("notification-text");

  let formattedDescription = event.description
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\r\n/g, "<br>")
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

  descriptionParagraph.innerHTML = formattedDescription;
  modalBody.appendChild(descriptionParagraph);

  // Create the modal footer
  const modalFooter = document.createElement("div");
  modalFooter.classList.add("modal-footer");
  modalContent.appendChild(modalFooter);

  const cancelButton = document.createElement("button");
  cancelButton.classList.add("btn");
  cancelButton.setAttribute("data-dismiss", "modal");
  cancelButton.setAttribute("type", "button");
  cancelButton.textContent = "Close";
  cancelButton.addEventListener("click", closeModal);
  modalFooter.appendChild(cancelButton);

  if (new Date(event.begin_at).getTime() > Date.now())
  {
    const subscribeButton = document.createElement("button");
    subscribeButton.classList.add("send", "btn", "btn-primary");
    subscribeButton.textContent = "Subscribe";
    modalFooter.appendChild(subscribeButton);
  }

  const backdrop = document.createElement("div");
  backdrop.classList.add("modal-backdrop");
  document.body.appendChild(backdrop);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  modal.addEventListener("click", function(e) {
    if (e.target === modal) {
      closeModal();
      }
  });

  function closeModal()
  {
    modal.remove();
    backdrop.remove();
  }
}

function createEventMarkup(events, past = true, token = null, page = 1)
{
  let targetContainer = document.querySelector(".container-item.add-padding");
  if (!targetContainer) {
    console.log("❌ Target container not found!");
    return;
  }
  targetContainer.innerHTML = "";
  const container = document.createElement("div");
  container.className = "table-list";

  const titleWrapper = document.createElement("div");
  titleWrapper.className = "text-center";
  const title = document.createElement("h2");
  title.textContent = "🪄 Your Sorted Event's Marks";
  titleWrapper.appendChild(title);
  container.appendChild(titleWrapper);

  const subTitleContainer = document.createElement("div");
  subTitleContainer.className = "d-flex justify-content-center gap-3 mt-3 mb-2";
  const subTitle = document.createElement("h5");
  subTitle.className = "text-center";
  if (!past)
  {
    subTitle.textContent = "Future Events 🚀";
  }
  else
  {
    subTitle.textContent = `↩️ Past Events Page ${page}`;
  }
  subTitle.id = "event-subtitle";
  subTitleContainer.appendChild(subTitle);
  container.appendChild(subTitleContainer);

  //mainSection
  events.events.forEach(event =>
  {
    const eventItem = document.createElement("div");
    eventItem.id = `main-event-${event.id}`;
    eventItem.className = "topic-item d-flex flex-column flex-md-row justify-content-between";

    const header = document.createElement("header");
    header.className = "d-flex justify-content-between align-items-center w-80";

    const eventLink = document.createElement("a");
    eventLink.className = "event-button";
    eventLink.href = "#";
    eventLink.textContent = event.name;
    eventLink.onclick = function (e) {
      e.preventDefault();
      openEventModal(event);
    };

    const bold = document.createElement("b");
    bold.appendChild(eventLink);
    header.appendChild(bold);

    if (event.begin_at !== undefined)
    {
      const eventDate = new Date(event.begin_at);
      const formattedDate = eventDate.getFullYear() + "/" +
      String(eventDate.getMonth() + 1).padStart(2, "0") + "/" +
      String(eventDate.getDate()).padStart(2, "0");

      const daysBeforeWrapper = document.createElement("div");
      daysBeforeWrapper.className = "d-flex justify-content-start p-4";

      const daysBeforeText = document.createElement("div");
      daysBeforeText.className = "text-muted small";
      daysBeforeText.textContent = `${formattedDate}`;

      daysBeforeWrapper.appendChild(daysBeforeText);
      header.appendChild(daysBeforeWrapper);

      header.appendChild(daysBeforeText);
    }
    eventItem.appendChild(header);

    if (event.feedbacks && event.feedbacks.length > 0)
    {
      const feedbackSection = document.createElement("div");
      feedbackSection.id = `event-${event.id}`;
      feedbackSection.className = "d-flex flex-column flex-md-row-reverse flex-wrap align-items-center";

      const feedbackLink = document.createElement("a");
      feedbackLink.className = "btn btn-info btn-xs";
      feedbackLink.href = `https://profile.intra.42.fr/events/${event.id}/feedbacks`
      feedbackLink.textContent = "show";

      const feedbackCount = document.createElement("div");
      feedbackCount.className = "d-flex mr-2 text-center pl-2";
      feedbackCount.textContent = event.feedbacks.length;

      const iconDiv = document.createElement("div");
      iconDiv.className = "d-flex icon-bubble-comment-1";

      const ratingStars = createStars((event.feedbacks.reduce((total, feedback) => total + feedback.rating, 0) / event.feedbacks.length).toFixed(1));

      const ratingText = document.createElement("div");
      const averageRating = event.feedbacks.reduce((total, feedback) => total + feedback.rating, 0) / event.feedbacks.length;
      if (averageRating.toFixed(1) < 2) {
        ratingText.className = "text-danger";
      } else {
        ratingText.className = "text-success";
      }

      ratingText.textContent = `${(event.feedbacks.reduce((total, feedback) => total + feedback.rating, 0) / event.feedbacks.length).toFixed(1)} / 5`;

      feedbackSection.appendChild(feedbackLink);
      feedbackSection.appendChild(feedbackCount);
      feedbackSection.appendChild(iconDiv);
      feedbackSection.appendChild(ratingStars);
      feedbackSection.appendChild(ratingText);
      feedbackSection.id = `event-${event.id}`;

      eventItem.appendChild(feedbackSection);
    } else
    {
      const feedbackSection = document.createElement("div");
      feedbackSection.id = `event-${event.id}`;
      if (past)
      {
        feedbackSection.className = "d-flex flex-column flex-md-row-reverse flex-wrap align-items-center bounce";
        const noFeedback = document.createTextNode("Loading feedbacks...");
        feedbackSection.appendChild(noFeedback);
        eventItem.appendChild(feedbackSection);
      }
      else
      {
        feedbackSection.className = "d-flex flex-column flex-md-row-reverse flex-wrap align-items-center";
        const noFeedback = document.createTextNode("No feedback yet.");
        feedbackSection.appendChild(noFeedback);
        eventItem.appendChild(feedbackSection);
      }
    }

    container.appendChild(eventItem);
  });

  targetContainer.appendChild(container);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getFutureEvents")
  {
    console.log(message)
    createEventMarkup(message.events, false);
    sendResponse({ status: "✅ Content updatd!" });
    return true;
  }

  if (message.action === "getEvents")
  {
    const token = message.token
    console.log(message.page)
    createEventMarkup(message.events, true, token, message.page);

    sendResponse({ status: "✅ Content updatd!" });
    return true;
  }

  if (message.action === "updateEventFeedback") {
    const { feedbacks } = message;
    updateFeedbacksInDOM(feedbacks.events);
  }
});
