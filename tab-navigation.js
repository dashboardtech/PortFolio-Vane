function setupTabNavigation(loadCallback) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Update active button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active content
            tabContents.forEach(content => content.classList.remove('active'));
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            if (typeof loadCallback === 'function') {
                loadCallback(targetTab);
            }
        });
    });
}
