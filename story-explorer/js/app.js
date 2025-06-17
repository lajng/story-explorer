// Main Application Controller
class App {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        // Initialize global app state
        window.AppState = {
            stories: [],
            currentLocation: null,
            capturedPhoto: null,
            cameraStream: null
        };

        // Initialize router
        window.router = new Router();

        // Initialize event listeners
        this.setupEventListeners();
        
        // Initialize navigation
        this.initializeNavigation();

        console.log('Story Explorer App initialized successfully');
    }

    setupEventListeners() {
        // Form submission
        const storyForm = document.getElementById('story-form');
        if (storyForm) {
            storyForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Camera controls
        const startCameraBtn = document.getElementById('start-camera');
        const capturePhotoBtn = document.getElementById('capture-photo');
        const retakePhotoBtn = document.getElementById('retake-photo');

        if (startCameraBtn) {
            startCameraBtn.addEventListener('click', () => {
                if (window.CameraPresenter) {
                    CameraPresenter.startCamera();
                }
            });
        }

        if (capturePhotoBtn) {
            capturePhotoBtn.addEventListener('click', () => {
                if (window.CameraPresenter) {
                    CameraPresenter.capturePhoto();
                }
            });
        }

        if (retakePhotoBtn) {
            retakePhotoBtn.addEventListener('click', () => {
                if (window.CameraPresenter) {
                    CameraPresenter.retakePhoto();
                }
            });
        }

        // Navigation event delegation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const route = href.substring(1);
                    window.router.navigateTo(route);
                }
            }
        });

        // Form input validation on blur
        const nameInput = document.getElementById('story-name');
        const descInput = document.getElementById('story-description');

        if (nameInput) {
            nameInput.addEventListener('blur', () => this.validateField('name'));
            nameInput.addEventListener('input', () => this.clearFieldError('name'));
        }

        if (descInput) {
            descInput.addEventListener('blur', () => this.validateField('description'));
            descInput.addEventListener('input', () => this.clearFieldError('description'));
        }

        // Handle page visibility change to cleanup camera
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && window.CameraPresenter) {
                CameraPresenter.cleanup();
            }
        });

        // Handle beforeunload to cleanup resources
        window.addEventListener('beforeunload', () => {
            if (window.CameraPresenter) {
                CameraPresenter.cleanup();
            }
        });
    }

    initializeNavigation() {
        // Set up navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) {
                    window.location.hash = href;
                }
            });
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sharing Story...';

            const formData = new FormData(e.target);
            
            // Validate form
            const errors = FormValidator.validateForm(formData);
            
            if (!FormValidator.displayErrors(errors)) {
                return; // Stop if validation fails
            }

            // Prepare story data
            const storyData = {
                name: formData.get('name').trim(),
                description: formData.get('description').trim(),
                photo: window.AppState.capturedPhoto,
                lat: window.AppState.currentLocation.lat,
                lon: window.AppState.currentLocation.lng
            };

            // Submit story
            await StoryPresenter.addStory(storyData);
            
        } catch (error) {
            console.error('Error submitting story:', error);
            StoryPresenter.showMessage('An unexpected error occurred. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    validateField(fieldName) {
        const formData = new FormData(document.getElementById('story-form'));
        const errors = FormValidator.validateForm(formData);
        
        if (errors[fieldName]) {
            const errorElement = document.getElementById(`${fieldName}-error`);
            const inputElement = document.getElementById(`story-${fieldName}`);
            
            if (errorElement) {
                errorElement.textContent = errors[fieldName];
                errorElement.style.display = 'block';
            }
            
            if (inputElement) {
                inputElement.style.borderColor = '#ff6b6b';
            }
        }
    }

    clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(`story-${fieldName}`);
        
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
        
        if (inputElement) {
            inputElement.style.borderColor = '#e1e5e9';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// Handle any uncaught errors gracefully
window.addEventListener('error', (e) => {
    console.error('Uncaught error:', e.error);
    
    // Show user-friendly error message
    const existingErrors = document.querySelectorAll('.global-error');
    existingErrors.forEach(err => err.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error global-error';
    errorDiv.textContent = 'Something went wrong. Please refresh the page and try again.';
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.zIndex = '9999';
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
});