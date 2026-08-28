function checkVerification() {
    const isVerified = localStorage.getItem('browser_verified');
    if (!isVerified) {
        showVerificationModal();
    }
}

function showVerificationModal() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const expectedAnswer = num1 + num2;

    const overlay = document.createElement('div');
    overlay.id = 'verification-overlay';
    overlay.innerHTML = `
        <div class="verification-card">
            <h2 style="color: var(--main-red); margin-top:0;">Browser Security Check</h2>
            <p>Please solve this challenge to verify your browser session:</p>
            <div class="captcha-box">${num1} + ${num2} = ?</div>
            <input type="number" id="captcha-answer" placeholder="Enter answer" style="width: 100%; padding: 8px; margin-bottom: 12px; font-size: 14px;">
            <button id="verify-btn" style="background: var(--posting-bar-orange); color: white; border: none; padding: 8px 16px; font-weight: bold; width: 100%; cursor: pointer;">Verify Human</button>
            <p id="captcha-error" style="color: red; margin-top: 8px; display: none; font-size: 11px;">Incorrect answer. Try again.</p>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('verify-btn').addEventListener('click', function() {
        const ans = parseInt(document.getElementById('captcha-answer').value, 10);
        if (ans === expectedAnswer) {
            localStorage.setItem('browser_verified', 'true');
            overlay.remove();
        } else {
            document.getElementById('captcha-error').style.display = 'block';
        }
    });
}

document.addEventListener('DOMContentLoaded', checkVerification);
