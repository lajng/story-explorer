// Router - Handles SPA navigation with hash routing
class Router {
    constructor() {
        this.routes = {
            'home': 'home-page',
            'add-story': 'add-story-page'
        };
        
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    handleRouteChange() {
        const hash = window.location.hash.slice(1) || 'home';
        this.navigateToPage(hash);
    }

    navigateToPage(route) {
        // View Transition API for smooth page transitions
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                this.showPage(route);
            });
        } else {
            this.showPage(route);
        }
    }

    showPage(route) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Update navigation active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show target page
        const targetPage = this.routes[route] || this.routes['home'];
        const pageElement = document.getElementById(targetPage);
        const navLink = document.querySelector(`a[href="#${route}"]`);
        
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        if (navLink) {
            navLink.classList.add('active');
        }

        // Initialize page-specific functionality
        this.initializePage(route);
    }

    initializePage(route) {
        switch(route) {
            case 'home':
                if (window.StoryPresenter) {
                    StoryPresenter.loadStories();
                }
                if (window.MapPresenter) {
                    MapPresenter.initStoriesMap();
                }
                break;
            case 'add-story':
                if (window.MapPresenter) {
                    MapPresenter.initLocationMap();
                }
                break;
        }
    }

    navigateTo(route) {
        window.location.hash = route;
    }
}