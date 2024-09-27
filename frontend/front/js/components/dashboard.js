class DashboardComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <section>
                <h2>Dashboard</h2>
                <p>Welcome to the dashboard!</p>
                <!-- Fetch user data from backend -->
            </section>

            <div>
                <a href=#signin>logout</a>
            </div>
        `;
        // this.checkAuth();
    }

    // async checkAuth() {
    //     const token = localStorage.getItem('authToken');
    //     if (!token) {
    //         window.location.hash = '#login';
    //     } else {
    //         // Optionally fetch user data to personalize dashboard
    //         console.log('User is authenticated');
    //     }
    // }
}

customElements.define('dashboard-component', DashboardComponent);