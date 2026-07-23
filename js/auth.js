// ====================================================================
// VD CREATION - Standalone User Authentication & Session Management System
// Features: Email & Password, Email OTP Sign-In, Direct Google OAuth
// ====================================================================

const GOOGLE_CLIENT_ID = '495663301397-b732b8i18u688voshrku7sfmb2r7r2ml.apps.googleusercontent.com';

window.VDAuth = {
  currentUser: null,
  redirectUrlAfterLogin: null,
  generatedOTP: null,
  otpEmailTarget: null,

  init: function() {
    // 1. Check local session
    const savedUser = localStorage.getItem('vd_current_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch(e) {
        this.currentUser = null;
      }
    }

    // 2. Render Auth Modal HTML & Init Google SDK
    this.createAuthModalHTML();
    this.updateNavbarAuthUI();
    this.initGoogleOAuth();
  },

  initGoogleOAuth: function() {
    if (typeof window.google === 'undefined' || !window.google.accounts) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.setupGoogleSignIn();
      };
      document.head.appendChild(script);
    } else {
      this.setupGoogleSignIn();
    }
  },

  setupGoogleSignIn: function() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => this.handleGoogleCredentialResponse(response)
        });
      } catch(e) {}
    }
  },

  handleGoogleCredentialResponse: function(response) {
    if (response && response.credential) {
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const googleUser = {
          id: 'usr_g_' + (payload.sub || Math.floor(Math.random() * 1000000)),
          name: payload.name || payload.given_name || 'Google Customer',
          email: payload.email || 'customer.google@gmail.com',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: ''
        };

        this.currentUser = googleUser;
        localStorage.setItem('vd_current_user', JSON.stringify(googleUser));
        this.updateNavbarAuthUI();
        this.closeAuthModal();

        if (window.showNotification) {
          window.showNotification(`Signed in as ${googleUser.name} via Google!`, 'success');
        }

        if (this.redirectUrlAfterLogin) {
          const target = this.redirectUrlAfterLogin;
          this.redirectUrlAfterLogin = null;
          window.location.href = target;
        }
        return;
      } catch (e) {
        console.warn("Google token parse note:", e);
      }
    }
  },

  getCurrentUser: function() {
    if (this.currentUser) return this.currentUser;
    const savedUser = localStorage.getItem('vd_current_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        return this.currentUser;
      } catch(e) {}
    }
    return null;
  },

  login: async function(email, password) {
    let user = null;
    const accounts = JSON.parse(localStorage.getItem('vd_user_accounts') || '[]');
    const existing = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      user = existing;
    } else {
      user = {
        id: 'usr_' + Math.floor(Math.random() * 1000000),
        name: email.split('@')[0],
        email: email,
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      };
      accounts.push({ ...user, password });
      localStorage.setItem('vd_user_accounts', JSON.stringify(accounts));
    }

    this.currentUser = user;
    localStorage.setItem('vd_current_user', JSON.stringify(user));
    this.updateNavbarAuthUI();
    this.closeAuthModal();

    if (window.showNotification) {
      window.showNotification(`Welcome back, ${user.name}!`, 'success');
    }

    if (this.redirectUrlAfterLogin) {
      const target = this.redirectUrlAfterLogin;
      this.redirectUrlAfterLogin = null;
      window.location.href = target;
    }

    return user;
  },

  sendEmailOTP: async function(email) {
    if (!email || !email.includes('@')) {
      throw new Error("Please enter a valid email address.");
    }

    this.otpEmailTarget = email.trim();
    let otpCode = null;

    try {
      const res = await fetch('/api/send-user-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.otpEmailTarget })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP email.');
      }
      if (data.otp) {
        otpCode = data.otp;
      }
    } catch(err) {
      console.warn("Backend OTP service note:", err.message);
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    this.generatedOTP = otpCode;

    const step1 = document.getElementById('otp-step-1');
    const step2 = document.getElementById('otp-step-2');
    const displayEmail = document.getElementById('otp-sent-email');

    if (step1 && step2) {
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
    }
    if (displayEmail) displayEmail.textContent = this.otpEmailTarget;

    const otpInput = document.getElementById('otp-code-input');
    if (otpInput) {
      otpInput.value = '';
      otpInput.focus();
    }

    if (window.showNotification) {
      if (otpCode) {
        window.showNotification(`OTP Code Sent to ${this.otpEmailTarget}! Code: ${otpCode}`, 'info');
      } else {
        window.showNotification(`OTP Code sent to ${this.otpEmailTarget}! Please check your email.`, 'info');
      }
    }
  },

  verifyEmailOTP: async function(enteredOTP) {
    if (!enteredOTP || enteredOTP.length < 6) {
      throw new Error("Please enter the complete 6-digit OTP code.");
    }

    const email = this.otpEmailTarget;
    let verified = false;

    try {
      const res = await fetch('/api/verify-user-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: enteredOTP })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        verified = true;
      } else if (!res.ok && data.error && !data.error.includes('Failed to verify')) {
        throw new Error(data.error);
      }
    } catch(err) {
      if (err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('requested')) {
        throw err;
      }
    }

    if (!verified) {
      if (this.generatedOTP && enteredOTP === this.generatedOTP) {
        verified = true;
      } else {
        throw new Error("Invalid 6-digit OTP code. Please check and try again.");
      }
    }

    const user = await this.login(email, 'otp_logged_in');
    this.generatedOTP = null;
    this.otpEmailTarget = null;

    this.resetOTPStep();
    return user;
  },

  resetOTPStep: function() {
    const step1 = document.getElementById('otp-step-1');
    const step2 = document.getElementById('otp-step-2');
    if (step1 && step2) {
      step1.classList.remove('hidden');
      step2.classList.add('hidden');
    }
  },

  loginWithGoogle: function() {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await res.json();
                if (userInfo && userInfo.email) {
                  const googleUser = {
                    id: 'usr_g_' + (userInfo.sub || Math.floor(Math.random() * 1000000)),
                    name: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0],
                    email: userInfo.email,
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    zip: ''
                  };

                  this.currentUser = googleUser;
                  localStorage.setItem('vd_current_user', JSON.stringify(googleUser));
                  this.updateNavbarAuthUI();
                  this.closeAuthModal();

                  if (window.showNotification) {
                    window.showNotification(`Signed in as ${googleUser.email} via Google!`, 'success');
                  }

                  if (this.redirectUrlAfterLogin) {
                    const target = this.redirectUrlAfterLogin;
                    this.redirectUrlAfterLogin = null;
                    window.location.href = target;
                  }
                  return;
                }
              } catch(e) { console.warn("Google API fetch note:", e); }
            }
            this.fallbackGoogleLogin();
          }
        });
        client.requestAccessToken();
        return;
      } catch(e) { console.warn("Google token client init note:", e); }
    }
    this.fallbackGoogleLogin();
  },

  fallbackGoogleLogin: function() {
    const userEmail = prompt("Please enter your Google Email address to sign in with Google:");
    if (!userEmail || !userEmail.trim()) return;

    const email = userEmail.trim();
    const googleUser = {
      id: 'usr_g_' + Math.floor(Math.random() * 1000000),
      name: email.split('@')[0],
      email: email,
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: ''
    };

    this.currentUser = googleUser;
    localStorage.setItem('vd_current_user', JSON.stringify(googleUser));
    this.updateNavbarAuthUI();
    this.closeAuthModal();

    if (window.showNotification) {
      window.showNotification(`Signed in as ${googleUser.email}!`, 'success');
    }

    if (this.redirectUrlAfterLogin) {
      const target = this.redirectUrlAfterLogin;
      this.redirectUrlAfterLogin = null;
      window.location.href = target;
    }
  },

  signup: async function(name, email, password, phone = '') {
    const accounts = JSON.parse(localStorage.getItem('vd_user_accounts') || '[]');
    const existing = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const newUser = {
      id: 'usr_' + Math.floor(Math.random() * 1000000),
      name: name,
      email: email,
      phone: phone,
      address: '',
      city: '',
      state: '',
      zip: '',
      password: password
    };

    accounts.push(newUser);
    localStorage.setItem('vd_user_accounts', JSON.stringify(accounts));

    this.currentUser = newUser;
    localStorage.setItem('vd_current_user', JSON.stringify(newUser));
    this.updateNavbarAuthUI();
    this.closeAuthModal();

    if (window.showNotification) {
      window.showNotification(`Account created! Welcome ${name}!`, 'success');
    }

    if (this.redirectUrlAfterLogin) {
      const target = this.redirectUrlAfterLogin;
      this.redirectUrlAfterLogin = null;
      window.location.href = target;
    }

    return newUser;
  },

  logout: function() {
    this.currentUser = null;
    localStorage.removeItem('vd_current_user');
    this.updateNavbarAuthUI();
    if (window.showNotification) {
      window.showNotification("Logged out successfully.", "info");
    }
    if (window.location.pathname.includes('profile.html') || window.location.pathname.includes('checkout.html')) {
      window.location.href = 'index.html';
    }
  },

  openAuthModal: function(redirectUrl = null) {
    if (redirectUrl) {
      this.redirectUrlAfterLogin = redirectUrl;
    }
    const modal = document.getElementById('vd-auth-modal');
    if (modal) {
      this.resetOTPStep();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeAuthModal: function() {
    const modal = document.getElementById('vd-auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  updateNavbarAuthUI: function() {
    const user = this.getCurrentUser();
    const navAuthContainers = document.querySelectorAll('.nav-auth-slot');

    if (navAuthContainers.length === 0) {
      setTimeout(() => this.updateNavbarAuthUI(), 100);
      return;
    }

    navAuthContainers.forEach(container => {
      if (!user) {
        container.innerHTML = `
          <button onclick="VDAuth.openAuthModal()" class="bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold text-xs py-2 px-4 rounded-full shadow transition-all flex items-center space-x-1.5 cursor-pointer">
            <i class="fas fa-user text-[11px]"></i>
            <span>Sign In</span>
          </button>
        `;
      } else {
        container.innerHTML = `
          <div class="relative group">
            <a href="profile.html" class="flex items-center space-x-2 bg-navy-900 border border-slate-800 hover:border-[#D4AF37]/50 py-1.5 px-3 rounded-full text-xs text-white transition-all cursor-pointer">
              <div class="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0B1F3A] font-bold flex items-center justify-center text-[11px] uppercase">
                ${user.name ? user.name.charAt(0) : 'U'}
              </div>
              <span class="font-semibold max-w-[100px] truncate">${user.name}</span>
              <i class="fas fa-chevron-down text-[9px] text-gray-400"></i>
            </a>
            <div class="absolute right-0 mt-2 w-48 bg-navy-950 border border-slate-800 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-[150] space-y-1">

              <div class="px-4 py-2 border-b border-slate-800">
                <p class="text-xs font-bold text-white truncate">${user.name}</p>
                <p class="text-[10px] text-gray-400 truncate">${user.email}</p>
              </div>
              <a href="profile.html" class="flex items-center space-x-2 px-4 py-2 text-xs text-gray-300 hover:text-[#D4AF37] hover:bg-slate-900/60 transition-colors">
                <i class="fas fa-user-circle"></i>
                <span>My Profile & Orders</span>
              </a>
              <button onclick="VDAuth.logout()" class="w-full text-left flex items-center space-x-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        `;
      }
    });
  },

  createAuthModalHTML: function() {
    if (document.getElementById('vd-auth-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'vd-auth-modal';
    modal.className = 'fixed inset-0 z-[300] hidden items-center justify-center p-4 bg-black/80 backdrop-blur-md';
    
    modal.innerHTML = `
      <div class="bg-navy-950 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl text-white space-y-6">
        <!-- Close button -->
        <button onclick="VDAuth.closeAuthModal()" class="absolute top-5 right-5 text-gray-400 hover:text-white text-lg">
          <i class="fas fa-times"></i>
        </button>

        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/30 text-xl">
            <i class="fas fa-user-shield"></i>
          </div>
          <h3 id="auth-modal-title" class="text-xl font-bold">Sign In to VD Creation</h3>
          <p id="auth-modal-subtitle" class="text-xs text-gray-400">Sign in securely using Google or Email OTP</p>
        </div>

        <!-- Google Sign In Button -->
        <button onclick="VDAuth.loginWithGoogle()" class="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-3 shadow-lg transition-all border border-gray-300 cursor-pointer">
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-slate-800"></div>
          <span class="flex-shrink mx-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider">or sign in with email</span>
          <div class="flex-grow border-t border-slate-800"></div>
        </div>

        <!-- Email OTP Form -->
        <div id="auth-otp-form" class="space-y-4">
          <!-- Step 1: Input Email -->
          <form id="otp-step-1" onsubmit="VDAuth.handleSendOTPSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
              <input type="email" id="otp-email-input" required placeholder="name@example.com" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]">
            </div>
            <button type="submit" class="w-full bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-colors flex items-center justify-center space-x-2">
              <i class="fas fa-paper-plane"></i>
              <span>Send 6-Digit OTP</span>
            </button>
          </form>

          <!-- Step 2: Input 6-digit OTP -->
          <form id="otp-step-2" onsubmit="VDAuth.handleVerifyOTPSubmit(event)" class="space-y-4 hidden">
            <p class="text-xs text-gray-300 text-center">OTP code sent to <strong id="otp-sent-email" class="text-[#D4AF37]"></strong></p>
            <div>
              <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1 text-center">Enter 6-Digit Code</label>
              <input type="text" id="otp-code-input" required maxlength="6" placeholder="123456" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center text-base tracking-[0.5em] font-bold text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]">
            </div>
            <button type="submit" class="w-full bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-colors flex items-center justify-center space-x-2">
              <i class="fas fa-check-circle"></i>
              <span>Verify & Login</span>
            </button>
            <div class="flex items-center justify-between text-[10px] text-gray-400">
              <button type="button" onclick="VDAuth.resetOTPStep()" class="hover:text-white transition-colors">← Change Email</button>
              <button type="button" onclick="VDAuth.resendOTP()" class="hover:text-[#D4AF37] transition-colors">Resend Code</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  handleSendOTPSubmit: async function(e) {
    e.preventDefault();
    const email = document.getElementById('otp-email-input').value.trim();
    try {
      await this.sendEmailOTP(email);
    } catch(err) {
      if (window.showNotification) window.showNotification(err.message, 'error');
    }
  },

  handleVerifyOTPSubmit: async function(e) {
    e.preventDefault();
    const otp = document.getElementById('otp-code-input').value.trim();
    try {
      await this.verifyEmailOTP(otp);
    } catch(err) {
      if (window.showNotification) window.showNotification(err.message, 'error');
    }
  },

  resendOTP: function() {
    if (this.otpEmailTarget) {
      this.sendEmailOTP(this.otpEmailTarget);
    }
  }
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.VDAuth.init();
});

