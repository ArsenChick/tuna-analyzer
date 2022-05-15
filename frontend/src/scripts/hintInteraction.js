let questions = document.querySelectorAll('.questions-sign cursor-point');
if (questions.length > 0) {
  for (let i = 0; i < questions.length; i++) {
    const questionSign = questions[i];
    questionSign.addEventListener("click", function(e) {
      questionSign.parentElement.classList.toggle('_active');
    });
  }
}