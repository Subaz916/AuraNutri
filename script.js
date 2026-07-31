/* ==========================================================================
   AuraNutri — Core Application Engine (Vanilla Javascript)
   ========================================================================== */

(function () {
  'use strict';

  // Fallback initial food list (used if fetching data/foods.json is blocked by browser CORS policy)
  const FALLBACK_STARTER_FOODS = [
    { "name": "Whole Boiled Egg", "defaultQuantity": 1, "unit": "piece", "calories": 78, "protein": 6.3, "carbs": 0.6, "fat": 5.3, "category": "Breakfast", "icon": "🥚" },
    { "name": "Egg White", "defaultQuantity": 1, "unit": "piece", "calories": 17, "protein": 3.6, "carbs": 0.2, "fat": 0.1, "category": "Breakfast", "icon": "🥚" },
    { "name": "Brown Bread", "defaultQuantity": 1, "unit": "slice", "calories": 75, "protein": 3.0, "carbs": 13.0, "fat": 1.0, "category": "Bakery", "icon": "🍞" },
    { "name": "Whole Wheat Roti", "defaultQuantity": 1, "unit": "roti", "calories": 120, "protein": 3.5, "carbs": 24.0, "fat": 0.5, "category": "Pakistani Foods", "icon": "🫓" },
    { "name": "Desi Ghee Paratha", "defaultQuantity": 1, "unit": "paratha", "calories": 320, "protein": 5.0, "carbs": 40.0, "fat": 16.0, "category": "Pakistani Foods", "icon": "🫓" },
    { "name": "Plain Yogurt", "defaultQuantity": 1, "unit": "cup", "calories": 150, "protein": 8.0, "carbs": 12.0, "fat": 8.0, "category": "Dairy", "icon": "🥛" },
    { "name": "Whole Milk", "defaultQuantity": 250, "unit": "ml", "calories": 150, "protein": 8.0, "carbs": 12.0, "fat": 8.0, "category": "Dairy", "icon": "🥛" },
    { "name": "Guava", "defaultQuantity": 1, "unit": "guava", "calories": 38, "protein": 1.4, "carbs": 7.9, "fat": 0.5, "category": "Fruit", "icon": "🍏" },
    { "name": "Apple", "defaultQuantity": 1, "unit": "apple", "calories": 95, "protein": 0.5, "carbs": 25.0, "fat": 0.3, "category": "Fruit", "icon": "🍎" },
    { "name": "Pear", "defaultQuantity": 1, "unit": "pear", "calories": 102, "protein": 0.6, "carbs": 27.0, "fat": 0.2, "category": "Fruit", "icon": "🍐" },
    { "name": "Banana", "defaultQuantity": 1, "unit": "banana", "calories": 105, "protein": 1.3, "carbs": 27.0, "fat": 0.3, "category": "Fruit", "icon": "🍌" },
    { "name": "Onion", "defaultQuantity": 1, "unit": "piece", "calories": 40, "protein": 1.1, "carbs": 9.3, "fat": 0.1, "category": "Vegetables", "icon": "🧅" },
    { "name": "Tomato", "defaultQuantity": 1, "unit": "piece", "calories": 22, "protein": 1.1, "carbs": 4.8, "fat": 0.2, "category": "Vegetables", "icon": "🍅" },
    { "name": "Boiled Potato", "defaultQuantity": 1, "unit": "piece", "calories": 130, "protein": 3.0, "carbs": 29.0, "fat": 0.2, "category": "Vegetables", "icon": "🥔" },
    { "name": "Kala Chana", "defaultQuantity": 1, "unit": "cup", "calories": 269, "protein": 14.5, "carbs": 45.0, "fat": 4.2, "category": "Pakistani Foods", "icon": "🥣" },
    { "name": "Chicken Breast (Cooked)", "defaultQuantity": 100, "unit": "g", "calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6, "category": "Meat", "icon": "🍗" },
    { "name": "Chicken Curry", "defaultQuantity": 1, "unit": "plate", "calories": 350, "protein": 25.0, "carbs": 8.0, "fat": 24.0, "category": "Pakistani Foods", "icon": "🥘" },
    { "name": "Mixed Salad", "defaultQuantity": 1, "unit": "bowl", "calories": 33, "protein": 1.5, "carbs": 7.0, "fat": 0.4, "category": "Vegetables", "icon": "🥗" },
    { "name": "Bean Salad", "defaultQuantity": 1, "unit": "bowl", "calories": 180, "protein": 8.0, "carbs": 28.0, "fat": 4.0, "category": "Vegetables", "icon": "🥗" },
    { "name": "Calcium Tablet", "defaultQuantity": 1, "unit": "piece", "calories": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "category": "Supplements", "icon": "💊" }
  ];

  // Standard units
  const DEFAULT_UNITS = [
    "g", "kg", "ml", "liter", "piece", "half-piece", "quarter-piece", "slice", 
    "cup", "half-cup", "quarter-cup", "glass", "half-glass", "plate", 
    "half-plate", "bowl", "half-bowl", "tablespoon", "teaspoon", "roti", 
    "paratha", "apple", "banana", "orange", "pear", "guava", "serving", "custom"
  ];

  // Categories
  const CATEGORIES = [
    "Breakfast", "Lunch", "Dinner", "Snacks", "Fruit", "Vegetables", 
    "Meat", "Drinks", "Dairy", "Bakery", "Pakistani Foods", "Supplements", 
    "Favorites", "Recently Used"
  ];

  // Global application state class
  class AuraNutriApp {
    constructor() {
      this.state = {
        version: "1.0",
        selectedDate: this.formatDate(new Date()),
        goals: {
          kcal: 2000,
          protein: 150,
          carbs: 200,
          fat: 65,
          weight: 75.0,
          targetWeight: 68.0,
          height: 175,
          age: 28,
          gender: "male",
          activity: "moderate"
        },
        settings: {
          theme: "dark",
          accentColor: "#3B82F6",
          animationsEnabled: true,
          compactMode: false,
          backupReminder: true,
          customUnits: []
        },
        quickFoods: [],
        records: {} // Format: { "YYYY-MM-DD": { foods: [], water: 0, weight: 70 } }
      };

      // Navigation page routing states
      this.currentPage = "dashboard";
      this.calendarViewMonth = new Date().getMonth();
      this.calendarViewYear = new Date().getFullYear();
      
      // Keep track of deleted food for undo
      this.lastDeletedItem = null;
      this.lastDeletedDate = null;
    }

    /* ==========================================================================
       Lifecycle & Storage Methods
       ========================================================================== */
    init() {
      this.setupDOMReferences();
      this.setupEventListeners();
      this.setupLoginSystem();

      if (sessionStorage.getItem('auranutri_logged_in') === 'true') {
        document.body.classList.remove('not-logged-in');
        this.showLoadingOverlay();
        this.startMainApplication();
      } else {
        document.body.classList.add('not-logged-in');
        this.showLoginStep('camera');
      }
    }

    startMainApplication() {
      // Apply default theme immediately while data loads
      this.applyThemeAndSettings();
      this.showLoadingOverlay();

      const _afterLoad = () => {
        this.hideLoadingOverlay();
        this.updateActiveDateText();
        this.renderAllViews();
        // Navigate to URL hash if user opened a direct link (e.g. /#daily-log)
        const hashPage = window.location.hash.replace('#', '');
        if (hashPage && hashPage !== 'logout') {
          this._performPageSwitch(hashPage);
        } else {
          this._performPageSwitch('dashboard');
        }
      };

      this.loadFromSupabase()
        .then(() => {
          _afterLoad();
          this.showToast("Welcome back to AuraNutri! ☁️", "success");
        })
        .catch(err => {
          console.error("Supabase load failed:", err);
          _afterLoad();
          this.showToast("Cloud sync failed. Running with local data.", "danger");
        });
    }

    setupLoginSystem() {
      this.loginState = {
        stream: null,
        ipAddress: ''
      };

      // Prefetch IP address
      fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
          this.loginState.ipAddress = data.ip;
        })
        .catch(() => {
          this.loginState.ipAddress = 'offline';
        });

      // Bind Login Screen DOM elements
      this.loginDom = {
        container: document.getElementById('loginContainer'),
        cameraStep: document.getElementById('loginCameraStep'),
        passwordStep: document.getElementById('loginPasswordStep'),
        statusStep: document.getElementById('loginStatusStep'),
        btnAllowCamera: document.getElementById('btnAllowCamera'),
        btnCancelCamera: document.getElementById('btnCancelCamera'),
        cameraErrorMessage: document.getElementById('cameraErrorMessage'),
        loginWebcam: document.getElementById('loginWebcam'),
        loginCanvas: document.getElementById('loginCanvas'),
        loginForm: document.getElementById('loginForm'),
        loginPassword: document.getElementById('loginPassword'),
        btnLoginSubmit: document.getElementById('btnLoginSubmit'),
        loginErrorMessage: document.getElementById('loginErrorMessage'),
        loginStatusMessage: document.getElementById('loginStatusMessage')
      };

      if (!this.loginDom.btnAllowCamera) return;

      // Allow camera click
      this.loginDom.btnAllowCamera.addEventListener('click', () => this.requestCameraAccess());

      // Cancel camera click
      this.loginDom.btnCancelCamera.addEventListener('click', () => {
        this.loginDom.cameraErrorMessage.textContent = "Camera permission is required before continuing.";
        this.loginDom.cameraErrorMessage.classList.remove('hidden');
      });

      // Submit password click
      this.loginDom.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePasswordVerification();
      });
    }

    showLoginStep(step) {
      if (!this.loginDom || !this.loginDom.cameraStep) return;
      this.loginDom.cameraStep.classList.toggle('active', step === 'camera');
      this.loginDom.passwordStep.classList.toggle('active', step === 'password');
      this.loginDom.statusStep.classList.toggle('active', step === 'status');
    }

    async requestCameraAccess() {
      try {
        if (this.loginDom.cameraErrorMessage) {
          this.loginDom.cameraErrorMessage.classList.add('hidden');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        
        this.loginState.stream = stream;
        this.loginDom.loginWebcam.srcObject = stream;
        // Explicitly call play() to ensure the stream starts on HTTPS / Vercel
        // Without this, autoplay may silently fail and drawImage captures a black frame
        try { await this.loginDom.loginWebcam.play(); } catch (_) {}
        this.showLoginStep('password');
        this.loginDom.loginPassword.focus();
      } catch (err) {
        console.error('Camera access error:', err);
        if (this.loginDom.cameraErrorMessage) {
          this.loginDom.cameraErrorMessage.textContent = "Camera permission is required before continuing.";
          this.loginDom.cameraErrorMessage.classList.remove('hidden');
        }
      }
    }

    async captureSnapshot() {
      try {
        const video = this.loginDom.loginWebcam;
        const canvas = this.loginDom.loginCanvas;
        if (!video || !canvas) return null;

        // Wait until the video has actual frame data (readyState >= 2 = HAVE_CURRENT_DATA)
        // This prevents black images on Vercel / HTTPS where autoplay may be delayed
        if (video.readyState < 2) {
          await new Promise((resolve) => {
            const onReady = () => {
              video.removeEventListener('canplay', onReady);
              video.removeEventListener('playing', onReady);
              resolve();
            };
            video.addEventListener('canplay', onReady, { once: true });
            video.addEventListener('playing', onReady, { once: true });
            // Timeout fallback after 3 seconds – proceed anyway
            setTimeout(resolve, 3000);
          });
        }

        // Use real video dimensions; fall back to 640x480 if still unavailable
        const w = video.videoWidth > 0 ? video.videoWidth : 640;
        const h = video.videoHeight > 0 ? video.videoHeight : 480;
        canvas.width = w;
        canvas.height = h;
        const context = canvas.getContext('2d');

        // Mirror the canvas image to match mirrored webcam preview
        context.translate(w, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, w, h);
        context.setTransform(1, 0, 0, 1, 0, 0);

        return canvas.toDataURL('image/jpeg', 0.8);
      } catch (e) {
        console.error('Failed to capture snapshot:', e);
        return null;
      }
    }

    async handlePasswordVerification() {
      const password = this.loginDom.loginPassword.value;
      const snapshot = await this.captureSnapshot();

      // Show loader on the button
      this.loginDom.loginErrorMessage.classList.add('hidden');
      const submitBtn = this.loginDom.btnLoginSubmit;
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');
      
      if (btnText && btnSpinner) {
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
      }
      submitBtn.disabled = true;

      // Browser detection details
      const browser = navigator.userAgent;
      const os = navigator.platform;
      const resolution = `${window.screen.width}x${window.screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const attempt = {
        success: password === '03350060100',
        imageUrl: snapshot,
        browser: browser,
        operatingSystem: os,
        screenResolution: resolution,
        timezone: timezone,
        ipAddress: this.loginState.ipAddress
      };

      // Try logging to Supabase
      try {
        await SupabaseDB.logLoginAttempt(attempt);
      } catch (e) {
        console.error('Failed to save login log:', e);
      }

      if (attempt.success) {
        this.loginDom.loginStatusMessage.textContent = "Login successful. Redirecting to your KCAL Dashboard...";
        this.showLoginStep('status');

        setTimeout(() => {
          this.stopCameraStream();
          sessionStorage.setItem('auranutri_logged_in', 'true');
          document.body.classList.remove('not-logged-in');
          
          if (btnText && btnSpinner) {
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
          }
          submitBtn.disabled = false;

          this.startMainApplication();
        }, 2000);

      } else {
        // Neutral error message after 2 seconds
        setTimeout(() => {
          if (btnText && btnSpinner) {
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
          }
          submitBtn.disabled = false;
          
          this.loginDom.loginPassword.value = '';
          this.loginDom.loginErrorMessage.classList.remove('hidden');
          this.loginDom.loginPassword.focus();
        }, 2000);
      }
    }

    stopCameraStream() {
      if (this.loginState && this.loginState.stream) {
        try {
          this.loginState.stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.error(e);
        }
        this.loginState.stream = null;
      }
    }

    handleLogout() {
      this.stopCameraStream();
      sessionStorage.removeItem('auranutri_logged_in');
      document.body.classList.add('not-logged-in');
      
      if (this.loginDom) {
        if (this.loginDom.loginPassword) this.loginDom.loginPassword.value = '';
        if (this.loginDom.cameraErrorMessage) this.loginDom.cameraErrorMessage.classList.add('hidden');
        if (this.loginDom.loginErrorMessage) this.loginDom.loginErrorMessage.classList.add('hidden');
      }
      
      this.showLoginStep('camera');
      this.showToast("Logged out successfully.", "success");
    }

    async loadFromSupabase() {
      // 1. Profile (goals + settings)
      const profile = await SupabaseDB.loadProfile();
      this.state.goals = {
        kcal:         profile.goal_kcal,
        protein:      profile.goal_protein,
        carbs:        profile.goal_carbs,
        fat:          profile.goal_fat,
        weight:       Number(profile.weight),
        targetWeight: Number(profile.target_weight),
        height:       profile.height,
        age:          profile.age,
        gender:       profile.gender,
        activity:     profile.activity
      };
      this.state.settings = {
        theme:              profile.theme,
        accentColor:        profile.accent_color,
        animationsEnabled:  profile.animations_enabled,
        compactMode:        profile.compact_mode,
        backupReminder:     profile.backup_reminder,
        customUnits:        profile.custom_units || []
      };
      this.applyThemeAndSettings();

      // 2. Quick Foods
      let qf = await SupabaseDB.loadQuickFoods();
      if (qf.length === 0) {
        // First launch – seed starter foods
        const starterFoods = await this._fetchStarterFoods();
        qf = await SupabaseDB.bulkInsertStarterFoods(starterFoods);
      }
      this.state.quickFoods = qf;

      // 3. Records  (merge water/weight + food logs)
      const [dailyRecs, foodLogs] = await Promise.all([
        SupabaseDB.loadDailyRecords(),
        SupabaseDB.loadFoodLogEntries()
      ]);
      this.state.records = { ...dailyRecs };
      Object.keys(foodLogs).forEach(date => {
        if (!this.state.records[date]) this.state.records[date] = { water: 0, weight: null, foods: [] };
        this.state.records[date].foods = foodLogs[date];
      });
    }

    async _fetchStarterFoods() {
      try {
        const response = await fetch("data/foods.json");
        if (response.ok) return await response.json();
      } catch (_) {}
      return FALLBACK_STARTER_FOODS;
    }

    // Legacy stub kept so no other code breaks — data is now always in this.state
    saveToLocalStorage() {}
    loadFromLocalStorage() {}

    deepMerge(target, source) {
      for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) {
          Object.assign(source[key], this.deepMerge(target[key], source[key]));
        }
      }
      Object.assign(target || {}, source);
      return target;
    }

    showLoadingOverlay() {
      let el = document.getElementById('sbLoadingOverlay');
      if (!el) {
        el = document.createElement('div');
        el.id = 'sbLoadingOverlay';
        el.innerHTML = `<div class="sb-loader"><div class="sb-spinner"></div><p>Connecting to cloud…</p></div>`;
        document.body.appendChild(el);
      }
      el.style.display = 'flex';
    }

    hideLoadingOverlay() {
      const el = document.getElementById('sbLoadingOverlay');
      if (el) el.style.display = 'none';
    }

    applyThemeAndSettings() {
      // Theme class
      document.body.className = this.state.settings.theme === "light" ? "theme-light" : "theme-dark";
      
      // Compact Mode
      if (this.state.settings.compactMode) {
        document.body.classList.add("compact-mode");
      } else {
        document.body.classList.remove("compact-mode");
      }

      // Animations
      if (!this.state.settings.animationsEnabled) {
        document.body.classList.add("animations-disabled");
      } else {
        document.body.classList.remove("animations-disabled");
      }

      // Accent color
      document.documentElement.style.setProperty("--primary", this.state.settings.accentColor);
      // Generate RGB colors for transparency variables
      const rgb = this.hexToRgb(this.state.settings.accentColor);
      if (rgb) {
        document.documentElement.style.setProperty("--primary-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      }
    }

    /* ==========================================================================
       DOM Setup & Routing
       ========================================================================== */
    setupDOMReferences() {
      this.dom = {
        // App Frame elements
        sidebar: document.getElementById("appSidebar"),
        openSidebarBtn: document.getElementById("openSidebarBtn"),
        closeSidebarBtn: document.getElementById("closeSidebarBtn"),
        navLinks: document.querySelectorAll(".nav-link"),
        pageSections: document.querySelectorAll(".page-section"),
        
        // Header / Nav
        activeDateText: document.getElementById("activeDateText"),
        prevDayBtn: document.getElementById("prevDayBtn"),
        nextDayBtn: document.getElementById("nextDayBtn"),
        globalSearchInput: document.getElementById("globalSearchInput"),
        searchDropdown: document.getElementById("searchDropdown"),
        navKcalVal: document.getElementById("navKcalVal"),
        navKcalGoal: document.getElementById("navKcalGoal"),
        navKcalFill: document.getElementById("navKcalFill"),
        profileTrigger: document.getElementById("profileTrigger"),
        sidebarUserName: document.getElementById("sidebarUserName"),
        sidebarUserGoal: document.getElementById("sidebarUserGoal"),

        // Dashboard widgets
        kcalConsumed: document.getElementById("kcalConsumed"),
        kcalGoal: document.getElementById("kcalGoal"),
        kcalRemainingLabel: document.getElementById("kcalRemainingLabel"),
        kcalRemaining: document.getElementById("kcalRemaining"),
        kcalProgressCircle: document.getElementById("kcalProgressCircle"),
        kcalPercent: document.getElementById("kcalPercent"),
        
        proteinConsumed: document.getElementById("proteinConsumed"),
        proteinGoal: document.getElementById("proteinGoal"),
        proteinRemaining: document.getElementById("proteinRemaining"),
        proteinProgressCircle: document.getElementById("proteinProgressCircle"),
        proteinPercent: document.getElementById("proteinPercent"),

        carbsConsumed: document.getElementById("carbsConsumed"),
        carbsGoal: document.getElementById("carbsGoal"),
        carbsRemaining: document.getElementById("carbsRemaining"),
        carbsProgressCircle: document.getElementById("carbsProgressCircle"),
        carbsPercent: document.getElementById("carbsPercent"),

        fatConsumed: document.getElementById("fatConsumed"),
        fatGoal: document.getElementById("fatGoal"),
        fatRemaining: document.getElementById("fatRemaining"),
        fatProgressCircle: document.getElementById("fatProgressCircle"),
        fatPercent: document.getElementById("fatPercent"),

        miniMealsList: document.getElementById("miniMealsList"),
        miniRecentFoods: document.getElementById("miniRecentFoods"),
        streakDays: document.getElementById("streakDays"),
        streakMsg: document.getElementById("streakMsg"),
        waterLevelFill: document.getElementById("waterLevelFill"),
        waterValue: document.getElementById("waterValue"),
        addWaterSmallBtn: document.getElementById("addWaterSmallBtn"),
        addWaterMediumBtn: document.getElementById("addWaterMediumBtn"),
        resetWaterBtn: document.getElementById("resetWaterBtn"),
        dashWeightInput: document.getElementById("dashWeightInput"),
        dashBmiVal: document.getElementById("dashBmiVal"),
        dashBmiStatus: document.getElementById("dashBmiStatus"),
        weightFillBar: document.getElementById("weightFillBar"),
        startWeightLabel: document.getElementById("startWeightLabel"),
        targetWeightLabel: document.getElementById("targetWeightLabel"),

        // Daily Log
        dailyLogTitle: document.getElementById("dailyLogTitle"),
        dailyLogSub: document.getElementById("dailyLogSub"),
        logManualAddBtn: document.getElementById("logManualAddBtn"),
        logQuickAddBtn: document.getElementById("logQuickAddBtn"),
        logEmptyState: document.getElementById("logEmptyState"),
        foodCardsList: document.getElementById("foodCardsList"),
        totalKcalVal: document.getElementById("totalKcalVal"),
        targetKcalVal: document.getElementById("targetKcalVal"),
        totalProteinVal: document.getElementById("totalProteinVal"),
        targetProteinVal: document.getElementById("targetProteinVal"),
        totalCarbsVal: document.getElementById("totalCarbsVal"),
        targetCarbsVal: document.getElementById("targetCarbsVal"),
        totalFatVal: document.getElementById("totalFatVal"),
        targetFatVal: document.getElementById("targetFatVal"),

        // Calendar
        calPrevMonth: document.getElementById("calPrevMonth"),
        calNextMonth: document.getElementById("calNextMonth"),
        calendarMonthYearText: document.getElementById("calendarMonthYearText"),
        calendarGrid: document.getElementById("calendarGrid"),

        // History
        historySort: document.getElementById("historySort"),
        historyListContainer: document.getElementById("historyListContainer"),

        // Quick Add
        quickFoodSearch: document.getElementById("quickFoodSearch"),
        categoryFilters: document.getElementById("categoryFilters"),
        quickFoodsGrid: document.getElementById("quickFoodsGrid"),
        quickAddCreateFoodBtn: document.getElementById("quickAddCreateFoodBtn"),

        // Manual Add
        manualAddForm: document.getElementById("manualAddForm"),
        manFoodName: document.getElementById("manFoodName"),
        manQuantity: document.getElementById("manQuantity"),
        manUnit: document.getElementById("manUnit"),
        addCustomUnitBtn: document.getElementById("addCustomUnitBtn"),
        manCalories: document.getElementById("manCalories"),
        manProtein: document.getElementById("manProtein"),
        manCarbs: document.getElementById("manCarbs"),
        manFat: document.getElementById("manFat"),
        manCategory: document.getElementById("manCategory"),
        manTime: document.getElementById("manTime"),
        manNotes: document.getElementById("manNotes"),
        manCancelBtn: document.getElementById("manCancelBtn"),

        // Statistics
        statsAvgCal: document.getElementById("statsAvgCal"),
        statsMaxCal: document.getElementById("statsMaxCal"),
        statsMaxCalDate: document.getElementById("statsMaxCalDate"),
        statsMinCal: document.getElementById("statsMinCal"),
        statsMinCalDate: document.getElementById("statsMinCalDate"),
        statsStreak: document.getElementById("statsStreak"),
        statsTopFoodsList: document.getElementById("statsTopFoodsList"),

        // Goals Settings
        goalsForm: document.getElementById("goalsForm"),
        goalKcal: document.getElementById("goalKcal"),
        goalProtein: document.getElementById("goalProtein"),
        goalCarbs: document.getElementById("goalCarbs"),
        goalFat: document.getElementById("goalFat"),
        goalWeight: document.getElementById("goalWeight"),
        goalTargetWeight: document.getElementById("goalTargetWeight"),
        goalHeight: document.getElementById("goalHeight"),
        goalAge: document.getElementById("goalAge"),
        goalGender: document.getElementById("goalGender"),
        goalActivity: document.getElementById("goalActivity"),
        estimateTDEEBtn: document.getElementById("estimateTDEEBtn"),
        bmrValue: document.getElementById("bmrValue"),
        tdeeValue: document.getElementById("tdeeValue"),
        recProteinVal: document.getElementById("recProteinVal"),
        recCarbsVal: document.getElementById("recCarbsVal"),
        recFatVal: document.getElementById("recFatVal"),

        // Import Export
        exportDataBtn: document.getElementById("exportDataBtn"),
        importFileInput: document.getElementById("importFileInput"),
        importFileStatus: document.getElementById("importFileStatus"),

        // Settings option DOMs
        themeDark: document.getElementById("themeDark"),
        themeLight: document.getElementById("themeLight"),
        customAccentColor: document.getElementById("customAccentColor"),
        animationToggle: document.getElementById("animationToggle"),
        compactModeToggle: document.getElementById("compactModeToggle"),
        backupReminderToggle: document.getElementById("backupReminderToggle"),
        resetSystemBtn: document.getElementById("resetSystemBtn"),

        // Log Totals Bar
        logTotalsBar: document.getElementById("logTotalsBar"),

        // Global Modal elements
        modalBackdrop: document.getElementById("modalBackdrop"),
        modalWindow: document.getElementById("modalWindow"),
        modalTitle: document.getElementById("modalTitle"),
        modalBody: document.getElementById("modalBody"),
        modalCloseBtn: document.getElementById("modalCloseBtn"),
        toastContainer: document.getElementById("toastContainer")
      };
    }

    setupEventListeners() {
      // NOTE: sidebar nav click routing is handled by the standalone goToPage()
      // bootstrap below the class definition — no duplicate handlers needed here.


      // NOTE: [data-link] routing is handled by the standalone goToPage() bootstrap.

      // Mobile Drawer Toggles
      this.dom.openSidebarBtn.addEventListener("click", () => {
        this.dom.sidebar.classList.add("open");
      });
      this.dom.closeSidebarBtn.addEventListener("click", () => {
        this.dom.sidebar.classList.remove("open");
      });

      // Date Navigation Header
      this.dom.prevDayBtn.addEventListener("click", () => this.navigateDate(-1));
      this.dom.nextDayBtn.addEventListener("click", () => this.navigateDate(1));

      // Global Search
      this.dom.globalSearchInput.addEventListener("input", () => this.handleGlobalSearch());
      this.dom.globalSearchInput.addEventListener("focus", () => this.handleGlobalSearch());
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".global-search-container")) {
          this.dom.searchDropdown.classList.add("hidden");
        }
      });

      // Quick Profile click redirects to goals
      this.dom.profileTrigger.addEventListener("click", () => this.showPage("goals"));

      // Dashboard water actions
      this.dom.addWaterSmallBtn.addEventListener("click", () => this.addWater(250));
      this.dom.addWaterMediumBtn.addEventListener("click", () => this.addWater(500));
      this.dom.resetWaterBtn.addEventListener("click", () => this.resetWater());

      // Dashboard Weight inline change
      this.dom.dashWeightInput.addEventListener("change", async (e) => {
        const w = parseFloat(e.target.value);
        if (w > 10 && w < 500) {
          const rec = this.getOrCreateDayRecord(this.state.selectedDate);
          rec.weight = w;
          this.state.goals.weight = w; // auto update current starting weight goal
          this.renderDashboard();
          this.showToast("Weight updated! ☁️", "success");
          
          await Promise.all([
            SupabaseDB.upsertDailyRecord(this.state.selectedDate, { water: rec.water || 0, weight: w }),
            SupabaseDB.saveGoals(this.state.goals)
          ]);
        }
      });

      // Daily Log manual actions
      this.dom.logManualAddBtn.addEventListener("click", () => this.showPage("manual-add"));
      this.dom.logQuickAddBtn.addEventListener("click", () => this.showPage("quick-add"));

      // Calendar month arrows
      this.dom.calPrevMonth.addEventListener("click", () => this.navigateCalendarMonth(-1));
      this.dom.calNextMonth.addEventListener("click", () => this.navigateCalendarMonth(1));

      // History Sorting
      this.dom.historySort.addEventListener("change", () => this.renderHistoryList());

      // Quick Add Search & Filters
      this.dom.quickFoodSearch.addEventListener("input", () => this.renderQuickFoodsList());
      this.dom.quickAddCreateFoodBtn.addEventListener("click", () => this.openCustomFoodModal());

      // Manual Add Form submission
      this.dom.manualAddForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveManualFoodEntry();
      });
      this.dom.manCancelBtn.addEventListener("click", () => this.showPage("daily-log"));
      this.dom.addCustomUnitBtn.addEventListener("click", () => this.openCustomUnitModal());

      // Goals Settings Form
      this.dom.goalsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveGoals();
      });
      this.dom.estimateTDEEBtn.addEventListener("click", () => this.estimateAndFillTDEE());

      // Import / Export
      this.dom.exportDataBtn.addEventListener("click", () => this.exportDataAsJSON());
      this.dom.importFileInput.addEventListener("change", (e) => this.handleDataImport(e));

      // Settings Controls
      this.dom.themeDark.addEventListener("change", () => this.updateSetting("theme", "dark"));
      this.dom.themeLight.addEventListener("change", () => this.updateSetting("theme", "light"));
      this.dom.customAccentColor.addEventListener("input", (e) => this.updateSetting("accentColor", e.target.value));
      
      // Preset color picks
      document.querySelectorAll(".color-preset-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".color-preset-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const color = btn.getAttribute("data-color");
          this.dom.customAccentColor.value = color;
          this.updateSetting("accentColor", color);
        });
      });

      this.dom.animationToggle.addEventListener("change", (e) => this.updateSetting("animationsEnabled", e.target.checked));
      this.dom.compactModeToggle.addEventListener("change", (e) => this.updateSetting("compactMode", e.target.checked));
      this.dom.backupReminderToggle.addEventListener("change", (e) => this.updateSetting("backupReminder", e.target.checked));
      this.dom.resetSystemBtn.addEventListener("click", () => this.confirmSystemReset());

      // Modal window close handlers
      this.dom.modalCloseBtn.addEventListener("click", () => this.closeModal());
      this.dom.modalBackdrop.addEventListener("click", (e) => {
        if (e.target === this.dom.modalBackdrop) this.closeModal();
      });

      // Accessibility Keyboard Shortcuts
      document.addEventListener("keydown", (e) => {
        // Ctrl + S: Export JSON
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          this.exportDataAsJSON();
        }
        // Ctrl + F: Global Search
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
          e.preventDefault();
          this.dom.globalSearchInput.focus();
        }
        // ESC: Close dialog
        if (e.key === "Escape") {
          this.closeModal();
          this.dom.searchDropdown.classList.add("hidden");
        }
      });

      // Resize listener for responsive canvas charts
      window.addEventListener("resize", () => {
        if (this.currentPage === "statistics") {
          this.renderStatistics();
        }
      });

      // Close sidebar when clicking outside of it on mobile
      document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768 && this.dom.sidebar.classList.contains("open")) {
          if (!e.target.closest("#appSidebar") && !e.target.closest("#openSidebarBtn")) {
            this.dom.sidebar.classList.remove("open");
          }
        }
      });
    }

    /* showPage — delegates to the global standalone router */
    showPage(pageId) {
      if (!pageId) return;
      if (typeof window.goToPage === 'function') {
        window.goToPage(pageId);
      } else {
        this._performPageSwitch(pageId);
      }
    }

    _performPageSwitch(pageId) {
      if (!pageId) return;
      this.currentPage = pageId;
      document.querySelectorAll('.page-section').forEach(s => {
        s.classList.toggle('active', s.id === 'section-' + pageId);
      });
      document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.getAttribute('data-page') === pageId);
      });
      if (window.innerWidth <= 768) {
        const sb = document.getElementById('appSidebar');
        if (sb) sb.classList.remove('open');
      }
      this.renderCurrentPageData(pageId);
    }

    closeSidebarOnMobile() {
      if (window.innerWidth <= 768) {
        const sb = document.getElementById('appSidebar');
        if (sb) sb.classList.remove('open');
      }
    }

    /* ==========================================================================
       Render Dispatchers
       ========================================================================== */
    renderAllViews() {
      this.renderNavWidget();
      this.renderCurrentPageData(this.currentPage);
      this.populateUnitsDropdowns();
    }

    renderCurrentPageData(pageId) {
      switch (pageId) {
        case "dashboard":
          this.renderDashboard();
          break;
        case "daily-log":
          this.renderDailyLog();
          break;
        case "calendar":
          this.renderCalendar();
          break;
        case "history":
          this.renderHistoryList();
          break;
        case "quick-add":
          this.renderQuickFoodsList();
          break;
        case "manual-add":
          this.resetManualForm();
          break;
        case "statistics":
          this.renderStatistics();
          break;
        case "goals":
          this.renderGoalsForm();
          break;
        case "settings":
          this.renderSettingsForm();
          break;
        default:
          break;
      }
    }

    renderNavWidget() {
      const totals = this.calculateDayTotals(this.state.selectedDate);
      this.dom.navKcalVal.textContent = totals.calories;
      this.dom.navKcalGoal.textContent = this.state.goals.kcal;
      const pct = Math.min(100, Math.round((totals.calories / this.state.goals.kcal) * 100));
      this.dom.navKcalFill.style.width = `${pct}%`;

      // Profile name goals info
      this.dom.sidebarUserName.textContent = "Your Tracker";
      this.dom.sidebarUserGoal.textContent = `Goal: ${this.state.goals.kcal} kcal`;
    }

    /* ==========================================================================
       Date Navigation Utilities
       ========================================================================== */
    navigateDate(offset) {
      const cur = new Date(this.state.selectedDate);
      cur.setDate(cur.getDate() + offset);
      this.state.selectedDate = this.formatDate(cur);
      this.updateActiveDateText();
      this.renderAllViews();
    }

    updateActiveDateText() {
      const todayStr = this.formatDate(new Date());
      const selected = new Date(this.state.selectedDate);
      
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      let displayStr = selected.toLocaleDateString(undefined, options);

      if (this.state.selectedDate === todayStr) {
        displayStr = `Today, ${selected.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (this.state.selectedDate === this.formatDate(yesterday)) {
          displayStr = `Yesterday, ${selected.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        }
      }
      this.dom.activeDateText.textContent = displayStr;
    }

    /* ==========================================================================
       Dashboard Render Engine
       ========================================================================== */
    renderDashboard() {
      const totals = this.calculateDayTotals(this.state.selectedDate);
      const goals = this.state.goals;

      // Calories Calculations
      const calRemaining = goals.kcal - totals.calories;
      this.animateCounter(this.dom.kcalConsumed, totals.calories);
      this.dom.kcalGoal.textContent = goals.kcal;
      
      if (calRemaining >= 0) {
        this.dom.kcalRemainingLabel.textContent = "Remaining";
        this.animateCounter(this.dom.kcalRemaining, calRemaining);
      } else {
        this.dom.kcalRemainingLabel.textContent = "Exceeded By";
        this.animateCounter(this.dom.kcalRemaining, Math.abs(calRemaining));
      }
      const calPct = goals.kcal > 0 ? (totals.calories / goals.kcal) * 100 : 0;
      this.dom.kcalPercent.textContent = `${Math.round(calPct)}%`;
      this.updateProgressRing(this.dom.kcalProgressCircle, 54, calPct);

      // Protein Calculations
      this.animateCounter(this.dom.proteinConsumed, Math.round(totals.protein));
      this.dom.proteinGoal.textContent = goals.protein;
      const protRemaining = goals.protein - totals.protein;
      this.dom.proteinRemaining.textContent = protRemaining > 0 ? `${Math.round(protRemaining)}g` : "0g";
      const protPct = goals.protein > 0 ? (totals.protein / goals.protein) * 100 : 0;
      this.dom.proteinPercent.textContent = `${Math.round(protPct)}%`;
      this.updateProgressRing(this.dom.proteinProgressCircle, 38, protPct);

      // Carbs Calculations
      this.animateCounter(this.dom.carbsConsumed, Math.round(totals.carbs));
      this.dom.carbsGoal.textContent = goals.carbs;
      const carbsRemaining = goals.carbs - totals.carbs;
      this.dom.carbsRemaining.textContent = carbsRemaining > 0 ? `${Math.round(carbsRemaining)}g` : "0g";
      const carbsPct = goals.carbs > 0 ? (totals.carbs / goals.carbs) * 100 : 0;
      this.dom.carbsPercent.textContent = `${Math.round(carbsPct)}%`;
      this.updateProgressRing(this.dom.carbsProgressCircle, 38, carbsPct);

      // Fat Calculations
      this.animateCounter(this.dom.fatConsumed, Math.round(totals.fat));
      this.dom.fatGoal.textContent = goals.fat;
      const fatRemaining = goals.fat - totals.fat;
      this.dom.fatRemaining.textContent = fatRemaining > 0 ? `${Math.round(fatRemaining)}g` : "0g";
      const fatPct = goals.fat > 0 ? (totals.fat / goals.fat) * 100 : 0;
      this.dom.fatPercent.textContent = `${Math.round(fatPct)}%`;
      this.updateProgressRing(this.dom.fatProgressCircle, 38, fatPct);

      // Streak Widget
      const streak = this.calculateStreak();
      this.dom.streakDays.textContent = `${streak} Day${streak === 1 ? '' : 's'}`;
      if (streak > 0) {
        this.dom.streakMsg.textContent = "Keep it up! Log daily to grow your streak!";
      } else {
        this.dom.streakMsg.textContent = "Log your foods today to start a logging streak!";
      }

      // Today's Meals list
      this.renderDashboardMiniMeals();

      // Recent foods grid
      this.renderDashboardMiniRecent();

      // Water Intake
      this.renderDashboardWater();

      // Weight & BMI
      this.renderDashboardBmiWeight();
    }

    renderDashboardMiniMeals() {
      const records = this.state.records[this.state.selectedDate];
      this.dom.miniMealsList.innerHTML = "";
      
      if (!records || !records.foods || records.foods.length === 0) {
        this.dom.miniMealsList.innerHTML = `<li class="empty-list-placeholder">No meals logged for today yet.</li>`;
        return;
      }

      records.foods.forEach(food => {
        const item = document.createElement("li");
        item.className = "mini-meal-item";
        
        // Find matching quick food icon if exists
        const quick = this.state.quickFoods.find(q => q.name.toLowerCase() === food.name.toLowerCase());
        const emoji = quick ? quick.icon : "🥗";

        item.innerHTML = `
          <div class="mini-meal-left">
            <span class="mini-meal-icon">${emoji}</span>
            <div>
              <span class="mini-meal-name">${food.name}</span>
              <span class="mini-meal-details">${food.quantity} ${food.unit} • ${food.category}</span>
            </div>
          </div>
          <span class="mini-meal-kcal text-primary">+${food.calories} kcal</span>
        `;
        this.dom.miniMealsList.appendChild(item);
      });
    }

    renderDashboardMiniRecent() {
      this.dom.miniRecentFoods.innerHTML = "";
      
      // Collect 4 most recently used unique foods from overall history
      const recent = [];
      const dates = Object.keys(this.state.records).sort((a,b) => b.localeCompare(a));
      
      for (const d of dates) {
        const rec = this.state.records[d];
        if (rec && rec.foods) {
          for (const f of rec.foods) {
            if (!recent.some(r => r.name.toLowerCase() === f.name.toLowerCase())) {
              recent.push(f);
              if (recent.length >= 4) break;
            }
          }
        }
        if (recent.length >= 4) break;
      }

      // If less than 4, fill with default quick add database items
      if (recent.length < 4) {
        for (const q of this.state.quickFoods) {
          if (!recent.some(r => r.name.toLowerCase() === q.name.toLowerCase())) {
            recent.push(q);
            if (recent.length >= 4) break;
          }
        }
      }

      recent.slice(0, 4).forEach(food => {
        const btn = document.createElement("button");
        btn.className = "mini-quick-add-btn";
        btn.setAttribute("title", `Instantly add ${food.name}`);
        
        btn.innerHTML = `
          <div class="info">
            <span class="name">${food.name}</span>
            <span class="kcal">${food.calories || food.kcal || 0} kcal</span>
          </div>
          <div class="plus-circle">+</div>
        `;
        
        btn.addEventListener("click", () => {
          // Log instantly
          this.addFoodLogEntry({
            name: food.name,
            quantity: food.defaultQuantity || food.quantity || 1,
            unit: food.unit,
            calories: food.calories || food.kcal || 0,
            protein: food.protein || 0,
            carbs: food.carbs || 0,
            fat: food.fat || 0,
            category: food.category || "Snacks",
            notes: "Instantly quick added from dashboard"
          });
        });
        
        this.dom.miniRecentFoods.appendChild(btn);
      });
    }

    renderDashboardWater() {
      const rec = this.getOrCreateDayRecord(this.state.selectedDate);
      const waterVal = rec.water || 0;
      this.dom.waterValue.textContent = waterVal;
      const pct = Math.min(100, Math.round((waterVal / 3000) * 100));
      this.dom.waterLevelFill.style.height = `${pct}%`;
    }

    renderDashboardBmiWeight() {
      const rec = this.getOrCreateDayRecord(this.state.selectedDate);
      const currentWeight = rec.weight || this.state.goals.weight;
      this.dom.dashWeightInput.value = currentWeight;

      // Calculate BMI
      const heightM = this.state.goals.height / 100;
      if (heightM > 0) {
        const bmi = parseFloat((currentWeight / (heightM * heightM)).toFixed(1));
        this.dom.dashBmiVal.textContent = bmi;
        
        let status = "Normal";
        let statusClass = "bmi-status-normal";
        if (bmi < 18.5) {
          status = "Underweight";
          statusClass = "bmi-status-warn";
        } else if (bmi >= 25 && bmi < 30) {
          status = "Overweight";
          statusClass = "bmi-status-warn";
        } else if (bmi >= 30) {
          status = "Obese";
          statusClass = "bmi-status-danger";
        }
        
        this.dom.dashBmiStatus.textContent = status;
        this.dom.dashBmiStatus.className = `status-badge ${statusClass}`;
      }

      // Weight target progress
      const target = this.state.goals.targetWeight;
      const start = this.state.goals.weight;
      this.dom.startWeightLabel.textContent = `Start: ${start}kg`;
      this.dom.targetWeightLabel.textContent = `Goal: ${target}kg`;

      // Draw progress fill bar
      let pct = 0;
      if (Math.abs(start - target) > 0) {
        pct = Math.min(100, Math.max(0, Math.round(((start - currentWeight) / (start - target)) * 100)));
      }
      this.dom.weightFillBar.style.width = `${pct}%`;
    }

    /* ==========================================================================
       Daily Log Render Engine
       ========================================================================== */
    renderDailyLog() {
      const rec = this.state.records[this.state.selectedDate];
      this.dom.foodCardsList.innerHTML = "";
      
      const totals = this.calculateDayTotals(this.state.selectedDate);
      
      // Update Log Headers and Empty States
      this.dom.dailyLogTitle.textContent = this.state.selectedDate === this.formatDate(new Date()) ? "Today's Food Log" : `Log for ${this.state.selectedDate}`;
      
      if (!rec || !rec.foods || rec.foods.length === 0) {
        this.dom.logEmptyState.classList.remove("hidden");
        this.dom.logTotalsBar.style.opacity = "0.5";
      } else {
        this.dom.logEmptyState.classList.add("hidden");
        this.dom.logTotalsBar.style.opacity = "1";

        rec.foods.forEach((food) => {
          const card = document.createElement("div");
          card.className = "food-card";
          
          // Find matching quick food icon if exists
          const quick = this.state.quickFoods.find(q => q.name.toLowerCase() === food.name.toLowerCase());
          const emoji = quick ? quick.icon : "🥗";

          card.innerHTML = `
            <div class="food-card-left">
              <span class="food-card-emoji">${emoji}</span>
              <div class="food-card-details-info">
                <div class="food-card-name-row">
                  <span class="food-card-title">${food.name}</span>
                  ${food.time ? `<span class="food-card-time">${food.time}</span>` : ""}
                </div>
                <span class="food-card-qty">${food.quantity} ${food.unit} • ${food.category}</span>
                ${food.notes ? `<span class="food-card-notes">${food.notes}</span>` : ""}
              </div>
            </div>
            
            <div class="food-card-macros">
              <div class="food-macro-item">
                <span class="val text-success">${Math.round(food.protein)}g</span>
                <span class="lbl">Prot</span>
              </div>
              <div class="food-macro-item">
                <span class="val text-warning">${Math.round(food.carbs)}g</span>
                <span class="lbl">Carbs</span>
              </div>
              <div class="food-macro-item">
                <span class="val text-danger">${Math.round(food.fat)}g</span>
                <span class="lbl">Fat</span>
              </div>
            </div>

            <div class="food-card-right">
              <span class="food-card-kcal-badge">${food.calories} kcal</span>
              <div class="food-card-actions">
                <button class="btn-card-action edit-log-item" title="Edit Item">✏️</button>
                <button class="btn-card-action duplicate-log-item" title="Duplicate Item">👯</button>
                <button class="btn-card-action delete-log-item" title="Delete Item">🗑️</button>
              </div>
            </div>
          `;

          // Event Listeners for actions
          card.querySelector(".delete-log-item").addEventListener("click", () => this.deleteFoodLogEntry(food.id));
          card.querySelector(".duplicate-log-item").addEventListener("click", () => this.duplicateFoodLogEntry(food));
          card.querySelector(".edit-log-item").addEventListener("click", () => this.openEditLoggedFoodModal(food));

          this.dom.foodCardsList.appendChild(card);
        });
      }

      // Update bottom totals bar
      this.dom.totalKcalVal.innerHTML = `${totals.calories} <span class="unit">/ <span id="targetKcalVal">${this.state.goals.kcal}</span> kcal</span>`;
      this.dom.totalProteinVal.innerHTML = `${Math.round(totals.protein)}g <span class="unit">/ <span id="targetProteinVal">${this.state.goals.protein}</span> g</span>`;
      this.dom.totalCarbsVal.innerHTML = `${Math.round(totals.carbs)}g <span class="unit">/ <span id="targetCarbsVal">${this.state.goals.carbs}</span> g</span>`;
      this.dom.totalFatVal.innerHTML = `${Math.round(totals.fat)}g <span class="unit">/ <span id="targetFatVal">${this.state.goals.fat}</span> g</span>`;
    }

    /* ==========================================================================
       Calendar Page Rendering
       ========================================================================== */
    renderCalendar() {
      const year = this.calendarViewYear;
      const month = this.calendarViewMonth;
      
      const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
      this.dom.calendarMonthYearText.textContent = `${monthNames[month]} ${year}`;

      this.dom.calendarGrid.innerHTML = "";
      
      // Get first day of month and number of days
      const firstDay = new Date(year, month, 1).getDay();
      const numDays = new Date(year, month + 1, 0).getDate();
      const prevMonthNumDays = new Date(year, month, 0).getDate();

      // Render days from previous month
      for (let i = firstDay - 1; i >= 0; i--) {
        const cell = document.createElement("div");
        cell.className = "calendar-day-cell other-month";
        cell.innerHTML = `<span class="calendar-day-num">${prevMonthNumDays - i}</span>`;
        this.dom.calendarGrid.appendChild(cell);
      }

      // Render actual days of this month
      const todayStr = this.formatDate(new Date());
      for (let day = 1; day <= numDays; day++) {
        const cellDateObj = new Date(year, month, day);
        const cellDateStr = this.formatDate(cellDateObj);
        
        const cell = document.createElement("div");
        cell.className = "calendar-day-cell";
        
        const records = this.state.records[cellDateStr];
        const dayTotals = this.calculateDayTotals(cellDateStr);
        const hasLogs = records && records.foods && records.foods.length > 0;
        
        if (cellDateStr === todayStr) {
          cell.classList.add("today");
        }
        
        let cellKcalText = "";
        if (hasLogs) {
          cell.classList.add("logged-day");
          cellKcalText = `${dayTotals.calories} kcal`;
          if (dayTotals.calories > this.state.goals.kcal) {
            cell.classList.add("over-goal");
          }
        }

        cell.innerHTML = `
          <span class="calendar-day-num">${day}</span>
          ${hasLogs ? `<span class="calendar-day-kcal">${cellKcalText}</span>` : ""}
          <div class="day-badge-dots">
            ${cellDateStr === todayStr ? `<span class="day-dot today"></span>` : ""}
            ${hasLogs ? `<span class="day-dot logged"></span>` : ""}
          </div>
        `;

        cell.addEventListener("click", () => {
          this.state.selectedDate = cellDateStr;
          this.updateActiveDateText();
          this.showPage("daily-log");
        });

        this.dom.calendarGrid.appendChild(cell);
      }

      // Fill remaining calendar days for 6-row grid completeness
      const totalCellsFilled = firstDay + numDays;
      const totalCellsNeeded = 42; // standard 6 rows * 7 columns
      const nextMonthDays = totalCellsNeeded - totalCellsFilled;
      for (let day = 1; day <= nextMonthDays; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day-cell other-month";
        cell.innerHTML = `<span class="calendar-day-num">${day}</span>`;
        this.dom.calendarGrid.appendChild(cell);
      }
    }

    navigateCalendarMonth(offset) {
      this.calendarViewMonth += offset;
      if (this.calendarViewMonth > 11) {
        this.calendarViewMonth = 0;
        this.calendarViewYear++;
      } else if (this.calendarViewMonth < 0) {
        this.calendarViewMonth = 11;
        this.calendarViewYear--;
      }
      this.renderCalendar();
    }

    /* ==========================================================================
       History Page Rendering
       ========================================================================== */
    renderHistoryList() {
      this.dom.historyListContainer.innerHTML = "";
      
      const loggedDays = Object.keys(this.state.records).filter(d => {
        const rec = this.state.records[d];
        return rec && rec.foods && rec.foods.length > 0;
      });

      if (loggedDays.length === 0) {
        this.dom.historyListContainer.innerHTML = `
          <div class="empty-state-container">
            <div class="empty-state-icon">📁</div>
            <h2>No History Records</h2>
            <p>Once you start logging foods on different days, they'll show up here in a sortable history list.</p>
          </div>
        `;
        return;
      }

      // Sort logs
      const sortType = this.dom.historySort.value;
      loggedDays.sort((a, b) => {
        const totalsA = this.calculateDayTotals(a);
        const totalsB = this.calculateDayTotals(b);

        if (sortType === "newest") return b.localeCompare(a);
        if (sortType === "oldest") return a.localeCompare(b);
        if (sortType === "highest-kcal") return totalsB.calories - totalsA.calories;
        if (sortType === "lowest-kcal") return totalsA.calories - totalsB.calories;
        return 0;
      });

      loggedDays.forEach(dateStr => {
        const totals = this.calculateDayTotals(dateStr);
        const foodsCount = this.state.records[dateStr].foods.length;
        
        const card = document.createElement("div");
        card.className = "history-day-card";
        
        const dateObj = new Date(dateStr);
        const formattedDate = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

        card.innerHTML = `
          <div class="history-day-left">
            <span class="history-day-date">${formattedDate}</span>
            <span class="history-day-count">${foodsCount} food item${foodsCount === 1 ? '' : 's'} logged</span>
          </div>
          
          <div class="history-day-macros">
            <div class="history-macro-pill">
              <span class="val text-success">${Math.round(totals.protein)}g</span>
              <span class="lbl">Protein</span>
            </div>
            <div class="history-macro-pill">
              <span class="val text-warning">${Math.round(totals.carbs)}g</span>
              <span class="lbl">Carbs</span>
            </div>
            <div class="history-macro-pill">
              <span class="val text-danger">${Math.round(totals.fat)}g</span>
              <span class="lbl">Fat</span>
            </div>
          </div>

          <div class="history-day-kcal">
            ${totals.calories} <span class="unit">kcal</span>
          </div>
        `;

        card.addEventListener("click", () => {
          this.state.selectedDate = dateStr;
          this.updateActiveDateText();
          this.showPage("daily-log");
        });

        this.dom.historyListContainer.appendChild(card);
      });
    }

    /* ==========================================================================
       Quick Add Foods Render Engine
       ========================================================================== */
    renderQuickFoodsList(selectedCategory = "all") {
      this.dom.quickFoodsGrid.innerHTML = "";
      
      const searchVal = this.dom.quickFoodSearch.value.toLowerCase();
      
      // Render category filters if not yet filled
      if (this.dom.categoryFilters.children.length === 0) {
        this.renderCategoryFilters();
      }

      // Find active filter
      let activeCat = "all";
      const activeBtn = this.dom.categoryFilters.querySelector(".category-pill-btn.active");
      if (activeBtn) {
        activeCat = activeBtn.getAttribute("data-cat");
      }

      // Filter database
      let filtered = this.state.quickFoods;

      // 1. Search Query filter
      if (searchVal) {
        filtered = filtered.filter(food => food.name.toLowerCase().includes(searchVal) || food.category.toLowerCase().includes(searchVal));
      }

      // 2. Category Pill filter
      if (activeCat !== "all") {
        if (activeCat === "Favorites") {
          filtered = filtered.filter(food => food.favorite === true);
        } else if (activeCat === "Recently Used") {
          // Collect items used in last logs
          const recentNames = [];
          const dates = Object.keys(this.state.records).sort((a,b) => b.localeCompare(a));
          for (const d of dates) {
            const rec = this.state.records[d];
            if (rec && rec.foods) {
              for (const f of rec.foods) {
                if (!recentNames.includes(f.name.toLowerCase())) {
                  recentNames.push(f.name.toLowerCase());
                }
              }
            }
          }
          filtered = filtered.filter(food => recentNames.includes(food.name.toLowerCase()));
        } else {
          filtered = filtered.filter(food => food.category.toLowerCase() === activeCat.toLowerCase());
        }
      }

      if (filtered.length === 0) {
        this.dom.quickFoodsGrid.innerHTML = `
          <div class="empty-state-container col-12" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🔍</div>
            <h2>No Foods Found</h2>
            <p>Create a custom food or broaden your search queries.</p>
          </div>
        `;
        return;
      }

      filtered.forEach(food => {
        const card = document.createElement("div");
        card.className = "quick-food-card";
        
        card.innerHTML = `
          <div class="quick-food-header">
            <div class="quick-food-icon-name">
              <span class="quick-food-icon">${food.icon || "🥗"}</span>
              <div class="quick-food-name-cat">
                <span class="quick-food-name">${food.name}</span>
                <span class="quick-food-category">${food.category}</span>
              </div>
            </div>
            
            <div class="quick-food-actions-overlay">
              <button class="btn-card-action favorite-quick-food ${food.favorite ? 'favorite-active' : ''}" title="Favorite Item">⭐</button>
              <button class="btn-card-action edit-quick-food" title="Edit Item">✏️</button>
              <button class="btn-card-action delete-quick-food" title="Delete Item">🗑️</button>
            </div>
          </div>

          <div class="quick-food-details">
            <span class="quick-food-qty-unit">Default: ${food.defaultQuantity} ${food.unit}</span>
            <span class="quick-food-kcal">${food.calories || food.kcal} kcal</span>
          </div>

          <div class="quick-food-macros-row">
            <div class="quick-macro-col">
              <span class="val text-success">${food.protein}g</span>
              <span class="lbl">Prot</span>
            </div>
            <div class="quick-macro-col">
              <span class="val text-warning">${food.carbs}g</span>
              <span class="lbl">Carbs</span>
            </div>
            <div class="quick-macro-col">
              <span class="val text-danger">${food.fat}g</span>
              <span class="lbl">Fat</span>
            </div>
          </div>
        `;

        // Card single-click add action (excluding overlays clicks)
        card.addEventListener("click", (e) => {
          if (e.target.closest(".btn-card-action")) return; // skip additions if they clicked actions
          
          this.addFoodLogEntry({
            name: food.name,
            quantity: food.defaultQuantity,
            unit: food.unit,
            calories: food.calories || food.kcal,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            category: food.category
          });
        });

        // Overlay actions listeners
        card.querySelector(".favorite-quick-food").addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleFavoriteQuickFood(food.id);
        });

        card.querySelector(".edit-quick-food").addEventListener("click", (e) => {
          e.stopPropagation();
          this.openEditQuickFoodModal(food);
        });

        card.querySelector(".delete-quick-food").addEventListener("click", (e) => {
          e.stopPropagation();
          this.deleteQuickFood(food.id);
        });

        this.dom.quickFoodsGrid.appendChild(card);
      });
    }

    renderCategoryFilters() {
      this.dom.categoryFilters.innerHTML = "";
      
      // All pill
      const allBtn = document.createElement("button");
      allBtn.className = "category-pill-btn active";
      allBtn.textContent = "All Foods";
      allBtn.setAttribute("data-cat", "all");
      allBtn.addEventListener("click", () => this.filterCategory("all", allBtn));
      this.dom.categoryFilters.appendChild(allBtn);

      CATEGORIES.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "category-pill-btn";
        btn.textContent = cat;
        btn.setAttribute("data-cat", cat);
        btn.addEventListener("click", () => this.filterCategory(cat, btn));
        this.dom.categoryFilters.appendChild(btn);
      });
    }

    filterCategory(cat, activeBtn) {
      this.dom.categoryFilters.querySelectorAll(".category-pill-btn").forEach(b => b.classList.remove("active"));
      activeBtn.classList.add("active");
      this.renderQuickFoodsList();
    }

    async toggleFavoriteQuickFood(id) {
      const food = this.state.quickFoods.find(q => q.id === id);
      if (food) {
        food.favorite = !food.favorite;
        this.renderQuickFoodsList();
        this.showToast(food.favorite ? `${food.name} favorited!` : `${food.name} removed from favorites.`, "success");
        await SupabaseDB.updateQuickFood(id, { favorite: food.favorite });
      }
    }

    async deleteQuickFood(id) {
      const food = this.state.quickFoods.find(q => q.id === id);
      if (food) {
        if (confirm(`Are you sure you want to delete ${food.name} from the database?`)) {
          this.state.quickFoods = this.state.quickFoods.filter(q => q.id !== id);
          this.renderQuickFoodsList();
          this.showToast(`${food.name} deleted from database.`, "danger");
          await SupabaseDB.deleteQuickFood(id);
        }
      }
    }

    /* ==========================================================================
       Logged entry operations (Add, Delete, Edit, Duplicate)
       ========================================================================== */
    async addFoodLogEntry(foodEntry) {
      const rec = this.getOrCreateDayRecord(this.state.selectedDate);
      const newEntry = {
        id: this.generateUUID(), // temp id until Supabase assigns UUID
        name: foodEntry.name,
        quantity: parseFloat(foodEntry.quantity) || 1,
        unit: foodEntry.unit,
        calories: Math.round(foodEntry.calories) || 0,
        protein: parseFloat(foodEntry.protein) || 0,
        carbs: parseFloat(foodEntry.carbs) || 0,
        fat: parseFloat(foodEntry.fat) || 0,
        category: foodEntry.category || "Snacks",
        time: foodEntry.time || this.getCurrentTimeStr(),
        notes: foodEntry.notes || ""
      };

      rec.foods.push(newEntry);
      this.renderNavWidget();
      if (this.currentPage === "dashboard") this.renderDashboard();
      if (this.currentPage === "daily-log") this.renderDailyLog();

      // Persist to Supabase (also ensure daily record row exists)
      await SupabaseDB.upsertDailyRecord(this.state.selectedDate, { water: rec.water || 0, weight: rec.weight || null });
      const saved = await SupabaseDB.insertFoodLogEntry(this.state.selectedDate, newEntry);
      newEntry.id = saved.id; // replace temp id with real UUID

      this.showToast(`Added ${newEntry.name}!`, "success", () => {
        this.deleteFoodLogEntry(newEntry.id, true);
      });
    }

    async deleteFoodLogEntry(id, isUndoCall = false) {
      const rec = this.state.records[this.state.selectedDate];
      if (rec && rec.foods) {
        const index = rec.foods.findIndex(f => f.id === id);
        if (index !== -1) {
          const removed = rec.foods[index];
          if (!isUndoCall) {
            this.lastDeletedItem = removed;
            this.lastDeletedDate = this.state.selectedDate;
          }

          rec.foods.splice(index, 1);
          await SupabaseDB.deleteFoodLogEntry(id);
          this.renderNavWidget();
          if (this.currentPage === "dashboard") this.renderDashboard();
          if (this.currentPage === "daily-log") this.renderDailyLog();

          if (isUndoCall) {
            this.showToast(`Action undone!`, "success");
          } else {
            this.showToast(`Deleted ${removed.name}`, "danger", async () => {
              const dayRec = this.getOrCreateDayRecord(this.lastDeletedDate);
              dayRec.foods.push(this.lastDeletedItem);
              await SupabaseDB.upsertDailyRecord(this.lastDeletedDate, { water: dayRec.water || 0, weight: dayRec.weight || null });
              const restored = await SupabaseDB.insertFoodLogEntry(this.lastDeletedDate, this.lastDeletedItem);
              this.lastDeletedItem.id = restored.id;
              this.renderNavWidget();
              if (this.currentPage === "dashboard") this.renderDashboard();
              if (this.currentPage === "daily-log") this.renderDailyLog();
              this.showToast(`Restored ${this.lastDeletedItem.name}`, "success");
            });
          }
        }
      }
    }

    duplicateFoodLogEntry(food) {
      this.addFoodLogEntry({
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        category: food.category,
        notes: food.notes ? `${food.notes} (Copy)` : "Copied meal"
      });
    }

    /* ==========================================================================
       Manual Entry Pages
       ========================================================================== */
    resetManualForm() {
      this.dom.manualAddForm.reset();
      this.dom.manTime.value = this.getCurrentTimeStr();
      this.populateUnitsDropdowns();
    }

    saveManualFoodEntry() {
      const name = this.dom.manFoodName.value.trim();
      const qty = parseFloat(this.dom.manQuantity.value);
      const unit = this.dom.manUnit.value;
      const kcal = Math.round(parseFloat(this.dom.manCalories.value));
      const prot = parseFloat(this.dom.manProtein.value) || 0;
      const carbs = parseFloat(this.dom.manCarbs.value) || 0;
      const fat = parseFloat(this.dom.manFat.value) || 0;
      const category = this.dom.manCategory.value;
      const time = this.dom.manTime.value;
      const notes = this.dom.manNotes.value.trim();

      if (!name) {
        this.showToast("Food name cannot be empty!", "warning");
        return;
      }

      this.addFoodLogEntry({
        name,
        quantity: qty,
        unit,
        calories: kcal,
        protein: prot,
        carbs,
        fat,
        category,
        time,
        notes
      });

      this.showPage("daily-log");
    }

    populateUnitsDropdowns() {
      const allUnits = [...DEFAULT_UNITS, ...this.state.settings.customUnits];
      
      const updateDropdown = (selectEl) => {
        if (!selectEl) return;
        const currentVal = selectEl.value;
        selectEl.innerHTML = "";
        allUnits.forEach(unit => {
          const opt = document.createElement("option");
          opt.value = unit;
          opt.textContent = unit;
          selectEl.appendChild(opt);
        });
        if (currentVal && allUnits.includes(currentVal)) {
          selectEl.value = currentVal;
        }
      };

      updateDropdown(this.dom.manUnit);
      
      const modalSelect = document.getElementById("custUnit");
      if (modalSelect) updateDropdown(modalSelect);
    }

    /* ==========================================================================
       Water operations
       ========================================================================== */
    async addWater(amount) {
      const rec = this.getOrCreateDayRecord(this.state.selectedDate);
      rec.water = (rec.water || 0) + amount;
      this.renderDashboard();
      this.showToast(`Added ${amount}ml water! 💧`, "success");
      await SupabaseDB.upsertDailyRecord(this.state.selectedDate, { water: rec.water, weight: rec.weight || null });
    }

    async resetWater() {
      const rec = this.getOrCreateDayRecord(this.state.selectedDate);
      rec.water = 0;
      this.renderDashboard();
      this.showToast("Water counter reset.", "warning");
      await SupabaseDB.upsertDailyRecord(this.state.selectedDate, { water: 0, weight: rec.weight || null });
    }

    /* ==========================================================================
       Goals & Auto TDEE estimates
       ========================================================================== */
    renderGoalsForm() {
      const goals = this.state.goals;
      this.dom.goalKcal.value = goals.kcal;
      this.dom.goalProtein.value = goals.protein;
      this.dom.goalCarbs.value = goals.carbs;
      this.dom.goalFat.value = goals.fat;
      this.dom.goalWeight.value = goals.weight;
      this.dom.goalTargetWeight.value = goals.targetWeight;
      this.dom.goalHeight.value = goals.height;
      this.dom.goalAge.value = goals.age;
      this.dom.goalGender.value = goals.gender;
      this.dom.goalActivity.value = goals.activity;

      this.calculateGoalsStats();
    }

    async saveGoals() {
      this.state.goals.kcal = parseInt(this.dom.goalKcal.value);
      this.state.goals.protein = parseInt(this.dom.goalProtein.value);
      this.state.goals.carbs = parseInt(this.dom.goalCarbs.value);
      this.state.goals.fat = parseInt(this.dom.goalFat.value);
      this.state.goals.weight = parseFloat(this.dom.goalWeight.value);
      this.state.goals.targetWeight = parseFloat(this.dom.goalTargetWeight.value);
      this.state.goals.height = parseInt(this.dom.goalHeight.value);
      this.state.goals.age = parseInt(this.dom.goalAge.value);
      this.state.goals.gender = this.dom.goalGender.value;
      this.state.goals.activity = this.dom.goalActivity.value;

      await SupabaseDB.saveGoals(this.state.goals);
      this.renderNavWidget();
      this.calculateGoalsStats();
      this.showToast("Personal goals updated successfully! ☁️", "success");
    }

    calculateGoalsStats() {
      const w = parseFloat(this.dom.goalWeight.value);
      const h = parseInt(this.dom.goalHeight.value);
      const age = parseInt(this.dom.goalAge.value);
      const gender = this.dom.goalGender.value;
      const activity = this.dom.goalActivity.value;

      if (!w || !h || !age) return;

      // Harris-Benedict BMR Estimation
      let bmr = 0;
      if (gender === "male") {
        bmr = 10 * w + 6.25 * h - 5 * age + 5;
      } else {
        bmr = 10 * w + 6.25 * h - 5 * age - 161;
      }

      // TDEE multipliers
      const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        extreme: 1.9
      };
      const tdee = bmr * (multipliers[activity] || 1.2);

      this.dom.bmrValue.textContent = `${Math.round(bmr).toLocaleString()} kcal`;
      this.dom.tdeeValue.textContent = `${Math.round(tdee).toLocaleString()} kcal`;

      // Macro recommendations targets based on calculated weight/TDEE
      // 2g protein per kg, 25% fat, rest carbs (adjusted to TDEE)
      const proteinTarget = Math.round(w * 2); 
      const fatTarget = Math.round((tdee * 0.25) / 9);
      const carbsTarget = Math.round((tdee - (proteinTarget * 4) - (fatTarget * 9)) / 4);

      this.dom.recProteinVal.textContent = `${proteinTarget}g`;
      this.dom.recCarbsVal.textContent = `${carbsTarget}g`;
      this.dom.recFatVal.textContent = `${fatTarget}g`;
    }

    estimateAndFillTDEE() {
      this.calculateGoalsStats();
      
      const bmrVal = parseInt(this.dom.bmrValue.textContent.replace(/,/g, ''));
      const tdeeVal = parseInt(this.dom.tdeeValue.textContent.replace(/,/g, ''));
      const recProt = parseInt(this.dom.recProteinVal.textContent);
      const recCarbs = parseInt(this.dom.recCarbsVal.textContent);
      const recFat = parseInt(this.dom.recFatVal.textContent);

      // We'll set Calorie target to: TDEE - 500 (standard weight loss deficit) or customized
      const weight = parseFloat(this.dom.goalWeight.value);
      const target = parseFloat(this.dom.goalTargetWeight.value);
      
      let calDeficit = 0;
      if (weight > target) {
        calDeficit = -500; // Deficit for loss
      } else if (weight < target) {
        calDeficit = 300; // Surplus for gain
      }

      this.dom.goalKcal.value = Math.max(1200, Math.round(tdeeVal + calDeficit));
      this.dom.goalProtein.value = recProt;
      this.dom.goalCarbs.value = recCarbs;
      this.dom.goalFat.value = recFat;

      this.showToast("Targets auto-filled using calculated recommendations!", "warning");
    }

    /* ==========================================================================
       Statistics & Custom HTML5 Canvas Charts
       ========================================================================== */
    renderStatistics() {
      // 1. Calculate General Aggregates
      const loggedDates = Object.keys(this.state.records).filter(d => {
        const rec = this.state.records[d];
        return rec && rec.foods && rec.foods.length > 0;
      });

      if (loggedDates.length === 0) {
        this.dom.statsAvgCal.textContent = "0 kcal";
        this.dom.statsMaxCal.textContent = "N/A";
        this.dom.statsMinCal.textContent = "N/A";
        this.dom.statsStreak.textContent = "0 Days";
        this.renderEmptyStatsCharts();
        return;
      }

      let totalCals = 0;
      let maxCal = 0;
      let maxCalDate = "N/A";
      let minCal = 999999;
      let minCalDate = "N/A";

      loggedDates.forEach(dateStr => {
        const totals = this.calculateDayTotals(dateStr);
        totalCals += totals.calories;
        
        if (totals.calories > maxCal) {
          maxCal = totals.calories;
          maxCalDate = dateStr;
        }
        if (totals.calories < minCal) {
          minCal = totals.calories;
          minCalDate = dateStr;
        }
      });

      const avgCals = Math.round(totalCals / loggedDates.length);
      this.dom.statsAvgCal.textContent = `${avgCals} kcal`;
      this.dom.statsMaxCal.textContent = `${maxCal} kcal`;
      this.dom.statsMaxCalDate.textContent = maxCalDate;
      this.dom.statsMinCal.textContent = `${minCal} kcal`;
      this.dom.statsMinCalDate.textContent = minCalDate;
      
      const streak = this.calculateStreak();
      this.dom.statsStreak.textContent = `${streak} Day${streak === 1 ? '' : 's'}`;

      // 2. Render Most Consumed Foods
      this.renderStatsTopFoods();

      // 3. Render Canvas Charts
      this.drawWeeklyCalChart(loggedDates);
      this.drawMacroShareChart(loggedDates);
      this.drawMonthlyCalChart(loggedDates);
      this.drawCategoryChart(loggedDates);
    }

    renderEmptyStatsCharts() {
      this.dom.statsTopFoodsList.innerHTML = `<li class="empty-list-placeholder">No foods logged yet.</li>`;
      const canvases = ["weeklyCalChart", "macroShareChart", "monthlyCalChart", "categoryChart"];
      canvases.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = this.state.settings.theme === "light" ? "#64748B" : "#94A3B8";
          ctx.font = "14px Outfit";
          ctx.textAlign = "center";
          ctx.fillText("No data logged to display charts", canvas.width / 2, canvas.height / 2);
        }
      });
    }

    renderStatsTopFoods() {
      const counts = {};
      Object.keys(this.state.records).forEach(d => {
        const rec = this.state.records[d];
        if (rec && rec.foods) {
          rec.foods.forEach(f => {
            const name = f.name;
            counts[name] = (counts[name] || 0) + 1;
          });
        }
      });

      const sorted = Object.keys(counts).map(k => ({ name: k, count: counts[k] })).sort((a,b) => b.count - a.count);
      this.dom.statsTopFoodsList.innerHTML = "";

      if (sorted.length === 0) {
        this.dom.statsTopFoodsList.innerHTML = `<li class="empty-list-placeholder">No foods logged yet.</li>`;
        return;
      }

      const maxCount = sorted[0].count;
      sorted.slice(0, 5).forEach(item => {
        const row = document.createElement("li");
        row.className = "top-food-row";
        
        const pct = Math.round((item.count / maxCount) * 100);

        row.innerHTML = `
          <div class="top-food-details">
            <span>${item.name}</span>
            <span>${item.count} time${item.count === 1 ? '' : 's'}</span>
          </div>
          <div class="top-food-bar-bg">
            <div class="top-food-bar-fill" style="width: ${pct}%; background-color: var(--primary);"></div>
          </div>
        `;
        this.dom.statsTopFoodsList.appendChild(row);
      });
    }

    /* Canvas Drawing Algorithms */
    drawWeeklyCalChart(loggedDates) {
      const canvas = document.getElementById("weeklyCalChart");
      if (!canvas) return;

      // Make canvas resolution responsive to container layout sizing
      canvas.width = canvas.clientWidth || 450;
      canvas.height = canvas.clientHeight || 250;

      const ctx = canvas.getContext("2d");
      
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Collect last 7 calendar days
      const days = [];
      const today = new Date(this.state.selectedDate);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
      }

      const data = days.map(d => {
        const dateStr = this.formatDate(d);
        const totals = this.calculateDayTotals(dateStr);
        return {
          label: d.toLocaleDateString(undefined, { weekday: 'short' }),
          val: totals.calories
        };
      });

      const maxVal = Math.max(this.state.goals.kcal * 1.2, ...data.map(d => d.val));
      
      // Theme colors
      const isLight = this.state.settings.theme === "light";
      const gridColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
      const labelColor = isLight ? "#64748B" : "#94A3B8";
      
      const paddingLeft = 45;
      const paddingBottom = 30;
      const paddingTop = 20;
      const paddingRight = 15;
      
      const graphWidth = canvas.width - paddingLeft - paddingRight;
      const graphHeight = canvas.height - paddingTop - paddingBottom;

      // Draw grid y-lines
      const yTicks = 4;
      ctx.lineWidth = 1;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = labelColor;
      ctx.font = "10px sans-serif";

      for (let i = 0; i <= yTicks; i++) {
        const yVal = Math.round((maxVal / yTicks) * i);
        const yPos = canvas.height - paddingBottom - (graphHeight / yTicks) * i;
        
        ctx.strokeStyle = gridColor;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, yPos);
        ctx.lineTo(canvas.width - paddingRight, yPos);
        ctx.stroke();

        ctx.fillText(yVal, paddingLeft - 8, yPos);
      }

      // Draw goal line overlay
      const goalY = canvas.height - paddingBottom - (graphHeight * (this.state.goals.kcal / maxVal));
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, goalY);
      ctx.lineTo(canvas.width - paddingRight, goalY);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Label Goal
      ctx.fillStyle = "#EF4444";
      ctx.textAlign = "left";
      ctx.fillText(`Goal: ${this.state.goals.kcal}`, paddingLeft + 5, goalY - 8);

      // Draw Bars
      const numBars = data.length;
      const barWidth = (graphWidth / numBars) * 0.5;
      const barSpacing = (graphWidth / numBars);
      
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      data.forEach((item, index) => {
        const xPos = paddingLeft + (barSpacing * index) + (barSpacing - barWidth) / 2;
        const valHeight = graphHeight * (item.val / maxVal);
        const yPos = canvas.height - paddingBottom - valHeight;

        // Draw rounded bar
        ctx.fillStyle = this.state.settings.accentColor;
        
        // Gradient fill
        const gradient = ctx.createLinearGradient(xPos, yPos, xPos, canvas.height - paddingBottom);
        gradient.addColorStop(0, this.state.settings.accentColor);
        gradient.addColorStop(1, "rgba(59, 130, 246, 0.2)");
        ctx.fillStyle = gradient;

        this.drawRoundedRect(ctx, xPos, yPos, barWidth, Math.max(2, valHeight), 6);

        // Value text on top
        if (item.val > 0) {
          ctx.fillStyle = isLight ? "#0F172A" : "#FFFFFF";
          ctx.font = "bold 9px sans-serif";
          ctx.fillText(item.val, xPos + barWidth / 2, yPos - 12);
        }

        // Label day
        ctx.fillStyle = labelColor;
        ctx.font = "10px sans-serif";
        ctx.fillText(item.label, xPos + barWidth / 2, canvas.height - paddingBottom + 8);
      });
    }

    drawMacroShareChart(loggedDates) {
      const canvas = document.getElementById("macroShareChart");
      if (!canvas) return;

      // Make canvas resolution responsive to container layout sizing
      canvas.width = canvas.clientWidth || 450;
      canvas.height = canvas.clientHeight || 250;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate averages across last 30 days
      let totalProt = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let daysCount = 0;

      const today = new Date(this.state.selectedDate);
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = this.formatDate(d);
        const rec = this.state.records[dateStr];
        if (rec && rec.foods && rec.foods.length > 0) {
          const totals = this.calculateDayTotals(dateStr);
          totalProt += totals.protein;
          totalCarbs += totals.carbs;
          totalFat += totals.fat;
          daysCount++;
        }
      }

      if (daysCount === 0) {
        // Fallback to goals share if no logs in last 30 days
        totalProt = this.state.goals.protein;
        totalCarbs = this.state.goals.carbs;
        totalFat = this.state.goals.fat;
      }

      // Convert macros to calorie contribution (Prot=4kcal/g, Carb=4kcal/g, Fat=9kcal/g)
      const calProt = totalProt * 4;
      const calCarbs = totalCarbs * 4;
      const calFat = totalFat * 9;
      const totalCals = calProt + calCarbs + calFat;

      if (totalCals === 0) {
        ctx.fillText("No macronutrients logged", canvas.width / 2, canvas.height / 2);
        return;
      }

      const shares = [
        { label: "Protein", val: calProt, color: "#22C55E", g: Math.round(totalProt / (daysCount || 1)) },
        { label: "Carbs", val: calCarbs, color: "#F59E0B", g: Math.round(totalCarbs / (daysCount || 1)) },
        { label: "Fat", val: calFat, color: "#EF4444", g: Math.round(totalFat / (daysCount || 1)) }
      ];

      // Draw Donut
      const centerX = canvas.width * 0.35;
      const centerY = canvas.height * 0.5;
      const outerRadius = 80;
      const innerRadius = 50;

      let currentAngle = -0.5 * Math.PI;

      shares.forEach(slice => {
        const sliceAngle = (slice.val / totalCals) * 2 * Math.PI;

        ctx.fillStyle = slice.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fill();

        currentAngle += sliceAngle;
      });

      // Draw inner core text
      ctx.fillStyle = this.state.settings.theme === "light" ? "#0F172A" : "#FFFFFF";
      ctx.font = "bold 15px Outfit";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const totalG = shares.reduce((acc, curr) => acc + curr.g, 0);
      ctx.fillText(`${totalG}g`, centerX, centerY - 6);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = this.state.settings.theme === "light" ? "#64748B" : "#94A3B8";
      ctx.fillText("Avg Macros", centerX, centerY + 10);

      // Draw Legends on Right Side
      const legendX = canvas.width * 0.65;
      let legendY = centerY - 30;
      
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      
      shares.forEach(slice => {
        const pct = Math.round((slice.val / totalCals) * 100);
        
        // Dot indicator
        ctx.fillStyle = slice.color;
        ctx.beginPath();
        ctx.arc(legendX, legendY, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Labels
        ctx.fillStyle = this.state.settings.theme === "light" ? "#0F172A" : "#FFFFFF";
        ctx.font = "bold 12px Outfit";
        ctx.fillText(`${slice.label} (${pct}%)`, legendX + 16, legendY);
        
        ctx.font = "11px sans-serif";
        ctx.fillStyle = this.state.settings.theme === "light" ? "#64748B" : "#94A3B8";
        ctx.fillText(`${slice.g}g average`, legendX + 16, legendY + 14);

        legendY += 38;
      });
    }

    drawMonthlyCalChart(loggedDates) {
      const canvas = document.getElementById("monthlyCalChart");
      if (!canvas) return;

      // Make canvas resolution responsive to container layout sizing
      canvas.width = canvas.clientWidth || 900;
      canvas.height = canvas.clientHeight || 250;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get last 30 calendar days
      const days = [];
      const today = new Date(this.state.selectedDate);
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
      }

      const data = days.map(d => {
        const dateStr = this.formatDate(d);
        const totals = this.calculateDayTotals(dateStr);
        return {
          dateStr: dateStr,
          val: totals.calories
        };
      });

      const maxVal = Math.max(this.state.goals.kcal * 1.2, ...data.map(d => d.val));

      const isLight = this.state.settings.theme === "light";
      const gridColor = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)";
      const labelColor = isLight ? "#64748B" : "#94A3B8";

      const paddingLeft = 45;
      const paddingBottom = 30;
      const paddingTop = 20;
      const paddingRight = 15;
      
      const graphWidth = canvas.width - paddingLeft - paddingRight;
      const graphHeight = canvas.height - paddingTop - paddingBottom;

      // Draw Grid Y lines
      const yTicks = 4;
      ctx.lineWidth = 1;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = labelColor;
      ctx.font = "10px sans-serif";

      for (let i = 0; i <= yTicks; i++) {
        const yVal = Math.round((maxVal / yTicks) * i);
        const yPos = canvas.height - paddingBottom - (graphHeight / yTicks) * i;

        ctx.strokeStyle = gridColor;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, yPos);
        ctx.lineTo(canvas.width - paddingRight, yPos);
        ctx.stroke();

        ctx.fillText(yVal, paddingLeft - 8, yPos);
      }

      // Draw Goal Dotted line
      const goalY = canvas.height - paddingBottom - (graphHeight * (this.state.goals.kcal / maxVal));
      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, goalY);
      ctx.lineTo(canvas.width - paddingRight, goalY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Line Chart Path
      const spacingX = graphWidth / (data.length - 1);
      ctx.beginPath();
      
      data.forEach((item, index) => {
        const x = paddingLeft + (spacingX * index);
        const y = canvas.height - paddingBottom - (graphHeight * (item.val / maxVal));
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.strokeStyle = this.state.settings.accentColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Line Gradient Area fill underneath
      ctx.lineTo(paddingLeft + graphWidth, canvas.height - paddingBottom);
      ctx.lineTo(paddingLeft, canvas.height - paddingBottom);
      ctx.closePath();
      
      const areaG = ctx.createLinearGradient(paddingLeft, paddingTop, paddingLeft, canvas.height - paddingBottom);
      areaG.addColorStop(0, "rgba(59, 130, 246, 0.25)");
      areaG.addColorStop(1, "rgba(59, 130, 246, 0.0)");
      ctx.fillStyle = areaG;
      ctx.fill();

      // Draw X Dates Labels (spaced out)
      ctx.fillStyle = labelColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = "9px sans-serif";

      data.forEach((item, index) => {
        if (index % 5 === 0 || index === data.length - 1) {
          const x = paddingLeft + (spacingX * index);
          const dateObj = new Date(item.dateStr);
          const lbl = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          ctx.fillText(lbl, x, canvas.height - paddingBottom + 8);
        }
      });
    }

    drawCategoryChart(loggedDates) {
      const canvas = document.getElementById("categoryChart");
      if (!canvas) return;

      // Make canvas resolution responsive to container layout sizing
      canvas.width = canvas.clientWidth || 450;
      canvas.height = canvas.clientHeight || 250;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Collect calorie breakdown by category for the last 30 days
      const catTotals = {};
      CATEGORIES.slice(0, 12).forEach(cat => { catTotals[cat] = 0; });

      const today = new Date(this.state.selectedDate);
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = this.formatDate(d);
        const rec = this.state.records[dateStr];
        
        if (rec && rec.foods) {
          rec.foods.forEach(f => {
            if (f.category in catTotals) {
              catTotals[f.category] += f.calories;
            }
          });
        }
      }

      // Sort categories
      const sorted = Object.keys(catTotals).map(k => ({ cat: k, val: catTotals[k] })).sort((a,b) => b.val - a.val).filter(item => item.val > 0);

      if (sorted.length === 0) {
        ctx.fillStyle = this.state.settings.theme === "light" ? "#64748B" : "#94A3B8";
        ctx.font = "12px Outfit";
        ctx.textAlign = "center";
        ctx.fillText("No category logs in last 30 days", canvas.width / 2, canvas.height / 2);
        return;
      }

      const paddingLeft = 100;
      const paddingRight = 40;
      const paddingTop = 20;
      const paddingBottom = 20;
      
      const graphWidth = canvas.width - paddingLeft - paddingRight;
      const graphHeight = canvas.height - paddingTop - paddingBottom;
      
      const maxVal = Math.max(...sorted.map(d => d.val));
      const spacingY = graphHeight / sorted.length;
      const barHeight = spacingY * 0.5;

      sorted.forEach((item, index) => {
        const y = paddingTop + (spacingY * index) + (spacingY - barHeight) / 2;
        const width = graphWidth * (item.val / maxVal);

        // Draw horizontal rounded bar
        ctx.fillStyle = this.state.settings.accentColor;
        this.drawRoundedRect(ctx, paddingLeft, y, Math.max(3, width), barHeight, 4);

        // Draw category labels on left
        ctx.fillStyle = this.state.settings.theme === "light" ? "#0F172A" : "#FFFFFF";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = "bold 11px Outfit";
        ctx.fillText(item.cat, paddingLeft - 10, y + barHeight / 2);

        // Draw calorie value inside or next to the bar
        ctx.fillStyle = this.state.settings.theme === "light" ? "#64748B" : "#94A3B8";
        ctx.textAlign = "left";
        ctx.font = "10px sans-serif";
        ctx.fillText(`${item.val} kcal`, paddingLeft + width + 8, y + barHeight / 2);
      });
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
      if (width < 2 * radius) radius = width / 2;
      if (height < 2 * radius) radius = height / 2;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
      ctx.fill();
    }

    /* ==========================================================================
       Global Search Handling
       ========================================================================== */
    handleGlobalSearch() {
      const q = this.dom.globalSearchInput.value.trim().toLowerCase();
      if (!q) {
        this.dom.searchDropdown.classList.add("hidden");
        return;
      }

      this.dom.searchDropdown.innerHTML = "";
      const results = [];

      // 1. Search quick add foods database
      this.state.quickFoods.forEach(food => {
        if (food.name.toLowerCase().includes(q) || food.category.toLowerCase().includes(q)) {
          results.push({
            type: "db",
            title: food.name,
            sub: `Database Food • ${food.category}`,
            val: `${food.calories || food.kcal} kcal`,
            action: () => {
              this.showPage("quick-add");
              this.dom.quickFoodSearch.value = food.name;
              this.renderQuickFoodsList();
            }
          });
        }
      });

      // 2. Search logged records (meals, times, notes)
      Object.keys(this.state.records).forEach(dateStr => {
        const rec = this.state.records[dateStr];
        if (rec && rec.foods) {
          // Check notes or foods
          rec.foods.forEach(food => {
            if (food.name.toLowerCase().includes(q) || (food.notes && food.notes.toLowerCase().includes(q)) || food.category.toLowerCase().includes(q)) {
              results.push({
                type: "log",
                title: food.name,
                sub: `Logged on ${dateStr} • ${food.category} ${food.notes ? `• "${food.notes}"` : ""}`,
                val: `${food.calories} kcal`,
                action: () => {
                  this.state.selectedDate = dateStr;
                  this.updateActiveDateText();
                  this.showPage("daily-log");
                }
              });
            }
          });
        }
      });

      // 3. Search history days by date names
      Object.keys(this.state.records).forEach(dateStr => {
        if (dateStr.includes(q)) {
          const totals = this.calculateDayTotals(dateStr);
          results.push({
            type: "date",
            title: dateStr,
            sub: `Daily record file`,
            val: `${totals.calories} kcal`,
            action: () => {
              this.state.selectedDate = dateStr;
              this.updateActiveDateText();
              this.showPage("daily-log");
            }
          });
        }
      });

      if (results.length === 0) {
        this.dom.searchDropdown.innerHTML = `<div class="empty-list-placeholder">No matching results found</div>`;
        this.dom.searchDropdown.classList.remove("hidden");
        return;
      }

      // Populate list
      results.slice(0, 10).forEach(res => {
        const item = document.createElement("div");
        item.className = "search-result-item";
        
        item.innerHTML = `
          <div class="search-result-info">
            <span class="search-result-title">${res.title}</span>
            <span class="search-result-meta">${res.sub}</span>
          </div>
          <span class="search-result-kcal">${res.val}</span>
        `;
        
        item.addEventListener("click", () => {
          res.action();
          this.dom.searchDropdown.classList.add("hidden");
          this.dom.globalSearchInput.value = "";
        });

        this.dom.searchDropdown.appendChild(item);
      });

      this.dom.searchDropdown.classList.remove("hidden");
    }

    /* ==========================================================================
       Modals Engine & Templates
       ========================================================================== */
    openModal(title, bodyHTML) {
      this.dom.modalTitle.textContent = title;
      this.dom.modalBody.innerHTML = bodyHTML;
      this.dom.modalBackdrop.classList.remove("hidden");
    }

    closeModal() {
      this.dom.modalBackdrop.classList.add("hidden");
      this.dom.modalBody.innerHTML = "";
    }

    openCustomUnitModal() {
      const template = document.getElementById("template-custom-unit").innerHTML;
      this.openModal("Create Custom Unit", template);

      // Event binds inside modal body
      const input = document.getElementById("newUnitName");
      const confirmBtn = document.getElementById("confirmAddUnitBtn");
      const cancelBtns = this.dom.modalBody.querySelectorAll(".modal-cancel-btn");

      cancelBtns.forEach(btn => btn.addEventListener("click", () => this.closeModal()));
      
      confirmBtn.addEventListener("click", async () => {
        const name = input.value.trim().toLowerCase();
        if (!name) {
          this.showToast("Unit name cannot be empty!", "warning");
          return;
        }
        if (DEFAULT_UNITS.includes(name) || this.state.settings.customUnits.includes(name)) {
          this.showToast("Unit already exists!", "warning");
          return;
        }

        this.state.settings.customUnits.push(name);
        await SupabaseDB.saveSettings(this.state.settings);
        this.populateUnitsDropdowns();
        this.closeModal();
        this.showToast(`Custom unit "${name}" added! ☁️`, "success");
      });
    }

    openCustomFoodModal() {
      const template = document.getElementById("template-custom-food").innerHTML;
      this.openModal("Add Custom Food to Database", template);

      const cancelBtns = this.dom.modalBody.querySelectorAll(".modal-cancel-btn");
      cancelBtns.forEach(btn => btn.addEventListener("click", () => this.closeModal()));

      // Populate select units inside modal
      const selectUnit = document.getElementById("custUnit");
      const allUnits = [...DEFAULT_UNITS, ...this.state.settings.customUnits];
      selectUnit.innerHTML = "";
      allUnits.forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit;
        selectUnit.appendChild(opt);
      });

      const confirmBtn = document.getElementById("confirmAddFoodBtn");
      confirmBtn.addEventListener("click", async () => {
        const name = document.getElementById("custFoodName").value.trim();
        const qty = parseFloat(document.getElementById("custQuantity").value) || 1;
        const unit = selectUnit.value;
        const kcal = Math.round(parseFloat(document.getElementById("custCalories").value));
        const prot = parseFloat(document.getElementById("custProtein").value) || 0;
        const carbs = parseFloat(document.getElementById("custCarbs").value) || 0;
        const fat = parseFloat(document.getElementById("custFat").value) || 0;
        const category = document.getElementById("custCategory").value;
        const icon = document.getElementById("custIcon").value.trim() || "🥗";

        if (!name || isNaN(kcal)) {
          this.showToast("Please enter a valid food name and calorie count!", "warning");
          return;
        }

        const newFood = {
          name,
          defaultQuantity: qty,
          unit,
          calories: kcal,
          protein: prot,
          carbs,
          fat,
          category,
          icon,
          favorite: false
        };

        const saved = await SupabaseDB.insertQuickFood(newFood);
        newFood.id = saved.id;
        this.state.quickFoods.push(newFood);
        this.renderQuickFoodsList();
        this.closeModal();
        this.showToast(`${name} added to database! ☁️`, "success");
      });
    }

    openEditLoggedFoodModal(food) {
      const template = document.getElementById("template-edit-logged-food").innerHTML;
      this.openModal(`Edit ${food.name}`, template);

      // Populate input values
      document.getElementById("editFoodName").value = food.name;
      document.getElementById("editQuantity").value = food.quantity;
      document.getElementById("editCalories").value = food.calories;
      document.getElementById("editProtein").value = food.protein;
      document.getElementById("editCarbs").value = food.carbs;
      document.getElementById("editFat").value = food.fat;
      document.getElementById("editTime").value = food.time;
      document.getElementById("editCategory").value = food.category;
      document.getElementById("editNotes").value = food.notes || "";

      // Load units
      const selectUnit = document.getElementById("editUnit");
      const allUnits = [...DEFAULT_UNITS, ...this.state.settings.customUnits];
      selectUnit.innerHTML = "";
      allUnits.forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit;
        selectUnit.appendChild(opt);
      });
      selectUnit.value = food.unit;

      const cancelBtns = this.dom.modalBody.querySelectorAll(".modal-cancel-btn");
      cancelBtns.forEach(btn => btn.addEventListener("click", () => this.closeModal()));

      const confirmBtn = document.getElementById("confirmEditFoodBtn");
      confirmBtn.addEventListener("click", async () => {
        const name = document.getElementById("editFoodName").value.trim();
        const qty = parseFloat(document.getElementById("editQuantity").value) || 1;
        const unit = selectUnit.value;
        const kcal = Math.round(parseFloat(document.getElementById("editCalories").value));
        const prot = parseFloat(document.getElementById("editProtein").value) || 0;
        const carbs = parseFloat(document.getElementById("editCarbs").value) || 0;
        const fat = parseFloat(document.getElementById("editFat").value) || 0;
        const time = document.getElementById("editTime").value;
        const category = document.getElementById("editCategory").value;
        const notes = document.getElementById("editNotes").value.trim();

        if (!name || isNaN(kcal)) {
          this.showToast("Please enter a valid food name and calories!", "warning");
          return;
        }

        // Apply edits
        food.name = name;
        food.quantity = qty;
        food.unit = unit;
        food.calories = kcal;
        food.protein = prot;
        food.carbs = carbs;
        food.fat = fat;
        food.time = time;
        food.category = category;
        food.notes = notes;

        await SupabaseDB.updateFoodLogEntry(food.id, food);
        this.renderNavWidget();
        this.renderDailyLog();
        this.closeModal();
        this.showToast("Changes saved! ☁️", "success");
      });
    }

    openEditQuickFoodModal(food) {
      const template = document.getElementById("template-custom-food").innerHTML;
      this.openModal(`Edit Database: ${food.name}`, template);

      // Pre-fill database values
      document.getElementById("custFoodName").value = food.name;
      document.getElementById("custQuantity").value = food.defaultQuantity;
      document.getElementById("custCalories").value = food.calories || food.kcal;
      document.getElementById("custProtein").value = food.protein;
      document.getElementById("custCarbs").value = food.carbs;
      document.getElementById("custFat").value = food.fat;
      document.getElementById("custCategory").value = food.category;
      document.getElementById("custIcon").value = food.icon || "🥗";

      // Load units
      const selectUnit = document.getElementById("custUnit");
      const allUnits = [...DEFAULT_UNITS, ...this.state.settings.customUnits];
      selectUnit.innerHTML = "";
      allUnits.forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit;
        selectUnit.appendChild(opt);
      });
      selectUnit.value = food.unit;

      const cancelBtns = this.dom.modalBody.querySelectorAll(".modal-cancel-btn");
      cancelBtns.forEach(btn => btn.addEventListener("click", () => this.closeModal()));

      const confirmBtn = document.getElementById("confirmAddFoodBtn");
      confirmBtn.textContent = "Save Changes";
      confirmBtn.addEventListener("click", async () => {
        const name = document.getElementById("custFoodName").value.trim();
        const qty = parseFloat(document.getElementById("custQuantity").value) || 1;
        const unit = selectUnit.value;
        const kcal = Math.round(parseFloat(document.getElementById("custCalories").value));
        const prot = parseFloat(document.getElementById("custProtein").value) || 0;
        const carbs = parseFloat(document.getElementById("custCarbs").value) || 0;
        const fat = parseFloat(document.getElementById("custFat").value) || 0;
        const category = document.getElementById("custCategory").value;
        const icon = document.getElementById("custIcon").value.trim() || "🥗";

        if (!name || isNaN(kcal)) {
          this.showToast("Please enter a valid food name and calories!", "warning");
          return;
        }

        // Apply edits
        food.name = name;
        food.defaultQuantity = qty;
        food.unit = unit;
        food.calories = kcal;
        food.kcal = kcal;
        food.protein = prot;
        food.carbs = carbs;
        food.fat = fat;
        food.category = category;
        food.icon = icon;

        await SupabaseDB.updateQuickFood(food.id, food);
        this.renderQuickFoodsList();
        this.closeModal();
        this.showToast("Database item updated! ☁️", "success");
      });
    }

    /* ==========================================================================
       Import / Export Data File Operations
       ========================================================================== */
    async exportDataAsJSON() {
      try {
        this.showToast("Preparing cloud export…", "success");
        const allData = await SupabaseDB.exportAllData();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
        const a = document.createElement('a');
        a.setAttribute("href", dataStr);
        a.setAttribute("download", `auranutri_backup_${this.state.selectedDate}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        this.showToast("Cloud backup exported! ☁️", "success");
      } catch (e) {
        console.error(e);
        this.showToast("Export failed. Check your connection.", "danger");
      }
    }

    handleDataImport(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          
          // Schema Validation
          if (parsed && typeof parsed === "object" && parsed.goals && parsed.settings && parsed.quickFoods) {
            this.openImportConflictModal(parsed);
          } else {
            throw new Error("Invalid schema structure");
          }
        } catch (err) {
          this.dom.importFileStatus.innerHTML = `<span class="text-danger">Error: Selected file is not a valid AuraNutri backup structure.</span>`;
          this.showToast("Import failed: Invalid file schema", "danger");
        }
      };
      reader.readAsText(file);
    }

    openImportConflictModal(parsedData) {
      const template = document.getElementById("template-import-conflict").innerHTML;
      this.openModal("Import Backup Options", template);

      const cancelBtns = this.dom.modalBody.querySelectorAll(".modal-cancel-btn");
      cancelBtns.forEach(btn => btn.addEventListener("click", () => this.closeModal()));

      const optReplace = document.getElementById("importOptReplace");
      const optMerge = document.getElementById("importOptMerge");
      
      let importMethod = "replace";

      optReplace.addEventListener("click", () => {
        optReplace.classList.add("active");
        optMerge.classList.remove("active");
        importMethod = "replace";
      });

      optMerge.addEventListener("click", () => {
        optMerge.classList.add("active");
        optReplace.classList.remove("active");
        importMethod = "merge";
      });

      const confirmBtn = document.getElementById("confirmImportBtn");
      confirmBtn.addEventListener("click", async () => {
        if (importMethod === "replace") {
          // Replace entire state
          this.state = parsedData;
        } else {
          // Merge Data
          // Merge Settings & Goals
          this.state.goals = { ...this.state.goals, ...parsedData.goals };
          this.state.settings = { ...this.state.settings, ...parsedData.settings };
          
          // Merge Quick Foods by unique names
          parsedData.quickFoods.forEach(food => {
            if (!this.state.quickFoods.some(q => q.name.toLowerCase() === food.name.toLowerCase())) {
              this.state.quickFoods.push(food);
            }
          });

          // Merge Records
          Object.keys(parsedData.records).forEach(dateStr => {
            if (this.state.records[dateStr]) {
              // Merge daily foods if logs exist
              parsedData.records[dateStr].foods.forEach(f => {
                if (!this.state.records[dateStr].foods.some(orig => orig.name.toLowerCase() === f.name.toLowerCase() && orig.time === f.time)) {
                  this.state.records[dateStr].foods.push(f);
                }
              });
              // Keep maximum logged water
              this.state.records[dateStr].water = Math.max(this.state.records[dateStr].water || 0, parsedData.records[dateStr].water || 0);
            } else {
              this.state.records[dateStr] = parsedData.records[dateStr];
            }
          });
        }

        this.showToast("Uploading to cloud…", "success");
        await SupabaseDB.importAllData(importMethod === 'replace' ? parsedData : parsedData);
        await this.loadFromSupabase();
        this.applyThemeAndSettings();
        this.renderAllViews();
        this.closeModal();
        this.dom.importFileStatus.innerHTML = `<span class="text-success">Cloud import complete! ☁️</span>`;
        this.showToast("Data imported to Supabase! ☁️", "success");
      });
    }

    /* ==========================================================================
       Application Settings & Reset Control
       ========================================================================== */
    renderSettingsForm() {
      // Theme selection
      if (this.state.settings.theme === "light") {
        this.dom.themeLight.checked = true;
      } else {
        this.dom.themeDark.checked = true;
      }

      // Preset colors highlight
      document.querySelectorAll(".color-preset-btn").forEach(btn => {
        if (btn.getAttribute("data-color").toLowerCase() === this.state.settings.accentColor.toLowerCase()) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
      this.dom.customAccentColor.value = this.state.settings.accentColor;

      // Switch toggles
      this.dom.animationToggle.checked = this.state.settings.animationsEnabled;
      this.dom.compactModeToggle.checked = this.state.settings.compactMode;
      this.dom.backupReminderToggle.checked = this.state.settings.backupReminder;
    }

    async updateSetting(key, value) {
      this.state.settings[key] = value;
      this.applyThemeAndSettings();
      this.renderNavWidget();
      await SupabaseDB.saveSettings(this.state.settings);
      if (key === "accentColor" && this.currentPage === "statistics") {
        this.renderStatistics();
      }
    }

    async confirmSystemReset() {
      if (confirm("WARNING: This will permanently erase ALL cloud data — logs, goals, settings, and foods. Are you absolutely sure?")) {
        this.showToast("Purging cloud data…", "danger");
        try {
          const { createClient } = window.supabase;
          const sb = createClient(window._SUPABASE_URL, window._SUPABASE_ANON);
          const uid = window.SupabaseDB ? window.SupabaseDB.USER_ID : 'shared-kcal-tracker-user';
          await Promise.all([
            sb.from('food_log_entries').delete().eq('user_id', uid),
            sb.from('daily_records').delete().eq('user_id', uid),
            sb.from('quick_foods').delete().eq('user_id', uid),
            sb.from('user_profile').delete().eq('user_id', uid)
          ]);
        } catch (e) { console.error(e); }
        setTimeout(() => window.location.reload(), 1500);
      }
    }

    /* ==========================================================================
       Core Calculation & Helper Functions
       ========================================================================== */
    calculateDayTotals(dateStr) {
      const rec = this.state.records[dateStr];
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      if (rec && rec.foods) {
        rec.foods.forEach(food => {
          totals.calories += food.calories || 0;
          totals.protein += food.protein || 0;
          totals.carbs += food.carbs || 0;
          totals.fat += food.fat || 0;
        });
      }

      // Round calories, floor macros
      totals.calories = Math.round(totals.calories);
      totals.protein = parseFloat(totals.protein.toFixed(1));
      totals.carbs = parseFloat(totals.carbs.toFixed(1));
      totals.fat = parseFloat(totals.fat.toFixed(1));
      
      return totals;
    }

    calculateStreak() {
      // Counts continuous days backwards from selectedDate with logged foods
      let streak = 0;
      let checkDate = new Date(); // Start counting from today
      
      while (true) {
        const dateStr = this.formatDate(checkDate);
        const record = this.state.records[dateStr];
        
        if (record && record.foods && record.foods.length > 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // If we checked today and it's empty, we check yesterday. If yesterday is also empty, streak is 0.
          if (streak === 0 && dateStr === this.formatDate(new Date())) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = this.formatDate(yesterday);
            const yesterdayRecord = this.state.records[yesterdayStr];
            if (yesterdayRecord && yesterdayRecord.foods && yesterdayRecord.foods.length > 0) {
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
          }
          break;
        }
      }
      return streak;
    }

    getOrCreateDayRecord(dateStr) {
      if (!this.state.records[dateStr]) {
        this.state.records[dateStr] = {
          foods: [],
          water: 0,
          weight: this.state.goals.weight // default to current goal weight
        };
      }
      return this.state.records[dateStr];
    }

    /* Helper Utilities */
    formatDate(dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    getCurrentTimeStr() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }

    generateUUID() {
      return 'uuid-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    }

    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }

    updateProgressRing(circleEl, radius, percentage) {
      if (!circleEl) return;
      const circumference = radius * 2 * Math.PI;
      circleEl.style.strokeDasharray = `${circumference} ${circumference}`;
      
      const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
      circleEl.style.strokeDashoffset = offset;
    }

    animateCounter(element, targetVal) {
      if (!element) return;
      if (!this.state.settings.animationsEnabled) {
        element.textContent = targetVal;
        return;
      }

      let current = 0;
      const duration = 800; // ms
      const stepTime = 16; // roughly 60fps
      const steps = duration / stepTime;
      const increment = targetVal / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetVal) {
          element.textContent = targetVal;
          clearInterval(timer);
        } else {
          element.textContent = Math.round(current);
        }
      }, stepTime);
    }

    showToast(message, type = "success", undoCallback = null) {
      const toast = document.createElement("div");
      toast.className = `toast toast-${type}`;
      
      toast.innerHTML = `
        <div class="toast-content">${message}</div>
        <div style="display:flex; align-items:center; gap: 8px;">
          ${undoCallback ? `<button class="btn btn-secondary btn-small toast-undo-btn">Undo</button>` : ""}
          <button class="toast-close-btn">&times;</button>
        </div>
      `;

      // Undo bind
      if (undoCallback) {
        toast.querySelector(".toast-undo-btn").addEventListener("click", () => {
          undoCallback();
          toast.remove();
        });
      }

      // Close bind
      toast.querySelector(".toast-close-btn").addEventListener("click", () => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(12px) scale(0.9)";
        setTimeout(() => toast.remove(), 300);
      });

      this.dom.toastContainer.appendChild(toast);

      // Auto-remove
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.opacity = "0";
          toast.style.transform = "translateY(12px) scale(0.9)";
          setTimeout(() => toast.remove(), 300);
        }
      }, 4000);
    }
  }

  /* ==========================================================================
     STANDALONE NAVIGATION BOOTSTRAP
     Runs immediately — independent of Supabase, independent of app class.
     This is the single source of truth for all page routing.
     ========================================================================== */
  function goToPage(pageId) {
    if (!pageId) return;

    if (pageId === 'logout') {
      if (window.app) {
        window.app.handleLogout();
      } else {
        sessionStorage.removeItem('auranutri_logged_in');
        document.body.classList.add('not-logged-in');
      }
      return;
    }

    if (sessionStorage.getItem('auranutri_logged_in') !== 'true') {
      return;
    }

    // 1. Switch visible section
    document.querySelectorAll('.page-section').forEach(function(s) {
      s.classList.toggle('active', s.id === 'section-' + pageId);
    });

    // 2. Update sidebar active link
    document.querySelectorAll('.nav-link').forEach(function(l) {
      l.classList.toggle('active', l.getAttribute('data-page') === pageId);
    });

    // 3. Close sidebar on mobile
    if (window.innerWidth <= 768) {
      var sb = document.getElementById('appSidebar');
      if (sb) sb.classList.remove('open');
    }

    // 4. Update URL hash (won't loop because of the guard in the hashchange handler)
    if (window.location.hash.replace('#', '') !== pageId) {
      history.pushState(null, '', '#' + pageId);
    }

    // 5. Ask the app class to render data for this page (if app is ready)
    if (window.app) {
      window.app.currentPage = pageId;
      window.app.renderCurrentPageData(pageId);
    }
  }

  // Expose globally so app class can call it via showPage()
  window.goToPage = goToPage;

  // Wire up nav links immediately (no waiting for Supabase)
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      goToPage(link.getAttribute('data-page'));
    });
  });

  // Wire up [data-link] card shortcut buttons
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-link]');
    if (el) {
      e.preventDefault();
      goToPage(el.getAttribute('data-link'));
    }
  });

  // Handle browser back / forward / direct URL (e.g. /#daily-log)
  window.addEventListener('hashchange', function() {
    var page = window.location.hash.replace('#', '');
    if (page) goToPage(page);
  });

  // Mobile sidebar open/close buttons
  var openBtn  = document.getElementById('openSidebarBtn');
  var closeBtn = document.getElementById('closeSidebarBtn');
  var sidebar  = document.getElementById('appSidebar');
  if (openBtn  && sidebar) openBtn.addEventListener('click',  function() { sidebar.classList.add('open'); });
  if (closeBtn && sidebar) closeBtn.addEventListener('click', function() { sidebar.classList.remove('open'); });

  // Navigate to initial hash on first load
  var _initPage = window.location.hash.replace('#', '') || 'dashboard';
  goToPage(_initPage);

  /* ==========================================================================
     APP INITIALIZER  — called by HTML after supabase.js + script.js load
     ========================================================================== */
  window.initAuraNutriApp = function() {
    if (window.app) return; // already initialized
    window.app = new AuraNutriApp();
    window.app.init();
  };

})();
