// Camera Presenter - Handles camera functionality
class CameraPresenter {
    static async startCamera() {
        try {
            const video = document.getElementById('camera-preview');
            const startBtn = document.getElementById('start-camera');
            const captureBtn = document.getElementById('capture-photo');
            
            // Clear any existing photo errors
            const photoError = document.querySelector('.photo-error');
            if (photoError) {
                photoError.remove();
            }

            // Request camera permissions
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment' // Use back camera if available
                }
            });

            // Store stream reference for cleanup
            window.AppState.cameraStream = stream;
            
            // Set up video element
            video.srcObject = stream;
            video.style.display = 'block';
            
            // Update button states
            startBtn.style.display = 'none';
            captureBtn.style.display = 'inline-block';
            
            console.log('Camera started successfully');
            
        } catch (error) {
            console.error('Error starting camera:', error);
            this.handleCameraError(error);
        }
    }

    static capturePhoto() {
        try {
            const video = document.getElementById('camera-preview');
            const capturedImage = document.getElementById('captured-image');
            const captureBtn = document.getElementById('capture-photo');
            const retakeBtn = document.getElementById('retake-photo');
            
            if (!video.srcObject) {
                throw new Error('Camera not active');
            }

            // Create canvas to capture frame
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    // Store captured photo
                    window.AppState.capturedPhoto = blob;
                    
                    // Display captured image
                    const imageUrl = URL.createObjectURL(blob);
                    capturedImage.src = imageUrl;
                    capturedImage.style.display = 'block';
                    
                    // Update UI
                    video.style.display = 'none';
                    captureBtn.style.display = 'none';
                    retakeBtn.style.display = 'inline-block';
                    
                    // Stop camera stream
                    this.stopCamera();
                    
                    console.log('Photo captured successfully');
                } else {
                    throw new Error('Failed to capture photo');
                }
            }, 'image/jpeg', 0.8);
            
        } catch (error) {
            console.error('Error capturing photo:', error);
            this.showPhotoError('Failed to capture photo. Please try again.');
        }
    }

    static retakePhoto() {
        try {
            const video = document.getElementById('camera-preview');
            const capturedImage = document.getElementById('captured-image');
            const startBtn = document.getElementById('start-camera');
            const retakeBtn = document.getElementById('retake-photo');
            
            // Clear captured photo
            window.AppState.capturedPhoto = null;
            
            // Clean up image URL
            if (capturedImage.src) {
                URL.revokeObjectURL(capturedImage.src);
            }
            
            // Reset UI
            capturedImage.style.display = 'none';
            capturedImage.src = '';
            video.style.display = 'none';
            retakeBtn.style.display = 'none';
            startBtn.style.display = 'inline-block';
            
            // Clear any photo errors
            const photoError = document.querySelector('.photo-error');
            if (photoError) {
                photoError.remove();
            }
            
            console.log('Photo cleared, ready to retake');
            
        } catch (error) {
            console.error('Error during retake:', error);
        }
    }

    static stopCamera() {
        try {
            if (window.AppState.cameraStream) {
                const tracks = window.AppState.cameraStream.getTracks();
                tracks.forEach(track => {
                    track.stop();
                    console.log('Camera track stopped:', track.kind);
                });
                window.AppState.cameraStream = null;
            }
        } catch (error) {
            console.error('Error stopping camera:', error);
        }
    }

    static cleanup() {
        try {
            // Stop camera stream
            this.stopCamera();
            
            // Clean up UI elements
            const video = document.getElementById('camera-preview');
            const capturedImage = document.getElementById('captured-image');
            const startBtn = document.getElementById('start-camera');
            const captureBtn = document.getElementById('capture-photo');
            const retakeBtn = document.getElementById('retake-photo');
            
            if (video) {
                video.srcObject = null;
                video.style.display = 'none';
            }
            
            if (capturedImage && capturedImage.src) {
                URL.revokeObjectURL(capturedImage.src);
                capturedImage.src = '';
                capturedImage.style.display = 'none';
            }
            
            if (startBtn) startBtn.style.display = 'inline-block';
            if (captureBtn) captureBtn.style.display = 'none';
            if (retakeBtn) retakeBtn.style.display = 'none';
            
            // Clear captured photo
            window.AppState.capturedPhoto = null;
            
            console.log('Camera presenter cleaned up');
            
        } catch (error) {
            console.error('Error during camera cleanup:', error);
        }
    }

    static handleCameraError(error) {
        let errorMessage = 'Unable to access camera. ';
        
        switch (error.name) {
            case 'NotAllowedError':
                errorMessage += 'Please allow camera access and try again.';
                break;
            case 'NotFoundError':
                errorMessage += 'No camera found on this device.';
                break;
            case 'NotSupportedError':
                errorMessage += 'Camera not supported on this device.';
                break;
            case 'NotReadableError':
                errorMessage += 'Camera is being used by another application.';
                break;
            case 'OverconstrainedError':
                errorMessage += 'Camera settings not supported.';
                break;
            case 'SecurityError':
                errorMessage += 'Camera access blocked by security policy.';
                break;
            default:
                errorMessage += 'Please check your camera settings and try again.';
        }
        
        this.showPhotoError(errorMessage);
    }

    static showPhotoError(message) {
        const cameraContainer = document.querySelector('.camera-container');
        
        // Remove existing error
        const existingError = cameraContainer.querySelector('.photo-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create new error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error photo-error';
        errorDiv.textContent = message;
        errorDiv.style.marginTop = '1rem';
        
        cameraContainer.appendChild(errorDiv);
    }

    static checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showPhotoError('Camera not supported on this browser. Please use a modern browser.');
            return false;
        }
        return true;
    }
}

// Initialize camera support check when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    CameraPresenter.checkCameraSupport();
});