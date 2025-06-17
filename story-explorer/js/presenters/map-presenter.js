// Map Presenter - Handles map functionality using Leaflet
class MapPresenter {
    static storiesMap = null;
    static locationMap = null;
    static selectedMarker = null;

    static initStoriesMap() {
        try {
            const mapContainer = document.getElementById('stories-map');
            if (!mapContainer) return;

            // Remove existing map if any
            if (this.storiesMap) {
                this.storiesMap.remove();
                this.storiesMap = null;
            }

            // Initialize stories map
            this.storiesMap = L.map('stories-map').setView([-6.2088, 106.8456], 10); // Jakarta center

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.storiesMap);

            console.log('Stories map initialized');
            
        } catch (error) {
            console.error('Error initializing stories map:', error);
            this.showMapError('stories-map', 'Failed to load stories map');
        }
    }

    static initLocationMap() {
        try {
            const mapContainer = document.getElementById('location-map');
            if (!mapContainer) return;

            // Remove existing map if any
            if (this.locationMap) {
                this.locationMap.remove();
                this.locationMap = null;
            }

            // Initialize location selection map
            this.locationMap = L.map('location-map').setView([-6.2088, 106.8456], 13);

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.locationMap);

            // Add click event for location selection
            this.locationMap.on('click', (e) => {
                this.selectLocation(e.latlng);
            });

            // Try to get user's current location
            this.getCurrentLocation();

            console.log('Location map initialized');
            
        } catch (error) {
            console.error('Error initializing location map:', error);
            this.showMapError('location-map', 'Failed to load location map');
        }
    }

    static getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Center map on user location
                    if (this.locationMap) {
                        this.locationMap.setView([lat, lng], 15);
                        
                        // Add a marker to show current location
                        const currentLocationMarker = L.marker([lat, lng], {
                            icon: L.divIcon({
                                className: 'current-location-marker',
                                html: '📍',
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            })
                        }).addTo(this.locationMap);
                        
                        currentLocationMarker.bindPopup('Your current location (click anywhere to select story location)');
                    }
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    this.updateLocationInfo('Unable to get your location. Please click on the map to select a location.');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        } else {
            this.updateLocationInfo('Geolocation not supported. Please click on the map to select a location.');
        }
    }

    static selectLocation(latlng) {
        try {
            // Remove previous marker
            if (this.selectedMarker) {
                this.locationMap.removeLayer(this.selectedMarker);
            }

            // Add new marker
            this.selectedMarker = L.marker([latlng.lat, latlng.lng], {
                icon: L.divIcon({
                    className: 'selected-location-marker',
                    html: '📌',
                    iconSize: [25, 25],
                    iconAnchor: [12, 12]
                })
            }).addTo(this.locationMap);

            this.selectedMarker.bindPopup('Selected story location').openPopup();

            // Store location in app state
            window.AppState.currentLocation = {
                lat: latlng.lat,
                lng: latlng.lng
            };

            // Update location info
            this.updateLocationInfo(`Selected: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);

            // Clear location error if any
            const locationError = document.querySelector('.location-error');
            if (locationError) {
                locationError.remove();
            }

            console.log('Location selected:', latlng);
            
        } catch (error) {
            console.error('Error selecting location:', error);
        }
    }

    static updateStoriesMap(stories) {
        try {
            if (!this.storiesMap || !stories) return;

            // Clear existing markers
            this.storiesMap.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    this.storiesMap.removeLayer(layer);
                }
            });

            // Add markers for stories with location
            const markersGroup = new L.FeatureGroup();
            
            stories.forEach((story, index) => {
                if (story.lat && story.lon) {
                    const marker = L.marker([story.lat, story.lon], {
                        icon: L.divIcon({
                            className: 'story-marker',
                            html: '📖',
                            iconSize: [25, 25],
                            iconAnchor: [12, 12]
                        })
                    });

                    // Create popup content
                    const popupContent = `
                        <div class="story-popup">
                            <h4>${this.escapeHtml(story.name)}</h4>
                            <img src="${story.photoUrl}" 
                                 alt="${this.escapeHtml(story.name)}" 
                                 style="width: 150px; height: 100px; object-fit: cover; border-radius: 5px; margin: 5px 0;"
                                 onerror="this.style.display='none'">
                            <p>${this.escapeHtml(story.description.substring(0, 100))}${story.description.length > 100 ? '...' : ''}</p>
                            <small>📅 ${new Date(story.createdAt).toLocaleDateString('id-ID')}</small>
                        </div>
                    `;

                    marker.bindPopup(popupContent, {
                        maxWidth: 200,
                        className: 'story-popup-container'
                    });

                    markersGroup.addLayer(marker);
                }
            });

            // Add all markers to map
            markersGroup.addTo(this.storiesMap);

            // Fit map to show all markers if any exist
            if (markersGroup.getLayers().length > 0) {
                this.storiesMap.fitBounds(markersGroup.getBounds(), {
                    padding: [20, 20],
                    maxZoom: 15
                });
            }

            console.log(`Added ${markersGroup.getLayers().length} story markers to map`);
            
        } catch (error) {
            console.error('Error updating stories map:', error);
        }
    }

    static updateLocationInfo(message) {
        const locationInfo = document.getElementById('location-info');
        if (locationInfo) {
            locationInfo.innerHTML = message;
        }
    }

    static showMapError(mapId, message) {
        const mapContainer = document.getElementById(mapId);
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="error" style="height: 400px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                    <div style="margin-bottom: 1rem;">🗺️</div>
                    <div>${message}</div>
                    <button onclick="location.reload()" class="btn" style="margin-top: 1rem;">Retry</button>
                </div>
            `;
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

    static cleanup() {
        try {
            if (this.storiesMap) {
                this.storiesMap.remove();
                this.storiesMap = null;
            }
            
            if (this.locationMap) {
                this.locationMap.remove();
                this.locationMap = null;
            }
            
            this.selectedMarker = null;
            
            console.log('Map presenter cleaned up');
            
        } catch (error) {
            console.error('Error during map cleanup:', error);
        }
    }
}

// Handle window resize to invalidate map size
window.addEventListener('resize', () => {
    setTimeout(() => {
        if (MapPresenter.storiesMap) {
            MapPresenter.storiesMap.invalidateSize();
        }
        if (MapPresenter.locationMap) {
            MapPresenter.locationMap.invalidateSize();
        }
    }, 100);
});

// Cleanup maps when page unloads
window.addEventListener('beforeunload', () => {
    MapPresenter.cleanup();
});