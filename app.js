// app.js

// Flashcards stored in the server file
let flashcards = [];

// Fetch flashcards from the server
async function loadFlashcards() {
  try {
    const response = await fetch("/flashcards");
    if (!response.ok) throw new Error("Failed to load flashcards");
    flashcards = await response.json();

    // Add a test flashcard if no flashcards exist
    if (flashcards.length === 0) {
      flashcards.push({
        question: "What is 2 + 2?",
        answer: "4",
        currentInterval: 1,
        lastReviewDate: new Date().toISOString().split("T")[0],
        status: "active"
      });
      await saveFlashcards();
    }

    console.log("Loaded flashcards:", flashcards); // Debugging log
    displayFlashcards();
  } catch (error) {
    console.error("Error loading flashcards:", error);
  }
}

// Save flashcards to the server
async function saveFlashcards() {
  try {
    await fetch("/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flashcards)
    });
  } catch (error) {
    console.error("Error saving flashcards:", error);
  }
}

// Add a new flashcard
document.getElementById("add-flashcard").addEventListener("click", async () => {
  const question = document.getElementById("question").value;
  const answer = document.getElementById("answer").value;

  if (question && answer) {
    flashcards.push({
      question,
      answer,
      currentInterval: 1,
      lastReviewDate: new Date().toISOString().split("T")[0],
      status: "active"
    });

    await saveFlashcards();
    console.log("Flashcard added successfully:", flashcards); // Debugging output
    displayFlashcards(); // Refresh the review section
    alert("Flashcard added!");
  } else {
    alert("Please fill in both fields.");
  }
});

// Get today's flashcards
function getTodayFlashcards() {
  const today = new Date().toISOString().split("T")[0];
  console.log("Today's Date:", today); // Debugging log
  const dueCards = flashcards.filter(card => {
    if (card.status === "mastered") return false; // Skip mastered cards

    const nextReviewDate = new Date(card.lastReviewDate);
    nextReviewDate.setDate(nextReviewDate.getDate() + card.currentInterval);

    console.log(`Card: ${card.question}, Next Review Date: ${nextReviewDate.toISOString().split("T")[0]}`);
    return nextReviewDate.toISOString().split("T")[0] <= today; // Card is due
  });

  console.log("Due Cards:", dueCards); // Debugging log
  return dueCards;
}

// Update flashcard after review
async function updateFlashcard(index, remembered) {
  const card = flashcards[index];
  const intervals = [1, 3, 7, 14, 30];

  if (remembered) {
    if (card.currentInterval === 30) {
      card.status = "mastered";
      alert(`Card "${card.question}" mastered!`);
    } else {
      card.currentInterval = intervals[intervals.indexOf(card.currentInterval) + 1];
    }
  } else {
    card.currentInterval = 1;
  }

  card.lastReviewDate = new Date().toISOString().split("T")[0];
  await saveFlashcards();
  displayFlashcards();
}

// Display flashcards for review
function displayFlashcards() {
  const todayCards = getTodayFlashcards();
  const reviewSection = document.getElementById("review-flashcard-section");
  const noCardsMessage = document.getElementById("no-cards-message");

  console.log("Today's Cards for Review:", todayCards); // Debugging log

  if (todayCards.length === 0) {
    console.log("No cards due for review."); // Debugging log
    reviewSection.style.display = "none";
    noCardsMessage.style.display = "block"; // Show "No cards to review" message
    return;
  }

  console.log("Displaying review section."); // Debugging log
  noCardsMessage.style.display = "none";
  reviewSection.style.display = "block";

  const currentCard = todayCards[0];
  console.log("Current Card for Review:", currentCard); // Debugging log
  document.getElementById("question-display").innerText = currentCard.question;

  // Reset the answer display
  document.getElementById("answer-display").style.display = "none";

  // Set up button functionality
  document.getElementById("show-answer").onclick = () => {
    console.log("Show Answer clicked for card:", currentCard.question);
    document.getElementById("answer-display").innerText = currentCard.answer;
    document.getElementById("answer-display").style.display = "block";
  };

  document.getElementById("remembered").onclick = () => {
    console.log("Remembered clicked for card:", currentCard.question);
    updateFlashcard(todayCards.indexOf(currentCard), true);
  };

  document.getElementById("not-remembered").onclick = () => {
    console.log("Not Remembered clicked for card:", currentCard.question);
    updateFlashcard(todayCards.indexOf(currentCard), false);
  };
}

// Initialize
loadFlashcards();