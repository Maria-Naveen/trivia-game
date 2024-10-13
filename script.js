// DOM Elements
const entryForm = document.getElementById("entryForm");
const categoryBox = document.getElementById("categoryBox");
const selectedCategory = document.getElementById("category");
const questionContainer = document.getElementById("questionContainer");
const questionText = document.getElementById("questionText");
const answerButtons = document.getElementById("answerButtons");
const playerTurnLabel = document.getElementById("playerTurn");
const resultSection = document.getElementById("resultSection");
const resultText = document.getElementById("resultText");
const continueButton = document.getElementById("continueButton");
const stopButton = document.getElementById("stopButton");

// Game State Variables
let players = [];
let currentPlayerIndex = 0;
let currentQuestionIndex = 0;
let selectedQuestions = [];
let usedCategories = []; // To store already chosen categories
let gameEnded = false; // Track if the game has ended

// Form Submission Event Listener
entryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const player1 = document.getElementById("player1").value;
  const player2 = document.getElementById("player2").value;
  if (!player1 || !player2) return alert("Enter both players' names!");
  players = [
    { name: player1, score: 0 },
    { name: player2, score: 0 },
  ];
  entryForm.style.display = "none"; // Hide the entry form box
  categoryBox.style.display = "block"; // Display the categories section box
});

// Category Selection Event Listener
selectedCategory.addEventListener("change", async () => {
  const category = selectedCategory.value;
  // Prevent using already chosen categories
  if (usedCategories.includes(category)) {
    alert(
      "This category has already been chosen. Please select a new category."
    );
    return;
  }
  // Fetch questions if a new category is selected
  try {
    const response = await fetch(
      `https://the-trivia-api.com/v2/questions?limit=30&categories=${category}`
    );
    const questions = await response.json();
    selectedQuestions = [
      ...questions.filter((q) => q.difficulty === "easy").slice(0, 2),
      ...questions.filter((q) => q.difficulty === "medium").slice(0, 2),
      ...questions.filter((q) => q.difficulty === "hard").slice(0, 2),
    ];
    if (selectedQuestions.length < 6) {
      alert("Not enough questions available for this category.");
      return;
    }
    // Mark this category as used
    usedCategories.push(category);
    categoryBox.style.display = "none"; // Hide the category box
    questionContainer.style.display = "block"; // Display the question box
    displayQuestion(); // Start the first question
  } catch (error) {
    console.error("Can't fetch the questions from the API", error);
    alert("Error fetching questions. Please try again.");
  }
});

// Display Question Function
function displayQuestion() {
  if (currentQuestionIndex >= selectedQuestions.length) {
    return endGame(); // End the game if all questions are completed
  }
  const question = selectedQuestions[currentQuestionIndex];
  playerTurnLabel.textContent = `${players[currentPlayerIndex].name}'s Turn`;
  questionText.textContent = question.question.text;
  const answers = [...question.incorrectAnswers, question.correctAnswer].sort(
    () => Math.random() - 0.5
  );
  answerButtons.innerHTML = answers
    .map((answer) => `<button>${answer}</button>`)
    .join("");
  answerButtons.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () =>
      handleAnswer(button.textContent, question)
    );
  });
}

// Handle Answer Function
function handleAnswer(selectedAnswer, question) {
  if (selectedAnswer === question.correctAnswer) {
    const points = { easy: 10, medium: 15, hard: 20 }[question.difficulty];
    players[currentPlayerIndex].score += points;
  }
  currentPlayerIndex = (currentPlayerIndex + 1) % 2; // Switch players
  currentQuestionIndex++;
  displayQuestion();
}

// End Game Function
function endGame() {
  questionContainer.style.display = "none"; // Hide the questions
  resultText.innerHTML = `<br>Scores:<br> ${players[0].name}: ${players[0].score}<br> ${players[1].name}: ${players[1].score}`;
  if (gameEnded) {
    const winner =
      players[0].score === players[1].score
        ? "It's a tie!"
        : players[0].score > players[1].score
        ? `${players[0].name} wins!`
        : `${players[1].name} wins!`;
    resultText.innerHTML += `<br/>Game over!<br/> The result is:<br/>${winner}`; // Append the winner announcement
  }
  resultSection.style.display = "block"; // Show the result section
}

// Continue Button Event Listener
continueButton.addEventListener("click", () => {
  // Prepare for a new round
  selectedQuestions = [];
  currentQuestionIndex = 0;
  resultSection.style.display = "none"; // Hide result section
  categoryBox.style.display = "block"; // Show category form again
  gameEnded = false; // Reset game ended state
});

// Stop Button Event Listener
stopButton.addEventListener("click", () => {
  alert("Thanks for playing!");
  gameEnded = true; // Mark the game as ended
  endGame(); // Call endGame to show the final winner
});
