$("document").ready(function () {
  var currentQuestionId = null;      // "q1", "q2", "end_success"
  var questionHistory = [];          // για back button
  var userAnswers = {};              // questionId -> selectedIndex 1,2,3,κλπ

  var all_questions;
  var all_questions_en;
  var questionsById = {};            // ελληνικά: id -> node
  var questionsById_en = {};         // αγγλικά: id -> node

  var all_evidences;
  var all_evidences_en;
  var evidenceById = {};             // ελληνικά: ev1 -> { id, name, description }
  var evidenceById_en = {};          // αγγλικά

  var faq;
  var faq_en;


  

  /*
  ΚΟΜΜΑΤΙ ΤΟΥ ΜΕΡΟΥΣ Β
  */
  // Φέρνουμε τη διαδικασία από το Api του Mitos και ενημερώνουμε τα κείμενα
  fetchMitosService(151880)
    .then(function (service) {
      console.log("MITOS service 151880:", service);

      // ενημέρωσε τα language strings
      if (typeof applyMitosServiceToLanguageContent === "function") {
        applyMitosServiceToLanguageContent(service);
      }

      // και ξαναγράψε τα κείμενα στη σελίδα
      if (typeof updateContent === "function") {
        updateContent();
      }
    })
    .catch(function (err) {
      console.error("MITOS API error:", err);
      // αν αποτύχει, συνεχίζεις απλά με τα default κείμενα
    });


  /*
  ΤΕΛΟΣ ΚΟΜΜΑΤΙ ΤΟΥ ΜΕΡΟΥΣ Β
  */




  //hide the form buttons when its necessary
  function hideFormBtns() {
    $("#nextQuestion").hide();
    $("#backButton").hide();
  }

  //Once the form begins, the questions' data and length are fetched.
  function getQuestions() {
    return fetch("question-utils/all-questions.json")
      .then((response) => response.json())
      .then((data) => {
        all_questions = data.questions;

        // χτίζουμε map id -> node (για ελληνικά)
        all_questions.forEach((q) => {
          questionsById[q.id] = q;
        });

        // βρίσκουμε την πρώτη "κανονική" ερώτηση (type: "question")
        var firstQuestion = all_questions.find((q) => q.type === "question");
        if (firstQuestion) {
          currentQuestionId = firstQuestion.id;
          questionHistory = [currentQuestionId];
        }

        // Fetch the second JSON file - english
        return fetch("question-utils/all-questions-en.json")
          .then((response) => response.json())
          .then((dataEn) => {
            all_questions_en = dataEn.questions;

            all_questions_en.forEach((q) => {
              questionsById_en[q.id] = q;
            });
          })
          .catch((error) => {
            console.error("Failed to fetch all-questions-en.json:", error);

            // Show error message to the user
            const errorMessage = document.createElement("div");
            errorMessage.textContent =
              "Error: Failed to fetch all-questions-en.json.";
            $(".question-container").html(errorMessage);

            hideFormBtns();
          });
      })
      .catch((error) => {
        console.error("Failed to fetch all-questions:", error);

        // Show error message to the user
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Error: Failed to fetch all-questions.json.";
        $(".question-container").html(errorMessage);

        hideFormBtns();
      });
  }

  //Once the form begins, the evidences' data and length are fetched.
  function getEvidences() {
    return fetch("question-utils/cpsv.json")
      .then((response) => response.json())
      .then((data) => {
        all_evidences = data;

        // Χτίζουμε map evId -> evidence object (ελληνικά)
        evidenceById = {};
        if (data.PublicService && Array.isArray(data.PublicService.evidence)) {
          data.PublicService.evidence.forEach((group) => {
            if (Array.isArray(group.evs)) {
              group.evs.forEach((ev) => {
                evidenceById[ev.id] = ev; 
              });
            }
          });
        }

        // Αγγλική εκδοχή
        return fetch("question-utils/cpsv-en.json")
          .then((response) => response.json())
          .then((dataEn) => {
            all_evidences_en = dataEn;

            evidenceById_en = {};
            if (
              dataEn.PublicService &&
              Array.isArray(dataEn.PublicService.evidence)
            ) {
              dataEn.PublicService.evidence.forEach((group) => {
                if (Array.isArray(group.evs)) {
                  group.evs.forEach((ev) => {
                    evidenceById_en[ev.id] = ev;
                  });
                }
              });
            }
          })
          .catch((error) => {
            console.error("Failed to fetch cpsv-en:", error);

            const errorMessage = document.createElement("div");
            errorMessage.textContent = "Error: Failed to fetch cpsv-en.json.";
            $(".question-container").html(errorMessage);

            hideFormBtns();
          });
      })
      .catch((error) => {
        console.error("Failed to fetch cpsv:", error);

        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Error: Failed to fetch cpsv.json.";
        $(".question-container").html(errorMessage);

        hideFormBtns();
      });
  }

  //Once the form begins, the faqs' data is fetched.
  function getFaq() {
    return fetch("question-utils/faq.json")
      .then((response) => response.json())
      .then((data) => {
        faq = data;
        totalFaq = data.length;

        // Fetch the second JSON file -faq english
        return fetch("question-utils/faq-en.json")
          .then((response) => response.json())
          .then((dataEn) => {
            faq_en = dataEn;
          })
          .catch((error) => {
            console.error("Failed to fetch faq-en:", error);
            // Show error message to the user
            const errorMessage = document.createElement("div");
            errorMessage.textContent = "Error: Failed to fetch faq-en.json.";
            $(".question-container").html(errorMessage);
          });
      })
      .catch((error) => {
        console.error("Failed to fetch faq:", error);
        // Show error message to the user
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Error: Failed to fetch faq.json.";
        $(".question-container").html(errorMessage);
      });
  }

  function getEvidencesById(id) {
    var selectedEvidence;
    currentLanguage === "greek"
      ? (selectedEvidence = all_evidences)
      : (selectedEvidence = all_evidences_en);
    selectedEvidence = selectedEvidence.PublicService.evidence.find(
      (evidence) => evidence.id === id
    );

    if (selectedEvidence) {
      const evidenceListElement = document.getElementById("evidences");
      selectedEvidence.evs.forEach((evsItem) => {
        const listItem = document.createElement("li");
        listItem.textContent = evsItem.name;
        evidenceListElement.appendChild(listItem);
      });
    } else {
      console.log(`Evidence with ID '${givenEvidenceID}' not found.`);
    }
  }

  //text added in the final result
  function setResult(text) {
    const resultWrapper = document.getElementById("resultWrapper");
    const result = document.createElement("h5");
    result.textContent = text;
    resultWrapper.appendChild(result);
  }

  function loadFaqs() {
    var faqData = currentLanguage === "greek" ? faq : faq_en;
    var faqTitle =
      currentLanguage === "greek"
        ? "Συχνές Ερωτήσεις"
        : "Frequently Asked Questions";

    var faqElement = document.createElement("div");

    faqElement.innerHTML = `
        <div class="govgr-heading-m language-component" data-component="faq" tabIndex="15">
          ${faqTitle}
        </div>
    `;

    var ft = 16;
    faqData.forEach((faqItem) => {
      var faqSection = document.createElement("details");
      faqSection.className = "govgr-accordion__section";
      faqSection.tabIndex = ft;

      faqSection.innerHTML = `
        <summary class="govgr-accordion__section-summary">
          <h2 class="govgr-accordion__section-heading">
            <span class="govgr-accordion__section-button">
              ${faqItem.question}
            </span>
          </h2>
        </summary>
        <div class="govgr-accordion__section-content">
          <p class="govgr-body">

          </p>
        </div>
      `;

      faqElement.appendChild(faqSection);
      ft++;
    });

    $(".faqContainer").html(faqElement);
  }


  //Helper for data-driven approach (we want to get question flow from all-questions.json dynamically)
  function getQuestionById(id) {
    if (currentLanguage === "greek") {
      return questionsById[id];
    } else {
      return questionsById_en[id];
    }
  }

  //Εachtime back/next buttons are pressed the form loads a question
  function loadQuestion(questionId, noError) {
    var question = getQuestionById(questionId);
    if (!question) {
      console.error("Question not found:", questionId);
      return;
    }

    // Αν είναι κόμβος τύπου "end", δεν έχει radios, δείχνουμε μόνο μήνυμα 
    if (question.type === "end") {
      if (question.id === "end_reject") {
        // απόρριψη
        skipToEnd(question.text);
      } else if (question.id === "end_success") {
        // επιτυχία
        submitForm(question.text);
      } else {
        // generic end, αν χρειαστεί
        skipToEnd(question.text);
      }
      return;
    }

    //  Κανονική ερώτηση 
    $("#nextQuestion").show();
    if (questionHistory.length > 1) {
      $("#backButton").show();
    } else {
      $("#backButton").hide();
    }

    var questionElement = document.createElement("div");

    // Helper για να φτιάχνει τα options
    function renderOptions(q) {
      return q.possible_answers
        .map(
          (answer, index) => `
          <div class='govgr-radios__item'>
            <label class='govgr-label govgr-radios__label'>
              ${answer.text}
              <input
                class='govgr-radios__input'
                type='radio'
                name='question-option'
                value='${index + 1}'
              />
            </label>
          </div>
        `
        )
        .join("");
    }

    if (noError) {
      // Κανονική εμφάνιση
      questionElement.innerHTML = `
        <div class='govgr-field'>
          <fieldset class='govgr-fieldset' aria-describedby='radio-country'>
            <legend role='heading' aria-level='1'
                    class='govgr-fieldset__legend govgr-heading-l'>
              ${question.text}
            </legend>
            <div class='govgr-radios' id='radios-${questionId}'>
              <ul>
                ${renderOptions(question)}
              </ul>
            </div>
          </fieldset>
        </div>
      `;
    } else {
      // Εμφάνιση με error (δεν έχει επιλέξει τίποτα)
      questionElement.innerHTML = `
        <div class='govgr-field govgr-field__error' id='$id-error'>
          <legend role='heading' aria-level='1'
                  class='govgr-fieldset__legend govgr-heading-l'>
            ${question.text}
          </legend>
          <fieldset class='govgr-fieldset' aria-describedby='radio-error'>
            <legend class='govgr-fieldset__legend govgr-heading-m language-component'
                    data-component='chooseAnswer'>
              Επιλέξτε την απάντησή σας
            </legend>
            <p class='govgr-hint language-component' data-component='oneAnswer'>
              Μπορείτε να επιλέξετε μόνο μία επιλογή.
            </p>
            <div class='govgr-radios' id='radios-${questionId}'>
              <p class='govgr-error-message'>
                <span class='govgr-visually-hidden language-component'
                      data-component='errorAn'>Λάθος:</span>
                <span class='language-component' data-component='choose'>
                  Πρέπει να επιλέξετε μια απάντηση
                </span>
              </p>
              ${renderOptions(question)}
            </div>
          </fieldset>
        </div>
      `;

      // μεταφράζουμε το error block όταν είμαστε στα αγγλικά
      if (currentLanguage === "english") {
        var components = Array.from(
          questionElement.querySelectorAll(".language-component")
        );
        components.slice(-4).forEach(function (component) {
          var componentName = component.dataset.component;
          component.textContent =
            languageContent[currentLanguage][componentName];
        });
      }
    }

    $(".question-container").html(questionElement);

    // επαναφέρουμε τυχόν προηγούμενη επιλογή για αυτή την ερώτηση
    var prevIndex = userAnswers[questionId];
    if (prevIndex) {
      $('input[name="question-option"][value="' + prevIndex + '"]').prop(
        "checked",
        true
      );
    }
  }

  function skipToEnd(message) {
    const errorEnd = document.createElement("h5");
    // const error =
    //   currentLanguage === "greek"
    //     ? "Λυπούμαστε αλλά δεν μπορείτε να αιτηθείτε για απόδοση αριθμού Μητρώου Ιατρού Εργασίας. "
    //     : "We are sorry but you are not eligible to apply for a registration number in the Register of Occupational Doctors. ";
    errorEnd.className = "govgr-error-summary";
    errorEnd.textContent = message;
    $(".question-container").html(errorEnd);
    hideFormBtns();
  }

  $("#startBtn").click(function () {
    $("#intro").html("");
    $("#languageBtn").hide();
    $("#questions-btns").show();
  });

  function collectSelectedEvidenceIds() {
    var idsSet = new Set();

    // Χρησιμοποιούμε τις ελληνικές ερωτήσεις (έχουν το related_evidence)
    Object.keys(userAnswers).forEach(function (qId) {
      var q = questionsById[qId];
      if (!q || !Array.isArray(q.possible_answers)) return;

      var selectedIndex = userAnswers[qId]; 
      var answer = q.possible_answers[selectedIndex - 1];
      if (!answer || !Array.isArray(answer.related_evidence)) return;

      answer.related_evidence.forEach(function (rel) {
        if (rel.evidence_id) {
          idsSet.add(rel.evidence_id); 
        }
      });
    });

    return Array.from(idsSet); // μοναδική λίστα evidence_id
  }

  function renderEvidenceList(evidenceIds) {
    if (!evidenceIds || evidenceIds.length === 0) {
      return null;
    }

    // Επιλογή map ανά γλώσσα
    var map =
      currentLanguage === "greek" ? evidenceById : evidenceById_en;

    var evidenceListElement = document.createElement("ol");
    evidenceListElement.setAttribute("id", "evidences");

    evidenceIds.forEach(function (eid) {
      var ev = map[eid];
      if (!ev) return; // αν κάποιο id δεν υπάρχει στο cpsv, το αγνοούμε

      var li = document.createElement("li");

      var title = document.createElement("strong");
      title.textContent = ev.name;
      li.appendChild(title);

      if (ev.description) {
        var desc = document.createElement("p");
        desc.textContent = ev.description;
        li.appendChild(desc);
      }

      evidenceListElement.appendChild(li);
    });

    return evidenceListElement;
  }

  function submitForm(message) {
    const resultWrapper = document.createElement("div");
    resultWrapper.setAttribute("id", "resultWrapper");

    const titleText =
      currentLanguage === "greek"
        ? "Είστε δικαιούχος!"
        : "You are eligible!";

    resultWrapper.innerHTML = `<h1 class='answer'>${titleText}</h1><p>${message}</p>`;
    $(".question-container").html(resultWrapper);

    // Μαζεύουμε όλα τα related_evidence από τις διαδρομές του χρήστη
    var evidenceIds = collectSelectedEvidenceIds();

    if (evidenceIds.length > 0) {
      var headingText =
        currentLanguage === "greek"
          ? "Με βάση τις απαντήσεις σας, τα βασικά δικαιολογητικά που σχετίζονται με την αίτηση είναι:"
          : "Based on your answers, the main supporting documents related to your application are:";

      var heading = document.createElement("h5");
      heading.className = "answer";
      heading.textContent = headingText;
      $(".question-container").append(heading);

      var listEl = renderEvidenceList(evidenceIds);
      if (listEl) {
        $(".question-container").append(listEl);
      }
    }

    hideFormBtns();
  }

  $("#nextQuestion").click(function () {
    // if ($(".govgr-radios__input").is(":checked")) {
    //   var selectedRadioButtonIndex =
    //     $('input[name="question-option"]').index(
    //       $('input[name="question-option"]:checked')
    //     ) + 1;
    //   console.log(selectedRadioButtonIndex);
    //   //KNOCKOUTS
    //   if (currentQuestion === 0 && selectedRadioButtonIndex === 2) {
    //     currentQuestion = -1;
    //     currentLanguage === "greek" ? skipToEnd("Θα πρέπει πρώτα να δημιουργήσετε λογαριασμό στην Ενιαία Ψηφιακή Πύλη δημόσιας διοίκησης (hli.gov.gr). ") : skipToEnd("You must first create an account in the digital portal hli.gov.gr. ");
    //   } else if (currentQuestion === 1 && selectedRadioButtonIndex === 1) {
    //     currentQuestion = -1;
    //     currentLanguage === "greek" ? skipToEnd("Αποτελεί απαραίτητη προϋπόθεση να επισυνάψετε στην αίτησή σας το πτυχίο Ιατρικής που αποκτήσατε.") : skipToEnd("It is essential that you attach your medical degree to your application.");
    //   } else if (currentQuestion === 2 && selectedRadioButtonIndex === 1) {
    //     currentQuestion = -1;
    //     currentLanguage === "greek" ? skipToEnd("Αποτελεί απαραίτητη προϋπόθεση ο αιτών ιατρός να είναι εγγεγραμμένος σε Ιατρικό Σύλλογο και αυτό να πιστοποιείται με αντίστοιχη βεβαίωση.") : skipToEnd("The Applicant Physician should be registered in a Medical Association and this must be certified with a corresponding Certificate.");
    //   } else if (currentQuestion === 3 && selectedRadioButtonIndex === 1) {
    //     currentQuestion = -1;
    //     currentLanguage === "greek" ? skipToEnd("Ο αιτών Ιατρός θα πρέπει να κατέχει την Ειδικότητα της Ιατρικής της Εργασίας και να φέρει την αντίστοιχη Βεβαίωση.") : skipToEnd("The Applicant Physician should possess the Speciality of Occupational Medicine and have the corresponding Attestation.");
    //   }
    //   else {
    //     //save selectedRadioButtonIndex to the storage
    //     userAnswers[currentQuestion] = selectedRadioButtonIndex;
    //     sessionStorage.setItem(
    //       "answer_" + currentQuestion,
    //       selectedRadioButtonIndex
    //     ); // save answer to session storage

    //     //if the questions are finished then...
    //     if (currentQuestion + 1 == totalQuestions) {
    //       submitForm();
    //     }
    //     // otherwise...
    //     else {
    //       currentQuestion++;
    //       loadQuestion(currentQuestion, true);

    //       if (currentQuestion + 1 == totalQuestions) {
    //         currentLanguage === "greek"
    //           ? $(this).text("Υποβολή")
    //           : $(this).text("Submit");
    //       }
    //     }
    //   }
    // } else {
    //   loadQuestion(currentQuestion, false);
    // }

    // αν δεν έχει επιλέξει τίποτα, τότε error state
    if (!$(".govgr-radios__input").is(":checked")) {
      loadQuestion(currentQuestionId, false);
      return;
    }

    // βρίσκουμε ποια επιλογή επέλεξε (index 1,2,3,...)
    var selectedIndex =
      $('input[name="question-option"]').index(
        $('input[name="question-option"]:checked')
      ) + 1;

    var question = getQuestionById(currentQuestionId);
    var answer = question.possible_answers[selectedIndex - 1];

    // αποθηκεύουμε την επιλογή (για back / για evidences αργότερα)
    userAnswers[currentQuestionId] = selectedIndex;
    sessionStorage.setItem(
      "answer_" + currentQuestionId,
      selectedIndex
    );

    var nextId = answer.next_step;

    if (!nextId) {
      // Αν για κάποιο λόγο δεν έχει next_step, σταματάμε εδώ
      hideFormBtns();
      return;
    }

    // Προχωράμε στον επόμενο κόμβο (μπορεί να είναι q2 ή end_*)
    currentQuestionId = nextId;
    questionHistory.push(currentQuestionId);
    loadQuestion(currentQuestionId, true);
  });

  $("#backButton").click(function () {
    if (questionHistory.length > 1) {
      // βγάζουμε το τρέχον
      questionHistory.pop();
      // το προηγούμενο γίνεται current
      currentQuestionId = questionHistory[questionHistory.length - 1];
      loadQuestion(currentQuestionId, true);
    }
  });

  $("#languageBtn").click(function () {
    toggleLanguage();
    loadFaqs();
    // if is false only when the user is skipedToEnd and trying change the language
    if (currentQuestionId) {
      loadQuestion(currentQuestionId, true);
    }
  });

  $("#questions-btns").hide();

  // Get all questions
  getQuestions().then(() => {
    // Get all evidences
    getEvidences().then(() => {
      // Get all faqs 
      getFaq().then(() => {
        // Code inside this block executes only after all data is fetched
        // load  faqs and the first question on page load
        loadFaqs();
        $("#faqContainer").show();
        if (currentQuestionId) {
          loadQuestion(currentQuestionId, true);
        }
      });
    });
  });
});
