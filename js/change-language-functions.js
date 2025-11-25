var languageContent = {
    greek: {
      languageBtn: "EL",
      mainTitle: "Απόδοση αριθμού Μητρώου Ιατρού Εργασίας",
      pageTitle: "Απόδοση αριθμού Μητρώου Ιατρού Εργασίας",
      infoTitle: "Πληροφορίες για την απόδοση αριθμού Μητρώου Ιατρού Εργασίας",
      subTitle1: "Αυτό το ερωτηματολόγιο μπορεί να σας βοηθήσει να βρείτε πληροφορίες για την αίτηση απόδοσης αριθμού Μητρώου Ιατρού Εργασίας.",
      subTitle2: "H συμπλήρωση του ερωτηματολογίου δεν απαιτεί παραπάνω από 10 λεπτά.",
      subTitle3: "Δεν θα αποθηκεύσουμε ούτε θα μοιραστούμε τις απαντήσεις σας.",
      backButton: "Πίσω",
      nextQuestion: "Επόμενη ερώτηση",
      biggerCursor: "Μεγαλύτερος Δρομέας",
      bigFontSize: "Μεγάλο Κείμενο",
      readAloud: "Ανάγνωση",
      changeContrast: "Αντίθεση",
      readingMask: "Μάσκα Ανάγνωσης",
      footerText: "Αυτό το έργο δημιουργήθηκε στα πλαίσια της εργασίας του μαθήματος «Ηλεκτρονική Διακυβέρνηση» κατά τη διάρκεια των προπτυχιακών μας σπουδών στο Πανεπιστήμιο Μακεδονίας. Η ομάδα μας αποτελείται από 2 φοιτητές της Εφαρμοσμένης Πληροφορικής:",
      and: "και",
      student1: "Κραλίδης Λεωνίδας",
      student2: "Αλεξινάκης Γεώργιος",
      startBtn:"Ας ξεκινήσουμε",
      chooseAnswer: "Επιλέξτε την απάντησή σας",
      oneAnswer: "Μπορείτε να επιλέξετε μόνο μία επιλογή.",
      errorAn: "Λάθος:",
      choose: "Πρέπει να επιλέξετε μια απάντηση",
    },
    english: {
      languageBtn: "EN",
      mainTitle: "Granting of a registration number in the Register of Occupational Doctors",
      pageTitle: "Granting of a registration number in the Register of Occupational Doctors",
      infoTitle: "Information on applying for a registration number in the Register of Occupational Doctors.",
      subTitle1: "This questionnaire can help you find information on applying for a registration number in the Register of Occupational Doctors.",
      subTitle2: "Completing the questionnaire should not take more than 10 minutes.",
      subTitle3: "We will neither store nor share your answers.",
      backButton: "Βack",
      nextQuestion: "Next Question",
      biggerCursor: "Bigger Cursor",
      bigFontSize:" Big Font Size",
      readAloud: "Read Aloud",
      changeContrast:" Change Contrast",
      readingMask:" Reading Mask",
      footerText: "This project was created as part of an exercise in the course «e-Government». Our team consists of 2 students of Applied Informatics:",
      and: "and",
      student1: "Kralidis Leonidas",
      student2: "Alexinakis Georgios",
      startBtn:"Let's start",
      chooseAnswer: "Choose your answer",
      oneAnswer: "You can choose only one option.",
      errorAn: "Error:",
      choose: "You must choose one option",
    }
};

/*
ΚΟΜΜΑΤΙ ΤΟΥ ΜΕΡΟΥΣ Β
*/
//Χρησιμοποιούμε το Mitos api για να γεμίσουμε τους τίτλους και την περιγραφή
function applyMitosServiceToLanguageContent(service) {
  if (!service || !service.metadata || !service.metadata.process) {
    return;
  }

  const proc = service.metadata.process;
  const officialTitle = proc.official_title || "";
  const applicationDescription =
    proc.application_description || proc.description || "";

  // Ελληνικά
  if (officialTitle) {
    languageContent.greek.mainTitle = officialTitle;
    languageContent.greek.pageTitle = officialTitle;
    languageContent.greek.infoTitle = "Πληροφορίες για: " + officialTitle;

    languageContent.greek.subTitle1 =
      "Αυτό το ερωτηματολόγιο μπορεί να σας βοηθήσει να βρείτε πληροφορίες για τη διαδικασία «" +
      officialTitle +
      "».";
  }

  // Αγγλικά – εδώ, προσωρινά χρησιμοποιούμε τον ελληνικό τίτλο
  if (officialTitle) {
    languageContent.english.mainTitle = officialTitle;
    languageContent.english.pageTitle = officialTitle;
    languageContent.english.infoTitle =
      "Information about the procedure: " + officialTitle;

    languageContent.english.subTitle1 =
      'This questionnaire can help you find information about the procedure "' +
      officialTitle +
      '".';
  }
}

/*
ΤΕΛΟΣ ΚΟΜΜΑΤΙ ΤΟΥ ΜΕΡΟΥΣ Β
*/

// Retrieve the selected language from localStorage or set default to "greek"
var currentLanguage = localStorage.getItem("preferredLanguage") || "greek";

function toggleLanguage() {
    currentLanguage = currentLanguage === "greek" ? "english" : "greek";
    localStorage.setItem("preferredLanguage", currentLanguage);
    updateContent();
}

function updateContent() {
    var components = document.querySelectorAll(".language-component");
     
    components.forEach(function (component) {
        var componentName = component.dataset.component;
        component.textContent = languageContent[currentLanguage][componentName];
    });
}

// Initialize the content based on the selected language
updateContent();