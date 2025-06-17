// Story Model - Handles API interactions
class StoryModel {
    static API_BASE_URL = 'https://story-api.dicoding.dev/v1';

    static async getStories() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/stories`);
            const data = await response.json();
            
            if (!data.error) {
                return data.listStory || [];
            }
            throw new Error(data.message || 'Failed to fetch stories');
        } catch (error) {
            console.error('Error fetching stories:', error);
            throw error;
        }
    }

    static async addStory(storyData) {
        try {
            const formData = new FormData();
            formData.append('name', storyData.name);
            formData.append('description', storyData.description);
            formData.append('photo', storyData.photo);
            formData.append('lat', storyData.lat);
            formData.append('lon', storyData.lon);

            const response = await fetch(`${this.API_BASE_URL}/stories`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!data.error) {
                return data;
            }
            throw new Error(data.message || 'Failed to add story');
        } catch (error) {
            console.error('Error adding story:', error);
            throw error;
        }
    }

    static async getStoryDetail(id) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/stories/${id}`);
            const data = await response.json();
            
            if (!data.error) {
                return data.story;
            }
            throw new Error(data.message || 'Failed to fetch story detail');
        } catch (error) {
            console.error('Error fetching story detail:', error);
            throw error;
        }
    }
}