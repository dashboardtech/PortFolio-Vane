// Working Clerk Authentication
console.log('🔥 CLERK AUTH LOADING...');

let clerkInstance = null;

async function initClerk() {
    console.log('🔍 Checking if Clerk v5 is available...');
    if (!window.Clerk) {
        console.log('⏳ Clerk not available, retrying in 200ms...');
        setTimeout(initClerk, 200);
        return;
    }

    console.log('✅ Clerk v5 found! Initializing...');
    try {
        // Get publishable key from environment or use fallback
        const publishableKey = window.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dmVyaWZpZWQtZG9nZmlzaC02Ni5jbGVyay5hY2NvdW50cy5kZXYk';
        console.log('🔑 Using publishable key:', publishableKey.substring(0, 20) + '...');
        console.log('🌐 Current URL:', window.location.href);
        
        // Try different Clerk v5 initialization approaches
        if (typeof window.Clerk === 'function') {
            // Constructor approach (might be v4 style)
            console.log('🔧 Using constructor approach');
            clerkInstance = new window.Clerk(publishableKey);
            await clerkInstance.load({
                appearance: {
                    baseTheme: 'modern'
                }
            });
        } else if (window.Clerk && typeof window.Clerk === 'object') {
            // Object approach (v5 style)
            console.log('🔧 Using object approach');
            clerkInstance = window.Clerk;
            await clerkInstance.load();
        } else {
            throw new Error('Unknown Clerk structure: ' + typeof window.Clerk);
        }
        
        console.log('🎯 Clerk v5 instance loaded successfully');
        console.log('🔍 Available methods:', Object.getOwnPropertyNames(clerkInstance).filter(name => typeof clerkInstance[name] === 'function'));
        
        setupButtonListeners();
        
    } catch (error) {
        console.error('❌ Error initializing Clerk v5:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Fallback to v4 API if v5 fails
        console.log('🔄 Trying fallback to v4 API...');
        try {
            clerkInstance = new window.Clerk(publishableKey);
            await clerkInstance.load({
                appearance: {
                    baseTheme: 'modern'
                }
            });
            console.log('🎉 Fallback to v4 API successful!');
            setupButtonListeners();
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
        }
    }
}

function setupButtonListeners() {
    console.log('🔗 Setting up button listeners...');
    
    // Increased timeout and multiple attempts for robustness
    let attempts = 0;
    const maxAttempts = 10;
    
    function trySetupButtons() {
        attempts++;
        console.log(`🔄 Attempt ${attempts}/${maxAttempts} to find buttons...`);
        
        const signInBtn = document.getElementById('signInBtn');
        const signOutBtn = document.getElementById('signOutBtn');
        const loginPromptSignIn = document.getElementById('loginPromptSignIn');
        const loginPromptSignUp = document.getElementById('loginPromptSignUp');
        
        console.log('🔍 Found elements:', { 
            signInBtn: !!signInBtn, 
            signOutBtn: !!signOutBtn,
            loginPromptSignIn: !!loginPromptSignIn,
            loginPromptSignUp: !!loginPromptSignUp,
            clerkInstance: !!clerkInstance,
            windowClerk: !!window.Clerk
        });
        
        if (signInBtn && clerkInstance) {
            // Clear any existing handlers
            signInBtn.onclick = null;
            signInBtn.removeAttribute('onclick');
            
            // Remove any existing listeners
            const newBtn = signInBtn.cloneNode(true);
            signInBtn.parentNode.replaceChild(newBtn, signInBtn);
            
            // Add our handler to the new button
            newBtn.addEventListener('click', function(e) {
                console.log('🚀 Sign-in button clicked!');
                e.preventDefault();
                e.stopPropagation();
                
                if (clerkInstance) {
                    console.log('🎯 Opening Clerk sign-in modal...');
                    console.log('🔍 Clerk instance status:', {
                        loaded: !!clerkInstance.loaded,
                        user: !!clerkInstance.user,
                        session: !!clerkInstance.session
                    });
                    try {
                        // Try using the newer openSignIn method
                        if (typeof clerkInstance.openSignIn === 'function') {
                            clerkInstance.openSignIn();
                        } else if (typeof clerkInstance.redirectToSignIn === 'function') {
                            // Fallback to redirect method
                            console.log('🔄 Using redirectToSignIn fallback');
                            clerkInstance.redirectToSignIn();
                        } else {
                            throw new Error('No sign-in method available on Clerk instance');
                        }
                    } catch (error) {
                        console.error('❌ Error opening sign-in modal:', error);
                        console.error('❌ Available Clerk methods:', Object.getOwnPropertyNames(clerkInstance));
                        alert('Error opening sign-in: ' + error.message + '. Check console for details.');
                    }
                } else {
                    console.error('❌ Clerk instance not available');
                    alert('Authentication not ready yet. Please wait and try again.');
                }
                
                return false;
            });
            
            console.log('✅ Sign-in listener added successfully');
            
            // Test button click
            console.log('🧪 Testing button click detection...');
            newBtn.style.border = '2px solid green';
            setTimeout(() => {
                newBtn.style.border = '';
            }, 1000);
            
        } else {
            if (attempts < maxAttempts) {
                console.log(`⏳ Buttons or Clerk not ready, retrying in ${attempts * 200}ms...`);
                setTimeout(trySetupButtons, attempts * 200);
                return;
            } else {
                console.error('❌ Failed to setup buttons after all attempts');
                console.log('Debug info:', {
                    signInBtn: !!signInBtn,
                    clerkInstance: !!clerkInstance,
                    windowClerk: !!window.Clerk
                });
            }
        }
        
        if (signOutBtn) {
            signOutBtn.addEventListener('click', function(e) {
                console.log('👋 Sign-out button clicked!');
                e.preventDefault();
                e.stopPropagation();
                
                if (clerkInstance) {
                    clerkInstance.signOut();
                }
                
                return false;
            });
            
            console.log('✅ Sign-out listener added');
        }

        // Setup login prompt buttons
        if (loginPromptSignIn) {
            loginPromptSignIn.onclick = null;
            const newLoginBtn = loginPromptSignIn.cloneNode(true);
            loginPromptSignIn.parentNode.replaceChild(newLoginBtn, loginPromptSignIn);
            
            newLoginBtn.addEventListener('click', function(e) {
                console.log('🚀 Login prompt sign-in clicked!');
                e.preventDefault();
                e.stopPropagation();
                
                if (clerkInstance && clerkInstance.openSignIn) {
                    clerkInstance.openSignIn();
                }
                return false;
            });
        }

        if (loginPromptSignUp) {
            loginPromptSignUp.onclick = null;
            const newSignUpBtn = loginPromptSignUp.cloneNode(true);
            loginPromptSignUp.parentNode.replaceChild(newSignUpBtn, loginPromptSignUp);
            
            newSignUpBtn.addEventListener('click', function(e) {
                console.log('🚀 Login prompt sign-up clicked!');
                e.preventDefault();
                e.stopPropagation();
                
                if (clerkInstance && clerkInstance.openSignUp) {
                    clerkInstance.openSignUp();
                } else if (clerkInstance && clerkInstance.openSignIn) {
                    clerkInstance.openSignIn();
                }
                return false;
            });
        }
        
        updateUI();
    }
    
    // Start the setup attempts
    trySetupButtons();
}

function updateUI() {
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const userInfo = document.getElementById('userInfo');
    const loginPrompt = document.getElementById('loginPrompt');
    const protectedContent = document.querySelectorAll('.protected-content');
    
    if (clerkInstance && clerkInstance.user) {
        // User is signed in
        console.log('👤 User is signed in:', clerkInstance.user.firstName);
        
        if (signInBtn) signInBtn.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'inline-block';
        
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-profile">
                    <img src="${clerkInstance.user.imageUrl || clerkInstance.user.profileImageUrl}" alt="Profile" class="profile-image">
                    <span class="user-name">${clerkInstance.user.firstName || 'Usuario'}</span>
                </div>
            `;
            userInfo.style.display = 'flex';
        }
        
        // Show protected content
        if (loginPrompt) loginPrompt.style.display = 'none';
        protectedContent.forEach(el => el.style.display = 'block');
        
    } else {
        // User is not signed in
        console.log('🔐 User not signed in');
        
        if (signInBtn) signInBtn.style.display = 'inline-block';
        if (signOutBtn) signOutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        
        // Hide protected content
        if (loginPrompt) loginPrompt.style.display = 'block';
        protectedContent.forEach(el => el.style.display = 'none');
    }
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClerk);
} else {
    initClerk();
}

// Make available globally for debugging
window.authDebug = {
    clerk: () => clerkInstance,
    signIn: () => {
        console.log('🔥 Manual sign-in triggered');
        if (clerkInstance) {
            clerkInstance.openSignIn();
        } else {
            console.error('❌ Clerk not ready');
        }
    },
    debug: () => {
        console.log('🔧 Clerk Debug Info:', {
            windowClerk: !!window.Clerk,
            clerkInstance: !!clerkInstance,
            instanceMethods: clerkInstance ? Object.getOwnPropertyNames(clerkInstance) : null,
            user: clerkInstance ? clerkInstance.user : null,
            loaded: clerkInstance ? clerkInstance.loaded : null,
            publishableKey: window.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? window.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 20) + '...' : 'Not set',
            currentUrl: window.location.href
        });
    },
    testModal: () => {
        console.log('🧪 Testing Clerk modal...');
        if (clerkInstance && clerkInstance.openSignIn) {
            try {
                clerkInstance.openSignIn({
                    redirectUrl: window.location.href,
                    afterSignInUrl: window.location.href
                });
            } catch (error) {
                console.error('❌ Modal test failed:', error);
            }
        }
    }
};

console.log('✅ Auth system ready');