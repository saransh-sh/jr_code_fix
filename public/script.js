/**
 * executive_workspace Interactive Controls Script
 * Handles custom clicks, settings opening, profile drawer toggles, and theme customization.
 */

console.log('script.js loaded successfully.');

document.addEventListener('DOMContentLoaded', () => {
    // 1. Locate components using document.querySelectorAll as requested
    const themeSwitcherButtons = document.querySelectorAll('.flex.items-center.bg-surface-container button');
    const settingsButtons = document.querySelectorAll('[data-icon="settings"]');
    const profileButtons = document.querySelectorAll('[data-icon="account_circle"]');
    const paletteButtons = document.querySelectorAll('[data-icon="palette"]');

    // 2. Add click event listener to each Settings Button
    settingsButtons.forEach((btn, index) => {
        btn.addEventListener('click', (event) => {
            console.log(`[SUCCESS] Settings button click registered. Button index: ${index}`);
            
            // Interactive UI feedback
            showWorkspaceNotice('Settings Panel', 'Configuring workspace environment variables...');
        });
    });

    // 3. Add click event listener to each Theme Switcher Button
    // 3. Add click event listener to Analytics button
const analyticsBtn = document.getElementById('analytics-btn');
if (analyticsBtn) {
    analyticsBtn.addEventListener('click', () => {
        console.log('[SUCCESS] Analytics clicked.');
        alert("Analytics panel active.");
    });
}
    themeSwitcherButtons.forEach((btn, index) => {
        btn.addEventListener('click', (event) => {
            const themeTitle = btn.getAttribute('title') || 'Default';
            console.log(`[SUCCESS] Theme Switcher button clicked. Theme chosen: ${themeTitle} (Index: ${index})`);
            
            // Notice feedback on accent change
            showWorkspaceNotice('Theme Shifted', `Active palette accent configured to ${themeTitle}.`);
        });
    });

    // 4. Add click event listener to each Profile Icon Button
    profileButtons.forEach((btn, index) => {
        btn.addEventListener('click', (event) => {
            console.log(`[SUCCESS] Profile icon button click registered. Button index: ${index}`);
            
            // Interactive UI feedback
            showWorkspaceNotice('Profile Drawer', 'Retrieving active operator profile data...');
        });
    });

    // Optional: Add click event listener to Palette Icon Button if needed
    paletteButtons.forEach((btn, index) => {
        btn.addEventListener('click', (event) => {
            console.log(`[SUCCESS] Palette icon clicked. Button index: ${index}`);
            showWorkspaceNotice('Palette Customizer', 'Opening theme color layout settings...');
        });
    });
});

/**
 * Renders a visual alert banner (notice) at the top of the interface
 * to simulate high-fidelity retro UI interactions.
 */
function showWorkspaceNotice(title, message) {
    // Check if notice banner already exists, remove it
    const existingNotice = document.getElementById('workspace-notice');
    if (existingNotice) {
        existingNotice.remove();
    }

    // Create notice element
    const notice = document.createElement('div');
    notice.id = 'workspace-notice';
    notice.className = 'fixed bottom-4 left-4 z-50 bg-surface-container-high border border-primary-fixed text-primary-fixed px-md py-sm font-label-sm flex flex-col gap-xs transition-transform duration-300 transform translate-y-20';
    
    // Inline styling to match retro style
    Object.assign(notice.style, {
        boxShadow: '0 0 10px rgba(195, 244, 0, 0.2)',
        fontFamily: "'Space Mono', monospace",
        fontSize: '12px',
        maxWidth: '350px'
    });

    notice.innerHTML = `
        <div class="flex justify-between items-center border-b border-primary-fixed/20 pb-xs">
            <span class="font-bold uppercase">&gt; ${title}</span>
            <span class="cursor-pointer hover:text-white" onclick="this.parentElement.parentElement.remove()">[X]</span>
        </div>
        <p class="text-on-surface opacity-90">${message}</p>
    `;

    document.body.appendChild(notice);

    // Slide up notice
    setTimeout(() => {
        notice.classList.remove('translate-y-20');
    }, 50);

    // Automatically remove after 4 seconds
    setTimeout(() => {
        if (document.body.contains(notice)) {
            notice.classList.add('translate-y-20');
            setTimeout(() => notice.remove(), 300);
        }
    }, 4000);
}

// Function to show the chosen view and hide others
function showView(viewId) {
    // Hide all view containers
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('analytics-view').classList.add('hidden');
    document.getElementById('portfolio-view').classList.add('hidden');
    document.getElementById('reports-view').classList.add('hidden');

    // Remove 'hidden' from the chosen one
    document.getElementById(viewId).classList.remove('hidden');

    // Add click listeners to your sidebar buttons
    document.getElementById('dashboard-btn').addEventListener('click', () => showView('dashboard-view'));
    document.getElementById('analytics-btn').addEventListener('click', () => showView('analytics-view'));
    document.getElementById('portfolio-btn').addEventListener('click', () => showView('portfolio-view'));
    document.getElementById('reports-btn').addEventListener('click', () => showView('reports-view'));
}