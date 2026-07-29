const links = [
	['Home', 'index.html'],
	['Calculator', 'pages/calculator.html'],
	['Compare', 'pages/compare.html'],
	['Saved Plans', 'pages/saved-plans.html'],
	['How It Works', 'pages/how-it-works.html'],
	['Articles', 'pages/articles.html'],
	['Case Study', 'pages/case-study.html']
];

function pathToRoot() {
	return location.pathname.includes('/pages/') ? '../' : ''
}

function normalize(href) {
	return href.replace('../', '').replace('./', '')
}
export function renderShell() {
	const root = pathToRoot();
	const current = location.pathname.split('/').pop() || 'index.html';
	const shell = document.querySelector('[data-shell]');
	if (!shell) return;
	const nav = links.map(([label, href]) => `<a class="${normalize(href).endsWith(current)?'active':''}" href="${root}${href}">${label}</a>`).join('');
	shell.insertAdjacentHTML('afterbegin', `

<header class="topbar">
    <div class="wrap nav">
        <a class="brand" href="${root}index.html">
            <img src="${root}assets/logo/airgead-mark.png" alt="Airgead logo"/>
        </a>
        <nav class="links">
            ${nav}
        </nav>
        <div class="nav-actions">
            <a class="btn btn-primary" href="${root}pages/login.html">
                Sign In
            </a>
        </div>
        <button class="menu-toggle" aria-label="Open menu" aria-expanded="false">
            ☰
        </button>
    </div>
    <div class="mobile-panel wrap">
        ${nav}<a href="${root}pages/login.html">Sign In</a>
    </div>
</header>
`); shell.insertAdjacentHTML('beforeend', `

<footer class="footer">
    <div class="wrap footer-grid">
        <div>
		    <a class="brand" href="${root}index.html">
			    <img src="${root}assets/logo/airgead-mark-light.png" alt="Airgead logo"/>
				    <span>
                        Airgead
                    </span>
			</a>
            <p>
                Airgead is a static compound interest calculator that
                demonstrates yearly growth with and without monthly deposits.
            </p>
        </div>
        <div>
            <h4>
                Tools
            </h4>
            <ul>
                <li>
                    <a href="${root}pages/calculator.html">Calculator</a>
                </li>
                <li>
                    <a href="${root}pages/compare.html">Compare Scenarios</a>
                </li>
                <li>
                    <a href="${root}pages/saved-plans.html">Saved Plans</a>
                </li>
            </ul>
        </div>
        <div>
            <h4>
                Project
            </h4>
            <ul>
                <li>
                    <a href="${root}pages/how-it-works.html">How It Works</a>
                </li>
                <li>
                    <a href="${root}pages/case-study.html">Case Study</a>
                </li>
                <li>
                    <a href="${root}pages/articles.html">Articles</a>
                </li>
                <li>
                    <a href="${root}pages/blog.html">Project Notes</a>
                </li>
            </ul>
        </div>
    </div>
    <div class="wrap copyright">
       Airgead Compound Interest Calculator. ©️ ${new Date().getFullYear()} Alysha Pursley. All Rights Reserved.
    </div>
</footer>
<div class="toast" role="status" aria-live="polite">
</div>
`);
	const btn = document.querySelector('.menu-toggle');
	const panel = document.querySelector('.mobile-panel');
	btn?.addEventListener('click', () => {
		panel.classList.toggle('open');
		btn.setAttribute('aria-expanded', panel.classList.contains('open'))
	})
}
export function toast(message) {
	const el = document.querySelector('.toast');
	if (!el) return;
	el.textContent = message;
	el.classList.add('show');
	setTimeout(() => el.classList.remove('show'), 2400)
}
renderShell();
