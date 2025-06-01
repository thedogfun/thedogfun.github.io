// Particle animation
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const particles = [];

function createParticle() {
  const particle = {
    x: Math.random() * canvas.width,
    y: canvas.height,
    size: Math.random() * 5 + 2,
    speed: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.3
  };
  particles.push(particle);
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 165, 0, ${p.opacity})`;
    ctx.fill();
    p.y -= p.speed;
    p.opacity -= 0.01;
    if (p.opacity <= 0 || p.y < 0) {
      particles.splice(i, 1);
    }
  }
  if (Math.random() < 0.2) createParticle();
  requestAnimationFrame(animateParticles);
}

animateParticles();

// Dropdown toggle
function toggleDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Logout function
function logout() {
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('lastClaimTime');
  localStorage.removeItem('totalTokens');
  document.getElementById('connectBtn').style.display = 'block';
  document.getElementById('claimBtn').style.display = 'none';
  document.getElementById('castBalance').textContent = '0';
  alert('Logged out successfully!');
  document.getElementById('userDropdown').style.display = 'none';
}

// Page navigation
function showPage(pageId) {
  document.querySelectorAll('.home-page, .friends-page, .leaderboard-page').forEach(page => {
    page.style.display = 'none';
  });
  document.getElementById(pageId).style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[onclick="showPage('${pageId}')"]`).classList.add('active');
}

// Invite functions
const inviteLink = 'https://castapp.xyz/invite?ref=' + (localStorage.getItem('userId') || 'user');
function shareInvite() {
  if (navigator.share) {
    navigator.share({
      title: 'Join CAST',
      text: 'Join me on CAST and earn rewards! Referral by ' + (localStorage.getItem('userId') || 'user'),
      url: inviteLink
    }).catch(err => {
      console.error('Error sharing:', err);
      alert(`Share this invite link: ${inviteLink}`);
    });
  } else {
    alert(`Share this invite link: ${inviteLink}`);
  }
}

function copyInvite() {
  navigator.clipboard.writeText(inviteLink).then(() => {
    alert('Invite link copied to clipboard!');
  });
}

function shareReferLink() {
  shareInvite();
  completeTask(7);
}

// Farcaster connection logic
let initialBalance = parseInt(localStorage.getItem('totalTokens') || 0);
let taskRewards = 0;
let completedTasksCount = 0;
let userId = localStorage.getItem('userId') || 'user' + Math.floor(Math.random() * 1000);
let lastClaimTime = localStorage.getItem('lastClaimTime') ? new Date(localStorage.getItem('lastClaimTime')) : new Date('2023-10-01');

document.getElementById('connectBtn').addEventListener('click', () => {
  const mockCreatedAt = new Date('2023-10-01');
  const today = new Date('2025-06-01T16:18:00+06:00');
  const diffDays = Math.floor((today - mockCreatedAt) / (1000 * 60 * 60 * 24));
  const hoursSinceLastClaim = Math.floor((today - lastClaimTime) / (1000 * 60 * 60));
  const availableTokens = hoursSinceLastClaim;

  localStorage.setItem('userLoggedIn', 'true');
  localStorage.setItem('userId', userId);
  localStorage.setItem('lastClaimTime', lastClaimTime);
  localStorage.setItem('totalTokens', initialBalance);

  document.getElementById('userId').textContent = userId;
  document.getElementById('accountAge').textContent = diffDays;
  document.getElementById('availableTokens').textContent = availableTokens;
  document.getElementById('popup').style.display = 'block';
  document.getElementById('connectBtn').style.display = 'none';
  document.getElementById('claimBtn').style.display = 'block';
  document.getElementById('castBalance').textContent = initialBalance;
  document.querySelectorAll('.check-btn').forEach(btn => btn.disabled = false);
});

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

document.getElementById('claimBtn').addEventListener('click', () => {
  const today = new Date('2025-06-01T16:18:00+06:00');
  const hoursSinceLastClaim = Math.floor((today - lastClaimTime) / (1000 * 60 * 60));
  const tokensToClaim = hoursSinceLastClaim;

  if (tokensToClaim > 0) {
    initialBalance += tokensToClaim;
    lastClaimTime = today;
    localStorage.setItem('totalTokens', initialBalance);
    localStorage.setItem('lastClaimTime', lastClaimTime);
    document.getElementById('castBalance').textContent = initialBalance;
    document.getElementById('totalEarned').textContent = initialBalance;
    updateLeaderboard();
    alert(`Claimed ${tokensToClaim} tokens!`);
  } else {
    alert('No tokens to claim yet.');
  }
});

// Define tasks
const tasks = [
  { id: 1, reward: 100, description: "Follow @CAST on Farcaster", completed: false },
  { id: 2, reward: 200, description: "Join the CAST Telegram group", completed: false },
  { id: 3, reward: 300, description: "Post a message with #CAST on Farcaster", completed: false },
  { id: 4, reward: 500, description: "Invite a friend to join CAST", completed: false },
  { id: 5, reward: 100, description: "Complete your profile on Farcaster", completed: false },
  { id: 6, reward: 200, description: "Participate in the CAST community chat", completed: false },
  { id: 7, reward: 100, description: "Share your CAST referral link", completed: false }
];

function completeTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task && !task.completed) {
    task.completed = true;
    taskRewards += task.reward;
    completedTasksCount += 1;
    const totalBalance = initialBalance + taskRewards;
    document.getElementById('castBalance').textContent = totalBalance;
    document.getElementById('completedTasks').textContent = completedTasksCount;
    document.getElementById('totalRewards').textContent = taskRewards;
    document.getElementById('totalEarned').textContent = totalBalance;
    updateLeaderboard();
    alert(`Task completed! +${task.reward} CAST added to your balance.`);
    const button = document.querySelector(`.check-btn[data-id="${taskId}"]`);
    button.textContent = "Completed";
    button.disabled = true;
    button.style.backgroundColor = "#444";
  }
}

function updateLeaderboard() {
  const leaderboardCards = document.querySelectorAll('.leaderboard-card');
  let users = [
    { id: 'user123', tokens: 3015421 },
    { id: 'user456', tokens: 983167 },
    { id: 'user789', tokens: 546264 },
    { id: 'user101', tokens: 479308 },
    { id: 'user202', tokens: 436877 },
    { id: 'user303', tokens: 412749 },
    { id: 'user404', tokens: 358743 },
    { id: 'user505', tokens: 315007 },
    { id: 'user606', tokens: 286374 },
    { id: 'user707', tokens: 270123 }
  ];
  users.push({ id: userId, tokens: initialBalance + taskRewards });
  users.sort((a, b) => b.tokens - a.tokens);

  leaderboardCards.forEach((card, index) => {
    if (index < users.length) {
      const user = users[index];
      card.querySelector('.leaderboard-info p:nth-child(1)').textContent = `#${index + 1} ${user.id}`;
      card.querySelector('.leaderboard-info p.earned').textContent = `${user.tokens} CAST`;
      card.querySelector('img').src = `https://iili.io/3mONB4f.png`;
    }
  });

  const topRank = document.querySelectorAll('.top-rank .user');
  topRank.forEach((user, index) => {
    if (index < 3 && users[index]) {
      user.querySelector('.info').innerHTML = `🥇 ${users[index].id}<br><span>${users[index].tokens} CAST</span>`;
      user.querySelector('.avatar').src = `https://iili.io/3mONB4f.png`;
    }
  });

  const rankSummary = document.querySelector('.rank-summary p:first-child');
  const userRank = users.findIndex(u => u.id === userId) + 1;
  rankSummary.textContent = `You're ranked #${userRank}`;
}

// Initial page load
if (localStorage.getElementById('userLoggedIn')) {
  document.getElementById('connectBtn').style.display = 'none';
  document.getElementById('claimBtn').style.display = 'block';
  document.getElementById('castBalance').textContent = initialBalance;
  document.querySelectorAll('.check-btn').forEach(btn => btn.disabled = false);
  updateLeaderboard();
} else {
  showPage('homePage');
}