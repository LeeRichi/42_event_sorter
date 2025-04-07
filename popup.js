document.getElementById("fetch_past").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "fetch_past" });
});

document.getElementById("fetch_future").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "fetch_future" });
});

const totalPages = 10; //hard code :((
let currentPage = 1;

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageContainer = document.getElementById("pageButtonsContainer");

function createPageButtons() {
  pageContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("pageBtn");
    btn.dataset.page = i;

    if (i === currentPage) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      updateActivePage(i);
    });

    pageContainer.appendChild(btn);
  }
}

function updateActivePage(newPage) {
  if (newPage < 1 || newPage > totalPages) return;

  currentPage = newPage;
  createPageButtons();

  console.log("Page selected:", currentPage);
  chrome.runtime.sendMessage({ action: "fetch_page", page: currentPage });
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) updateActivePage(currentPage - 1);
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) updateActivePage(currentPage + 1);
});

createPageButtons();
