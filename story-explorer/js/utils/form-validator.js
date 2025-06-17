// Form Validator - Handles form validation logic
class FormValidator {
    static validateForm(formData) {
        const errors = {};

        // Validate story name/title
        const name = formData.get('name');
        if (!name || name.trim().length < 3) {
            errors.name = 'Story title must be at least 3 characters long';
        } else if (name.trim().length > 100) {
            errors.name = 'Story title must not exceed 100 characters';
        }

        // Validate description
        const description = formData.get('description');
        if (!description || description.trim().length < 10) {
            errors.description = 'Story description must be at least 10 characters long';
        } else if (description.trim().length > 1000) {
            errors.description = 'Story description must not exceed 1000 characters';
        }

        // Validate photo
        if (!window.AppState.capturedPhoto) {
            errors.photo = 'Please capture a photo for your story';
        } else {
            // Check file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (window.AppState.capturedPhoto.size > maxSize) {
                errors.photo = 'Photo size must not exceed 5MB';
            }
        }

        // Validate location
        if (!window.AppState.currentLocation) {
            errors.location = 'Please select a location on the map';
        } else {
            const { lat, lng } = window.AppState.currentLocation;
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                errors.location = 'Invalid location coordinates';
            }
        }

        return errors;
    }

    static displayErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.error').forEach(el => {
            if (el.id.includes('-error')) {
                el.style.display = 'none';
                el.textContent = '';
            }
        });

        // Remove error styling from inputs
        document.querySelectorAll('input, textarea').forEach(input => {
            input.style.borderColor = '#e1e5e9';
        });

        // Show new errors
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            const inputElement = document.getElementById(`story-${field}`) || 
                                  document.querySelector(`[name="${field}"]`);
            
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.style.display = 'block';
            }

            if (inputElement) {
                inputElement.style.borderColor = '#ff6b6b';
            }

            // Special handling for photo and location errors
            if (field === 'photo') {
                this.showPhotoError(errors[field]);
            } else if (field === 'location') {
                this.showLocationError(errors[field]);
            }
        });

        return Object.keys(errors).length === 0;
    }

    static showPhotoError(message) {
        const cameraContainer = document.querySelector('.camera-container');
        let errorDiv = cameraContainer.querySelector('.photo-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error photo-error';
            cameraContainer.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    static showLocationError(message) {
        const locationInfo = document.getElementById('location-info');
        locationInfo.innerHTML = `<span style="color: #ff6b6b;">${message}</span>`;
    }

    static clearErrors() {
        document.querySelectorAll('.error').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });

        document.querySelectorAll('input, textarea').forEach(input => {
            input.style.borderColor = '#e1e5e9';
        });
    }

    static sanitizeInput(input) {
        return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
}