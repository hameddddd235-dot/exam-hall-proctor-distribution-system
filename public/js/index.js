const tabs = document.querySelectorAll(".nav-tab");
const pages = document.querySelectorAll(".page");
const fileInputs = document.querySelectorAll(".upload-input");

let loadingState = "loading";
let currentLanguage = localStorage.getItem("siteLanguage") || "en";

const observerInputs = [
  document.getElementById("observer-file"),
  document.getElementById("hall-period-file"),
  document.getElementById("hall-capacity-file"),
];
const observerButtons = document.querySelectorAll(".observer-actions button");
const convertInput = document.getElementById("hall-period");
const convertButton = document.querySelector(".convert-actions button");
const generatePdfButtons = document.querySelectorAll(".generate-pdf-btn");
const generateExcelButton = document.querySelector(".generate-excel-btn");

const loadingTitle = document.getElementById("loading-title");
const loadingSpinner = document.getElementById("loading-spinner");
const loadingText = document.getElementById("loading-text");
const downloadLinks = document.getElementById("download-links");
const monitorsPdfLink = document.getElementById("monitors-pdf-link");
const hallsPdfLink = document.getElementById("halls-pdf-link");
const excelLink = document.getElementById("excel-link");
const collegesPdfLinks = document.getElementById("colleges-pdf-links");
const collegesList = document.getElementById("colleges-list");
const monitorsPdfDownload = document.getElementById("monitors-pdf-download");
const hallsPdfDownload = document.getElementById("halls-pdf-download");
const excelDownload = document.getElementById("excel-download");

const translations = {
  loading: {
    ar: {
      title: "جاري معالجة ملفك...",
      text: "يرجى الانتظار",
    },
    en: {
      title: "Processing your file...",
      text: "Please wait",
    },
  },
  done: {
    ar: {
      title: "تمت معالجة الملفات",
      text: "",
    },
    en: {
      title: "Files Processing Done",
      text: "",
    },
  },
  error: {
    ar: {
      title: "خطأ!",
      text: "حدث خطأ أثناء معالجة الملفات. يرجى المحاولة مرة أخرى.",
    },
    en: {
      title: "Error!",
      text: "An error occurred while processing files. Please try again.",
    },
  },
};

function isObserverPageVisible() {
  return document.getElementById("observer-page")?.style.display === "block";
}

function isConvertPageVisible() {
  return document.getElementById("convert-page")?.style.display === "block";
}

function updateObserverButtons() {
  const allFilled = observerInputs.every((input) => input?.files?.length > 0);
  observerButtons.forEach((button) => {
    button.disabled = !allFilled;
  });
}

function updateConvertButton() {
  if (convertButton) {
    convertButton.disabled = !convertInput?.files?.length;
  }
}

function getNoFileText() {
  return currentLanguage === "ar" ? "لم يتم اختيار ملف" : "No file selected";
}

function updateFileDisplay(input, file) {
  const fileNameSpan = input.parentElement.querySelector(".upload-filename");
  const icon = input.parentElement.querySelector(".upload-icon");

  if (!file) {
    fileNameSpan.textContent = getNoFileText();
    fileNameSpan.classList.remove("upload");
    if (icon) icon.textContent = "📄";
    return;
  }

  fileNameSpan.textContent = file.name;
  fileNameSpan.classList.add("upload");

  if (icon) {
    icon.classList.add("animate-change");
    icon.textContent = "✔";
    icon.addEventListener(
      "animationend",
      () => icon.classList.remove("animate-change"),
      { once: true },
    );
  }
}

function openPage(page) {
  pages.forEach((pageNode) => {
    pageNode.style.display = "none";
  });

  const currentPage = document.getElementById(`${page}-page`);
  if (currentPage) currentPage.style.display = "block";

  if (["observer", "convert", "howtouse"].includes(page)) {
    tabs.forEach((tab) => tab.classList.remove("active"));
    const activeTab = document.querySelector(`.nav-tab a[href="#${page}"]`);
    if (activeTab) {
      activeTab.parentElement.classList.add("active");
      window.location.hash = page;
    }
  }

  updateObserverButtons();
  updateConvertButton();
  switchLanguage();
}

function setLoadingContent(state, customMessage) {
  const copy = translations[state][currentLanguage];
  loadingTitle.textContent = copy.title;
  loadingText.textContent = customMessage || copy.text;
  loadingText.style.color = state === "error" ? "#ff6b6b" : "";
}

function resetDownloadLinks() {
  monitorsPdfLink.style.display = "none";
  hallsPdfLink.style.display = "none";
  excelLink.style.display = "none";
  collegesPdfLinks.style.display = "none";
  collegesList.innerHTML = "";
}

function resetLoadingPage() {
  loadingState = "loading";
  setLoadingContent("loading");
  loadingSpinner.style.display = "block";
  loadingText.style.display = "block";
  downloadLinks.style.display = "none";
  resetDownloadLinks();
}

function showDownloadLinks(data) {
  loadingState = "done";
  setLoadingContent("done");
  loadingSpinner.style.display = "none";
  loadingText.style.display = "none";
  downloadLinks.style.display = "block";

  if (data.monitorsPdf) {
    monitorsPdfLink.style.display = "block";
    monitorsPdfDownload.href = data.monitorsPdf;
  }

  if (data.hallsPdf) {
    hallsPdfLink.style.display = "block";
    hallsPdfDownload.href = data.hallsPdf;
  }

  if (data.excelFile) {
    excelLink.style.display = "block";
    excelDownload.href = data.excelFile;
  }

  if (Array.isArray(data.collegePdfs) && data.collegePdfs.length) {
    collegesPdfLinks.style.display = "block";
    collegesList.innerHTML = "";

    data.collegePdfs.forEach((college) => {
      const wrapper = document.createElement("div");
      const link = document.createElement("a");
      link.href = college.path;
      link.target = "_blank";
      link.className = "download-link";
      link.textContent =
        currentLanguage === "ar"
          ? `تحميل ${college.college}`
          : `Download ${college.college}`;
      wrapper.appendChild(link);
      collegesList.appendChild(wrapper);
    });
  }
}

function showError(message) {
  loadingState = "error";
  setLoadingContent("error", message);
  loadingSpinner.style.display = "none";
  loadingText.style.display = "block";
  downloadLinks.style.display = "none";
}

async function parseError(response) {
  try {
    const data = await response.json();
    return data.message || translations.error[currentLanguage].text;
  } catch (error) {
    return translations.error[currentLanguage].text;
  }
}

function buildObserverFormData() {
  const formData = new FormData();
  formData.append("monitorsFile", observerInputs[0].files[0]);
  formData.append("periodsFile", observerInputs[1].files[0]);
  formData.append("hallsCapacityFile", observerInputs[2].files[0]);
  return formData;
}

function buildConvertFormData() {
  const formData = new FormData();
  formData.append("excelFile", convertInput.files[0]);
  return formData;
}

async function submitFiles(url, formData) {
  resetLoadingPage();
  openPage("loading-pdf");

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const result = await response.json();
    showDownloadLinks(result);
  } catch (error) {
    console.error(error);
    showError(error.message || translations.error[currentLanguage].text);
  }
}

function switchLanguage() {
  const html = document.documentElement;
  const body = document.body;
  const isArabic = currentLanguage === "ar";

  html.setAttribute("dir", isArabic ? "rtl" : "ltr");
  body.style.direction = isArabic ? "rtl" : "ltr";

  document.querySelectorAll(".page").forEach((page) => {
    page.style.direction = isArabic ? "rtl" : "ltr";
  });

  document.querySelectorAll("[data-ar][data-en]").forEach((element) => {
    const nextText = element.getAttribute(isArabic ? "data-ar" : "data-en");
    if (!nextText) return;

    if (
      element.tagName === "LI" &&
      (nextText.includes("Generate PDF") || nextText.includes("Generate Excel"))
    ) {
      element.innerHTML = nextText.replace(
        /"([^"]+)"/g,
        '<strong>"$1"</strong>',
      );
      return;
    }

    element.textContent = nextText;
  });

  const globalLangText = document
    .getElementById("global-language-toggle")
    ?.querySelector(".lang-text");
  if (globalLangText) {
    globalLangText.textContent = isArabic ? "en" : "ar";
  }

  if (loadingState === "loading") {
    setLoadingContent("loading");
  } else if (loadingState === "done") {
    setLoadingContent("done");
  }

  fileInputs.forEach((input) => {
    if (!input.files.length) {
      updateFileDisplay(input, null);
    }
  });
}

fileInputs.forEach((input) => {
  const dropArea = input.closest(".upload-card");

  input.addEventListener("change", () => {
    updateFileDisplay(input, input.files[0] || null);
    updateObserverButtons();
    updateConvertButton();
  });

  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dropArea.classList.remove("drag-over");
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("drag-over");

    const files = event.dataTransfer.files;
    if (!files.length) return;

    input.files = files;
    updateFileDisplay(input, files[0]);
    updateObserverButtons();
    updateConvertButton();
  });
});

generatePdfButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (isObserverPageVisible()) {
      await submitFiles("/api/generate-pdf", buildObserverFormData());
      return;
    }

    if (isConvertPageVisible()) {
      await submitFiles("/api/upload-monitors-only", buildConvertFormData());
    }
  });
});

if (generateExcelButton) {
  generateExcelButton.addEventListener("click", async () => {
    if (!isObserverPageVisible()) return;
    await submitFiles("/api/generate-excel", buildObserverFormData());
  });
}

document
  .getElementById("global-language-toggle")
  ?.addEventListener("click", () => {
    currentLanguage = currentLanguage === "ar" ? "en" : "ar";
    localStorage.setItem("siteLanguage", currentLanguage);
    switchLanguage();
  });

document.getElementById("language-toggle")?.addEventListener("click", () => {
  currentLanguage = currentLanguage === "ar" ? "en" : "ar";
  localStorage.setItem("siteLanguage", currentLanguage);
  switchLanguage();
});

window.addEventListener("load", () => {
  const page = window.location.hash.replace("#", "") || "observer";
  openPage(page);
  switchLanguage();
});

window.openPage = openPage;
