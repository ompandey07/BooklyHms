/**
 * BookLy Login System - Frontend JavaScript
 * Handles user authentication with JWT tokens, validations, rate limiting, and security
 */

// ============================================================================
// CONFIGURATION AND CONSTANTS
// ============================================================================

const API_BASE_URL = "/auth/api";
const ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/register/`,
  LOGIN: `${API_BASE_URL}/login/`,
  LOGOUT: `${API_BASE_URL}/logout/`,
  CSRF_TOKEN: `${API_BASE_URL}/csrf-token/`,
};

// Rate limiting constants
const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: 300, // 5 minutes in seconds
};

// Password requirements display
const PASSWORD_REQUIREMENTS = [
  { id: "length", text: "At least 8 characters", regex: /.{8,}/ },
  { id: "uppercase", text: "One uppercase letter", regex: /[A-Z]/ },
  { id: "lowercase", text: "One lowercase letter", regex: /[a-z]/ },
  { id: "number", text: "One number", regex: /\d/ },
  {
    id: "special",
    text: "One special character",
    regex: /[!@#$%^&*(),.?":{}|<>]/,
  },
];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const authState = {
  isLoading: false,
  currentMode: "login", // 'login' or 'register'
  failedAttempts: 0,
  isLocked: false,
  lockoutTimeRemaining: 0,
  lockoutInterval: null,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show toast notification
 */
function showToast(message, type = "error") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const toastIcon = document.getElementById("toastIconContainer");

  toastMessage.textContent = message;
  toast.className = `toast ${type} show`;

  if (type === "success") {
    toastIcon.innerHTML = '<i class="ri-check-circle-line"></i>';
  } else if (type === "error") {
    toastIcon.innerHTML = '<i class="ri-error-warning-line"></i>';
  } else if (type === "warning") {
    toastIcon.innerHTML = '<i class="ri-alert-line"></i>';
  }

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

/**
 * Show full screen spinner
 */
function showFullScreenSpinner() {
  const spinner = document.getElementById("fullScreenSpinner");
  if (spinner) {
    spinner.classList.add("active");
  }
}

/**
 * Hide full screen spinner
 */
function hideFullScreenSpinner() {
  const spinner = document.getElementById("fullScreenSpinner");
  if (spinner) {
    spinner.classList.remove("active");
  }
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const results = {};
  PASSWORD_REQUIREMENTS.forEach((req) => {
    results[req.id] = req.regex.test(password);
  });
  return results;
}

/**
 * Check if all password requirements are met
 */
function isPasswordValid(password) {
  const results = validatePasswordStrength(password);
  return Object.values(results).every((result) => result === true);
}

/**
 * Update password strength indicator
 */
function updatePasswordStrengthIndicator(password) {
  const strengthElement = document.getElementById("passwordStrength");
  const requirementsList = document.getElementById("passwordRequirements");

  if (!strengthElement || !requirementsList) return;

  if (!password) {
    strengthElement.style.display = "none";
    return;
  }

  const results = validatePasswordStrength(password);
  const metCount = Object.values(results).filter((r) => r).length;
  const percentage = (metCount / PASSWORD_REQUIREMENTS.length) * 100;

  // Update progress bar
  strengthElement.style.display = "block";
  strengthElement.style.width = percentage + "%";

  // Update color based on strength
  if (percentage < 40) {
    strengthElement.style.background = "#ef4444"; // Red
  } else if (percentage < 80) {
    strengthElement.style.background = "#f59e0b"; // Orange
  } else {
    strengthElement.style.background = "#10b981"; // Green
  }

  // Update requirements checklist
  requirementsList.innerHTML = PASSWORD_REQUIREMENTS.map((req) => {
    const isMet = results[req.id];
    return `
            <div class="requirement ${isMet ? "met" : ""}">
                <i class="ri-${isMet ? "check-line" : "close-line"}"></i>
                <span>${req.text}</span>
            </div>
        `;
  }).join("");
}

/**
 * Create magic particles effect
 */
function createMagicParticles(x, y) {
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement("div");
    particle.className = "magic-particle";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.setProperty("--tx", (Math.random() - 0.5) * 300 + "px");
    particle.style.setProperty("--ty", (Math.random() - 0.5) * 300 + "px");
    particle.style.animation = `particle-effect 0.6s ease-out forwards`;
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 600);
  }
}

/**
 * Get CSRF token from server
 */
async function getCsrfToken() {
  try {
    const response = await fetch(ENDPOINTS.CSRF_TOKEN);
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error("Error getting CSRF token:", error);
    return null;
  }
}

// ============================================================================
// AUTHENTICATION API CALLS
// ============================================================================

/**
 * Register new user
 */
async function registerUser(email, password, passwordConfirm, username = "") {
  showFullScreenSpinner();

  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
        password_confirm: passwordConfirm,
        username: username.trim() || email.split("@")[0],
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Save tokens
      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);

      showToast("Registration successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "/auth/dashboard/";
      }, 1500);
    } else {
      const errorMessage = data.message || "Registration failed";
      showToast(errorMessage, "error");

      // Show field errors if available
      if (data.errors) {
        Object.entries(data.errors).forEach(([field, message]) => {
          console.error(`${field}: ${message}`);
        });
      }
    }
  } catch (error) {
    console.error("Registration error:", error);
    showToast("Registration failed. Please try again.", "error");
  } finally {
    hideFullScreenSpinner();
  }
}

/**
 * Login user with email and password
 */
async function loginUser(email, password, rememberMe = false) {
  showFullScreenSpinner();

  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
        remember_me: rememberMe,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Save tokens to localStorage
      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);

      // Save user info for dashboard
      localStorage.setItem("user_data", JSON.stringify(data.user));

      // Create particles effect
      const rect = document.querySelector(".login-btn").getBoundingClientRect();
      createMagicParticles(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );

      showToast("Login successful! Redirecting to dashboard...", "success");

      setTimeout(() => {
        window.location.href = "/auth/dashboard/";
      }, 1500);
    } else {
      // Handle rate limiting
      if (data.locked) {
        authState.isLocked = true;
        authState.lockoutTimeRemaining = data.lockout_time;
        authState.failedAttempts = RATE_LIMIT.MAX_ATTEMPTS;

        showRateLimitOverlay(data.lockout_time);
        showToast(`Account locked for ${data.lockout_time} seconds`, "error");
      } else {
        // Update attempt counter
        authState.failedAttempts =
          RATE_LIMIT.MAX_ATTEMPTS - (data.attempts_remaining || 0);
        showToast(data.message || "Login failed", "error");
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast("Login failed. Please try again.", "error");
  } finally {
    hideFullScreenSpinner();
  }
}

// ============================================================================
// RATE LIMITING UI
// ============================================================================

/**
 * Show rate limit overlay
 */
function showRateLimitOverlay(seconds) {
  const overlay = document.getElementById("rateLimitOverlay");
  const timer = document.getElementById("countdownTimer");

  if (!overlay) return;

  overlay.style.display = "flex";
  authState.lockoutTimeRemaining = seconds;

  // Clear previous interval if exists
  if (authState.lockoutInterval) {
    clearInterval(authState.lockoutInterval);
  }

  // Update timer every second
  authState.lockoutInterval = setInterval(() => {
    authState.lockoutTimeRemaining--;

    const minutes = Math.floor(authState.lockoutTimeRemaining / 60);
    const secs = authState.lockoutTimeRemaining % 60;
    timer.textContent = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (authState.lockoutTimeRemaining <= 0) {
      clearInterval(authState.lockoutInterval);
      overlay.style.display = "none";
      authState.isLocked = false;
      authState.failedAttempts = 0;
      showToast("Account unlocked. Please try again.", "success");
    }
  }, 1000);
}

// ============================================================================
// FORM HANDLING
// ============================================================================

/**
 * Handle login form submission
 */
async function handleLoginSubmit(e) {
  e.preventDefault();

  // Check if locked
  if (authState.isLocked) {
    showToast(
      `Account is locked. Please wait ${authState.lockoutTimeRemaining} seconds.`,
      "warning",
    );
    return;
  }

  authState.isLoading = true;

  // Get form values
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  // Validate inputs
  if (!email || !password) {
    showToast("Please enter email and password", "error");
    authState.isLoading = false;
    return;
  }

  if (!validateEmail(email)) {
    showToast("Invalid email format", "error");
    authState.isLoading = false;
    return;
  }

  // Attempt login
  await loginUser(email, password, rememberMe);
  authState.isLoading = false;
}

/**
 * Handle register form submission
 */
async function handleRegisterSubmit(e) {
  e.preventDefault();

  authState.isLoading = true;

  // Get form values
  const email = document.getElementById("registerEmail").value.trim();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value;
  const passwordConfirm = document.getElementById(
    "registerPasswordConfirm",
  ).value;

  // Validate inputs
  if (!email || !password || !passwordConfirm) {
    showToast("Please fill all required fields", "error");
    authState.isLoading = false;
    return;
  }

  if (!validateEmail(email)) {
    showToast("Invalid email format", "error");
    authState.isLoading = false;
    return;
  }

  if (password !== passwordConfirm) {
    showToast("Passwords do not match", "error");
    authState.isLoading = false;
    return;
  }

  if (!isPasswordValid(password)) {
    showToast("Password does not meet requirements", "error");
    authState.isLoading = false;
    return;
  }

  // Attempt registration
  await registerUser(email, password, passwordConfirm, username);
  authState.isLoading = false;
}

// ============================================================================
// FORM MODE SWITCHING
// ============================================================================

/**
 * Switch to login mode
 */
function switchToLogin() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  if (loginForm) {
    loginForm.style.display = "block";
    loginForm.classList.add("step-visible");
  }
  if (registerForm) {
    registerForm.style.display = "none";
    registerForm.classList.remove("step-visible");
  }
  if (loginTab) loginTab.classList.add("active");
  if (registerTab) registerTab?.classList.remove("active");

  authState.currentMode = "login";
}

/**
 * Switch to register mode
 */
function switchToRegister() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  if (loginForm) {
    loginForm.style.display = "none";
    loginForm.classList.remove("step-visible");
  }
  if (registerForm) {
    registerForm.style.display = "block";
    registerForm.classList.add("step-visible");
  }
  if (loginTab) loginTab.classList.remove("active");
  if (registerTab) registerTab?.classList.add("active");

  authState.currentMode = "register";
}

// ============================================================================
// PASSWORD VISIBILITY TOGGLE
// ============================================================================

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (input.type === "password") {
    input.type = "text";
    if (icon) icon.classList.remove("ri-eye-line");
    if (icon) icon.classList.add("ri-eye-off-line");
  } else {
    input.type = "password";
    if (icon) icon.classList.remove("ri-eye-off-line");
    if (icon) icon.classList.add("ri-eye-line");
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize on page load
 */
document.addEventListener("DOMContentLoaded", function () {
  // Set up event listeners
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const registerPasswordInput = document.getElementById("registerPassword");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }

  // Password strength indicator for register form
  if (registerPasswordInput) {
    registerPasswordInput.addEventListener("input", function () {
      updatePasswordStrengthIndicator(this.value);
    });
  }

  // Check if user is already logged in
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    // User is already logged in, redirect to dashboard
    window.location.href = "/auth/dashboard/";
  }

  // Set initial tab
  switchToLogin();
});
