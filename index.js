let signupStarted = false;

document.addEventListener("DOMContentLoaded", () => {
  initializeRoleSwitching();
  initializeStepButtons();
});

function initializeRoleSwitching() {
  const buttons = document.querySelectorAll(".button");
  const boxes = document.querySelectorAll(".content-box");
  const breadcrumb = document.querySelector(".breadcrumb");

  const defaultRole = "writer";
  document.querySelector(`[data-role="${defaultRole}"]`)?.classList.add("active-role");
  showBoxForRole(defaultRole, boxes, breadcrumb);

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const role = button.getAttribute("data-role");

      if (signupStarted && role !== "writer") {
        alert("You cannot switch roles after starting signup.");
        return;
      }

      buttons.forEach(btn => btn.classList.remove("active-role"));
      button.classList.add("active-role");

      showBoxForRole(role, boxes, breadcrumb);
    });
  });
}

function showBoxForRole(role, boxes, breadcrumb) {
  boxes.forEach(box => {
    box.classList.remove("active");
    box.style.display = "none";
  });

  const selectedBox = document.getElementById(`${role}-wrapper`);
  if (!selectedBox) return;

  selectedBox.classList.add("active");
  selectedBox.style.display = "block";

  showStep(selectedBox, 1);

  if (breadcrumb) breadcrumb.textContent = `Signup > ${capitalize(role)}`;
}

function initializeStepButtons() {
  document.querySelectorAll(".step-1 .continue-button").forEach(btn => {
    btn.addEventListener("click", function () {
      const wrapper = this.closest(".content-box");
      goToStep2(wrapper);
    });
  });

  document.querySelectorAll(".step-2 .continue-button").forEach(btn => {
    btn.addEventListener("click", function () {
      const wrapper = this.closest(".content-box");
      goToStep3(wrapper);
    });
  });

  document.querySelectorAll(".step-3 .continue-button").forEach(btn => {
    btn.addEventListener("click", () => goToFinalPage(true));
  });

  document.querySelectorAll(".skip-button").forEach(btn => {
    btn.addEventListener("click", () => goToFinalPage(false));
  });
}

function goToStep2(wrapper) {
  const role = getRoleFromWrapper(wrapper);
  const email = wrapper.querySelector(`#${role}-email`)?.value.trim();
  const password = wrapper.querySelector(`#${role}-password`)?.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !password) return alert("Please enter both Email and Password.");
  if (!emailPattern.test(email)) return alert("Please enter a valid email address.");

  // ✅ Send OTP request to backend
  fetch('https://otp-backend-yrd4.onrender.com/send-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("OTP sent to your email.");

        // ✅ Mark signup started and show next step
        signupStarted = true;
        showStep(wrapper, 2);

        document.querySelector(".breadcrumb").textContent = `Signup > ${capitalize(role)} > OTP`;
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    })
    .catch(error => {
      console.error("OTP sending failed:", error);
      alert("An error occurred while sending OTP.");
    });
}



function goToStep3(wrapper) {
  const role = getRoleFromWrapper(wrapper);
  const email = wrapper.querySelector(`#${role}-email`)?.value.trim();
  const otp = wrapper.querySelector(`#${role}-otp`)?.value.trim();

  if (!otp) return alert("Please enter the OTP sent to your email.");

  fetch('https://otp-backend-yrd4.onrender.com/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showStep(wrapper, 3);
        document.querySelector(".breadcrumb").textContent = `Signup > ${capitalize(role)} > OTP > Details`;
        document.querySelector(".breadcrumb-step-3")?.style?.setProperty('display', 'block');
      } else {
        alert("Invalid OTP. Please try again.");
      }
    })
    .catch(err => {
      console.error("OTP verification failed:", err);
      alert("Something went wrong.");
    });
}



function goToFinalPage(validate = true) {
  const activeWrapper = document.querySelector(".content-box.active");
  const role = getRoleFromWrapper(activeWrapper);
  const fullname = activeWrapper?.querySelector(`#${role}-fullname`)?.value.trim() || "";
  const phone = activeWrapper?.querySelector(`#${role}-phone`)?.value.trim() || "";

  if (validate) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!fullname || !phone) return alert("Please enter both Name and Mobile No.");
    if (!phoneRegex.test(phone)) return alert("Please enter a valid 10-digit Mobile No.");
  } else {
    const bothEmpty = fullname === "" && phone === "";
    const bothFilled = fullname !== "" && phone !== "";
    if (!bothEmpty && !bothFilled) {
      return alert("Please fill both Name and Mobile No. or leave both empty.");
    }
  }

  document.querySelector(".container").style.display = "none";

  if (role === "writer") {
    document.getElementById("final-page").style.display = "flex";
  } else if (role === "reader") {
    document.getElementById("reader-dashboard").style.display = "flex";
    hideAllDashboardSections();
    document.getElementById("reader-explore-page").style.display = "block";
    document.getElementById("reader-dashboard")?.classList.remove("white-bg");
  } else if (role === "expert") {
    document.getElementById("expert-dashboard").style.display = "flex";
    hideAllDashboardSections();
    document.getElementById("expert-explore-page").style.display = "block";
  } else if (role === "client") {
    document.getElementById("client-dashboard").style.display = "flex";
    hideAllDashboardSections();
    document.getElementById("client-explore-page").style.display = "block";
  }
}




function showStep(wrapper, stepNumber) {
  const steps = wrapper.querySelectorAll(".step-1, .step-2, .step-3");
  steps.forEach((step, idx) => {
    step.style.display = (idx === stepNumber - 1) ? "flex" : "none";
  });

  const continueBtn = wrapper.querySelector(`.step-${stepNumber} .continue-button`);
  if (continueBtn) continueBtn.style.display = "block";
}

// Dashboard Navigation
function showExplore() {
  document.querySelector('.main-content').style.display = 'block';
  hideAllDashboardSections();
  document.getElementById('final-page').style.backgroundColor = 'white';
}

function showDashboard() {
  document.querySelector('.main-content').style.display = 'none';

  const role = getActiveRole();
  hideAllDashboardSections();

  if (role === "writer") {
    document.getElementById('dashboard-page').style.display = 'block';
    document.querySelector('.dashboard-content')?.style?.setProperty('display', 'block');
    document.querySelector('.final-page')?.classList?.add('white-bg');
  } else if (role === "reader") {
    document.getElementById('reader-dashboard-page')?.style?.setProperty('display', 'block');
  }
}

function showResourcesPage() {
  hideAllDashboardSections();
  document.getElementById('writer-resources-page').style.display = 'block';
  document.querySelector('.final-page')?.classList?.add('white-bg');
  document.querySelector('.main-content')?.style?.setProperty('display', 'none');

}

function showPortfolioPage() {
  hideAllDashboardSections();

  const activeRole = getActiveRole();

  // Show reader or writer wrapper accordingly
  if (activeRole === 'reader') {
    document.getElementById('reader-dashboard')?.style?.setProperty('display', 'flex');
  } else if (activeRole === 'writer') {
    document.getElementById('final-page')?.style?.setProperty('display', 'flex');
  } else if (activeRole === 'expert') {
    document.getElementById('expert-dashboard')?.style?.setProperty('display', 'flex');
  } else if (activeRole === 'client') {
    document.getElementById('client-dashboard')?.style?.setProperty('display', 'flex');
  }

  document.getElementById('portfolio-page').style.display = 'block';
  document.querySelector('.final-page')?.classList?.remove('white-bg');
}


function hideAllDashboardSections() {
  document.getElementById('dashboard-page')?.style?.setProperty('display', 'none');
  document.getElementById('reader-dashboard-page')?.style?.setProperty('display', 'none');
  document.getElementById('resources-page')?.style?.setProperty('display', 'none');
  document.getElementById('writer-resources-page')?.style?.setProperty('display', 'none');
  document.getElementById('reader-explore-page')?.style?.setProperty('display', 'none');
  document.getElementById('portfolio-page')?.style?.setProperty('display', 'none');
  document.getElementById('create-page')?.style?.setProperty('display', 'none');
  document.getElementById('writer-settings-page')?.style?.setProperty('display', 'none');
  document.getElementById('expert-settings-page')?.style?.setProperty('display', 'none');
  document.getElementById('client-settings-page')?.style?.setProperty('display', 'none'); // ✅ NEW
  document.getElementById('client-explore-page')?.style?.setProperty('display', 'none');
  document.getElementById('client-dashboard-preview')?.style?.setProperty('display', 'none');

  document.querySelector('.main-content')?.style?.setProperty('display', 'none');
}




// Utility functions
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRoleFromWrapper(wrapper) {
  return wrapper.id.replace("-wrapper", "");
}

function updateKeyword(value) {
  document.getElementById("search-keyword").textContent = value || "KEYWORD";
}

function getActiveRole() {
  const activeBox = document.querySelector(".content-box.active");
  return activeBox ? getRoleFromWrapper(activeBox) : "writer";
}

// Fixed Single showReaderDashboard
function showReaderDashboard() {
  hideAllDashboardSections();
  document.getElementById('reader-explore-page').style.display = 'none';
  document.getElementById('reader-dashboard-page').style.display = 'block';

  // ✅ Ensure background white when dashboard shows
  const finalPageContainer = document.getElementById('reader-dashboard');
  finalPageContainer?.classList.add('white-bg');
}

// Reader Explore (Optional, uncomment if needed)
// function showReaderResources() {
//   hideAllDashboardSections();
//   document.getElementById('reader-explore-page').style.display = 'block';
// }

function showPage(pageId) {
  // Hide all main content pages first
  document.querySelectorAll('.main-contents').forEach(page => {
    page.style.display = 'none';
  });

  // Also hide the explore page if switching to create
  document.getElementById('reader-explore-page')?.style?.setProperty('display', 'none');

  // Show the selected page
  const selectedPage = document.getElementById(`${pageId}-page`);
  if (selectedPage) {
    selectedPage.style.display = 'block';
  }

  // Set background based on page
  const finalPageContainer = document.getElementById('reader-dashboard');
  if (pageId === 'create') {
    finalPageContainer?.classList.add('white-bg');
  } else {
    finalPageContainer?.classList.remove('white-bg');
  }
}

function completeReaderSignup() {
  document.querySelector('.container').style.display = 'none'; // hide signup container
  document.getElementById('reader-dashboard').style.display = 'flex'; // show reader dashboard
  document.getElementById('reader-explore-page').style.display = 'block'; // default page
}

function showReaderExplore() {
  hideAllDashboardSections();
  document.getElementById('reader-explore-page').style.display = 'block';

  // ❌ Ensure black background
  const finalPageContainer = document.getElementById('reader-dashboard');
  finalPageContainer?.classList.remove('white-bg'); // <-- this line is the key
}
function showWriterSettingsPage() {
  hideAllDashboardSections();
  document.getElementById('writer-settings-page').style.display = 'block';
  document.getElementById('final-page')?.style?.setProperty('display', 'flex');
  document.querySelector('.main-content')?.style?.setProperty('display', 'none');
  document.getElementById('final-page')?.classList?.add('white-bg');
}


function showExpertExplore() {
  hideAllDashboardSections();
  document.getElementById('expert-explore-page').style.display = 'block';
}

function showClientExplore() {
  hideAllDashboardSections();
  document.getElementById('client-explore-page').style.display = 'block';
}
function showExpertSettingsPage() {
  hideAllDashboardSections();

  // ✅ Show the settings page
  document.getElementById('expert-settings-page').style.display = 'block';

  // ✅ Make sure the expert dashboard wrapper is visible
  document.getElementById('expert-dashboard')?.style?.setProperty('display', 'flex');

  // ✅ Add white background to the wrapper
  document.getElementById('expert-dashboard')?.classList?.add('white-bg');

  // ✅ Hide explore page in case it's still visible
  document.getElementById('expert-explore-page')?.style?.setProperty('display', 'none');
}
function showClientSettingsPage() {
  hideAllDashboardSections();

  // ✅ Show the settings page
  document.getElementById('client-settings-page')?.style?.setProperty('display', 'block');

  // ✅ Ensure the client-dashboard wrapper is visible
  document.getElementById('client-dashboard')?.style?.setProperty('display', 'flex');

  // ✅ Add white background
  document.getElementById('client-dashboard')?.classList?.add('white-bg');

  // ✅ Hide explore page to avoid overlay
  document.getElementById('client-explore-page')?.style?.setProperty('display', 'none');
}
function showClientDashboard() {
  hideAllDashboardSections();

  const dashboardWrapper = document.getElementById('client-dashboard');
  const dashboardPreview = document.getElementById('client-dashboard-preview');

  dashboardWrapper.style.display = 'flex';
  dashboardPreview.style.display = 'block';

  // ✅ Ensure white background when clicking Dashboard first
  dashboardWrapper.classList.add('white-bg');
}






