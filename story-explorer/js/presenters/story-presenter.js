// Story Presenter - Handles story display and management logic
class StoryPresenter {
    static async loadStories() {
        const container = document.getElementById('stories-container');
        
        try {
            container.innerHTML = '<div class="loading">Loading stories...</div>';
            const stories = await StoryModel.getStories();
            window.AppState.stories = stories;
            this.renderStories(stories);
            
            // Update map with stories
            if (window.MapPresenter) {
                MapPresenter.updateStoriesMap(stories);
            }
        } catch (error) {
            container.innerHTML = `<div class="error">Failed to load stories: ${error.message}</div>`;
        }
    }

    static renderStories(stories) {
        const container = document.getElementById('stories-container');
        
        if (!stories || stories.length === 0) {
            container.innerHTML = '<div class="loading">No stories available yet. Be the first to share your story!</div>';
            return;
        }

        const storiesHTML = stories.map(story => {
            const createdDate = new Date(story.createdAt);
            const formattedDate = createdDate.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Truncate description if too long
            const truncatedDescription = story.description.length > 150 
                ? story.description.substring(0, 150) + '...'
                : story.description;

            return `
                <article class="story-card">
                    <img src="${story.photoUrl}" 
                         alt="Photo of ${this.escapeHtml(story.name)}" 
                         class="story-image" 
                         loading="lazy"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDM1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzUgNzVMMTk1IDk1SDE1NUwxNzUgNzVaIiBmaWxsPSIjQ0NDIi8+CjxjaXJjbGUgY3g9IjE0NSIgY3k9IjY1IiByPSI1IiBmaWxsPSIjQ0NDIi8+CjwvZ3N2Zz4K'">
                    <div class="story-content">
                        <h3 class="story-title">${this.escapeHtml(story.name)}</h3>
                        <p class="story-description">${this.escapeHtml(truncatedDescription)}</p>
                        <div class="story-meta">
                            <span>📅 ${formattedDate}</span>
                            ${story.lat && story.lon ? '<span>📍 Located</span>' : '<span>📍 No location</span>'}
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        container.innerHTML = `
            <div class="stories-grid" role="feed" aria-label="Stories feed">
                ${storiesHTML}
            </div>
        `;
    }

    static async addStory(storyData) {
        try {
            // Sanitize input data
            const sanitizedData = {
                name: FormValidator.sanitizeInput(storyData.name),
                description: FormValidator.sanitizeInput(storyData.description),
                photo: storyData.photo,
                lat: parseFloat(storyData.lat),
                lon: parseFloat(storyData.lon)
            };

            await StoryModel.addStory(sanitizedData);
            this.showMessage('Story shared successfully! 🎉', 'success');
            
            // Reset form and cleanup
            document.getElementById('story-form').reset();
            FormValidator.clearErrors();
            
            if (window.CameraPresenter) {
                CameraPresenter.cleanup();
            }
            
            // Navigate back to home after delay
            setTimeout(() => {
                if (window.router) {
                    router.navigateTo('home');
                }
            }, 2000);
            
        } catch (error) {
            this.showMessage(`Failed to share story: ${error.message}`, 'error');
        }
    }

    static showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success, .error');
        existingMessages.forEach(msg => {
            if (!msg.id.includes('-error')) {
                msg.remove();
            }
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        const form = document.getElementById('story-form');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(messageDiv, form);
        }

        // Auto-remove success messages
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }

    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    static async refreshStories() {
        await this.loadStories();
    }
}