// Hanko Authentication Integration
console.log('🔥 HANKO AUTH LOADING...');

let hankoInstance = null;
let currentUser = null;

// Configuration - Replace with your own Hanko Cloud project URL
const HANKO_API_URL = 'https://f4b3cb25-2230-4d66-9c21-40d95c6aba82.hanko.io';

// Note: This is a demo URL. For production, create your own Hanko Cloud project at:
// https://cloud.hanko.io and replace this URL with your project's API URL

async function initHanko() {
    console.log('🔍 Initializing Hanko authentication...');
    
    try {
        // Wait for Hanko elements to be available
        await waitForHankoElements();
        
        // Get the hanko-auth element
        hankoInstance = document.querySelector('hanko-auth');
        
        if (!hankoInstance) {
            console.error('❌ Hanko auth element not found');
            showNotification('❌ Authentication system not available', 'error');
            // Still setup button listeners for fallback
            setupButtonListeners();
            return;
        }
        
        console.log('✅ Hanko auth element found');
        
        // Set up event listeners
        setupHankoEventListeners();
        
        // Setup UI button listeners
        setupButtonListeners();
        
        // Check initial auth state
        await checkAuthState();
        
        console.log('🎉 Hanko initialization complete');
        
    } catch (error) {
        console.error('❌ Error initializing Hanko:', error);
        showNotification('⚠️ Authentication system in demo mode', 'warning');
        
        // Setup button listeners anyway for fallback functionality
        setupButtonListeners();
    }
}

async function waitForHankoElements() {
    console.log('⏳ Waiting for Hanko elements to load...');
    
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!customElements.get('hanko-auth') && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!customElements.get('hanko-auth')) {
        throw new Error('Hanko elements failed to load');
    }
    
    console.log('✅ Hanko elements loaded successfully');
}

function setupHankoEventListeners() {
    console.log('🔗 Setting up Hanko event listeners...');
    
    // Updated event names based on Hanko documentation
    // Listen for successful login
    document.addEventListener('hanko-session-created', (event) => {
        console.log('🎉 Hanko session created:', event.detail);
        handleAuthSuccess(event.detail);
    });
    
    // Listen for logout
    document.addEventListener('hanko-session-expired', (event) => {
        console.log('👋 Hanko session expired');
        handleLogout();
    });
    
    // Listen for user loaded
    document.addEventListener('hanko-user-logged-in', (event) => {
        console.log('👤 Hanko user logged in:', event.detail);
        handleAuthSuccess(event.detail);
    });
    
    // Listen for user logged out
    document.addEventListener('hanko-user-logged-out', (event) => {
        console.log('👋 Hanko user logged out');
        handleLogout();
    });
    
    // Listen for auth errors
    document.addEventListener('hanko-auth-error', (event) => {
        console.error('❌ Hanko auth error:', event.detail);
        handleAuthError(event.detail);
    });
    
    console.log('✅ Hanko event listeners set up');
}

function setupButtonListeners() {
    console.log('🔗 Setting up button listeners...');
    
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const profileBtn = document.getElementById('profileBtn');
    const loginPromptSignIn = document.getElementById('loginPromptSignIn');
    const loginPromptSignUp = document.getElementById('loginPromptSignUp');
    const hankoModal = document.getElementById('hankoModal');
    const hankoClose = document.querySelector('.hanko-close');
    
    // Sign in button
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            console.log('🚀 Sign in button clicked');
            openHankoModal();
        });
    }
    
    // Sign out button
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            console.log('👋 Sign out button clicked');
            await signOut();
        });
    }
    
    // Profile button
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            console.log('👤 Profile button clicked');
            openProfileModal();
        });
    }
    
    // Login prompt buttons
    if (loginPromptSignIn) {
        loginPromptSignIn.addEventListener('click', () => {
            console.log('🚀 Login prompt sign in clicked');
            openHankoModal();
        });
    }
    
    if (loginPromptSignUp) {
        loginPromptSignUp.addEventListener('click', () => {
            console.log('🚀 Login prompt sign up clicked');
            openHankoModal();
        });
    }
    
    // Modal close
    if (hankoClose) {
        hankoClose.addEventListener('click', () => {
            closeHankoModal();
        });
    }
    
    // Close modal when clicking outside
    if (hankoModal) {
        hankoModal.addEventListener('click', (e) => {
            if (e.target === hankoModal) {
                closeHankoModal();
            }
        });
    }
    
    console.log('✅ Button listeners set up');
}

function openHankoModal() {
    const hankoModal = document.getElementById('hankoModal');
    if (hankoModal) {
        hankoModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeHankoModal() {
    const hankoModal = document.getElementById('hankoModal');
    if (hankoModal) {
        hankoModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

function openProfileModal() {
    // Create profile modal if it doesn't exist
    let profileModal = document.getElementById('hankoProfileModal');
    
    if (!profileModal) {
        profileModal = document.createElement('div');
        profileModal.id = 'hankoProfileModal';
        profileModal.className = 'hanko-modal';
        profileModal.innerHTML = `
            <div class="hanko-modal-content">
                <span class="hanko-close">&times;</span>
                <div class="hanko-profile-container">
                    <hanko-profile api="${HANKO_API_URL}"></hanko-profile>
                </div>
            </div>
        `;
        document.body.appendChild(profileModal);
        
        // Add close event listener
        const closeBtn = profileModal.querySelector('.hanko-close');
        closeBtn.addEventListener('click', () => {
            profileModal.style.display = 'none';
            document.body.style.overflow = '';
        });
        
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
    
    profileModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

async function handleAuthSuccess(detail) {
    console.log('🎯 Handling auth success...');
    
    try {
        // Close the modal
        closeHankoModal();
        
        // Get user information
        await getCurrentUser();
        
        // Update UI
        updateUI(true);
        
        // Show success message
        showNotification('✅ Sesión iniciada correctamente', 'success');
        
    } catch (error) {
        console.error('❌ Error handling auth success:', error);
    }
}

async function getCurrentUser() {
    try {
        // Use Hanko client to get current user
        const response = await fetch(`${HANKO_API_URL}/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            console.log('👤 Current user:', currentUser);
            return currentUser;
        } else if (response.status === 401) {
            console.log('🔓 User not authenticated');
            currentUser = null;
            return null;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Error getting current user:', error);
        // Show fallback message for demo purposes
        if (error.message.includes('CORS') || error.message.includes('fetch')) {
            console.warn('⚠️ Using demo mode - CORS or network error detected');
            showNotification('⚠️ Running in demo mode. Set up your own Hanko Cloud project for full functionality.', 'warning');
        }
        currentUser = null;
        return null;
    }
}

function handleLogout() {
    console.log('🔓 Handling logout...');
    
    currentUser = null;
    updateUI(false);
    showNotification('👋 Sesión cerrada correctamente', 'info');
}

function handleAuthError(error) {
    console.error('❌ Auth error:', error);
    showNotification('❌ Error de autenticación. Inténtalo de nuevo.', 'error');
}

async function signOut() {
    try {
        console.log('👋 Signing out...');
        
        // Call Hanko logout endpoint
        const response = await fetch(`${HANKO_API_URL}/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            handleLogout();
        } else {
            throw new Error('Logout failed');
        }
        
    } catch (error) {
        console.error('❌ Error signing out:', error);
        showNotification('❌ Error al cerrar sesión', 'error');
    }
}

async function checkAuthState() {
    console.log('🔍 Checking auth state...');
    
    try {
        const user = await getCurrentUser();
        updateUI(!!user);
    } catch (error) {
        console.error('❌ Error checking auth state:', error);
        updateUI(false);
    }
}

function updateUI(isAuthenticated) {
    console.log('🎨 Updating UI, authenticated:', isAuthenticated);
    
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const profileBtn = document.getElementById('profileBtn');
    const userInfo = document.getElementById('userInfo');
    const loginPrompt = document.getElementById('loginPrompt');
    const protectedContent = document.querySelectorAll('.protected-content');
    
    if (isAuthenticated && currentUser) {
        // User is signed in
        if (signInBtn) signInBtn.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'inline-block';
        if (profileBtn) profileBtn.style.display = 'inline-block';
        
        // Update user info display
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-profile">
                    <div class="profile-avatar">👤</div>
                    <span class="user-name">${currentUser.email || currentUser.id || 'Usuario'}</span>
                </div>
            `;
            userInfo.style.display = 'flex';
        }
        
        // Show protected content
        if (loginPrompt) loginPrompt.style.display = 'none';
        protectedContent.forEach(el => el.style.display = 'block');
        
    } else {
        // User is not signed in
        if (signInBtn) signInBtn.style.display = 'inline-block';
        if (signOutBtn) signOutBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        
        // Hide protected content
        if (loginPrompt) loginPrompt.style.display = 'block';
        protectedContent.forEach(el => el.style.display = 'none');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `hanko-notification hanko-notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '5px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '10000',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHanko);
} else {
    initHanko();
}

// Global debug object
window.hankoAuth = {
    instance: () => hankoInstance,
    user: () => currentUser,
    signOut: signOut,
    checkAuth: checkAuthState,
    openModal: openHankoModal,
    closeModal: closeHankoModal,
    debug: () => {
        console.log('🔧 Hanko Debug Info:', {
            instance: !!hankoInstance,
            currentUser: currentUser,
            apiUrl: HANKO_API_URL,
            authenticated: !!currentUser
        });
    }
};

console.log('✅ Hanko auth system ready');