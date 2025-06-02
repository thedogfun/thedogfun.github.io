// Initialize Supabase client
const SUPABASE_URL = "https://pnsfnfmrkgalqsvyfuqw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuc2ZuZm1ya2dhbHFzdnlmdXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODA3NzAsImV4cCI6MjA2NDM1Njc3MH0.Ol0QHY--z9EGrQshqSxTUg-I-PwaUZgNJeSFj3oLMAI";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  localStorage.removeItem('totalTokens');
  localStorage.removeItem('userId');
  localStorage.removeItem('accountCreatedAt');
  document.getElementById('castBalance').textContent = '0';
  document.getElementById('totalEarned').textContent = '0';
  document.getElementById('userLogo').src = 'https://iili.io/FHHL8BV.png';
  document.getElementById('registrationPopup').style.display = 'flex';
  document.getElementById('homePage').style.display = 'none';
  document.getElementById('friendsPage').style.display = 'none';
  document.getElementById('leaderboardPage').style.display = 'none';
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
const inviteLinkBase = 'https://castapp.xyz/invite?ref=';
function shareInvite() {
  const userId = localStorage.getItem('userId') || 'user';
  const inviteLink = `${inviteLinkBase}${userId}`;
  if (navigator.share) {
    navigator.share({
      title: 'Join CAST',
      text: 'Join me on CAST and earn rewards! Referral by ' + userId,
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
  const userId = localStorage.getItem('userId') || 'user';
  const inviteLink = `${inviteLinkBase}${userId}`;
  navigator.clipboard.writeText(inviteLink).then(() => {
    alert('Invite link copied to clipboard!');
  });
}

function shareReferLink() {
  shareInvite();
  completeTask(7);
}

// Fetch user data from Supabase and simulate Farcaster API
let farcasterUsername = 'User';
let farcasterAvatar = 'https://iili.io/FHHL8BV.png';
let accountCreatedAt = new Date('2023-10-01');

async function fetchUserData(userId) {
  try {
    // Simulate Farcaster API call (mock data for now)
    const farcasterData = {
      username: `farcasterUser${Math.floor(Math.random() * 1000)}`,
      avatar: 'https://iili.io/FHHL8BV.png', // Mock avatar URL
      created_at: '2023-10-01T00:00:00Z' // Mock account creation date
    };

    // Store in Supabase
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: farcasterData.username,
        avatar: farcasterData.avatar,
        created_at: farcasterData.created_at
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing user data:', error);
      return;
    }

    if (data) {
      farcasterUsername = data.username || 'User';
      farcasterAvatar = data.avatar || 'https://iili.io/FHHL8BV.png';
      accountCreatedAt = new Date(data.created_at);
      localStorage.setItem('accountCreatedAt', accountCreatedAt.toISOString());

      // Update UI with user data
      document.getElementById('userLogo').src = farcasterAvatar;

      // Update leaderboard user data
      updateLeaderboard();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Registration Logic
let initialBalance = parseInt(localStorage.getItem('totalTokens') || 0);
let taskRewards = 0;
let completedTasksCount = 0;
let userId = localStorage.getItem('userId') || null;

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('userLoggedIn')) {
    document.getElementById('registrationPopup').style.display = 'flex';
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('friendsPage').style.display = 'none';
    document.getElementById('leaderboardPage').style.display = 'none';
  } else {
    userId = localStorage.getItem('userId');
    accountCreatedAt = new Date(localStorage.getItem('accountCreatedAt'));
    document.getElementById('registrationPopup').style.display = 'none';
    fetchUserData(userId).then(() => {
      showPage('homePage');
      document.getElementById('castBalance').textContent = initialBalance;
      document.querySelectorAll('.check-btn').forEach(btn => btn.disabled = false);
      updateLeaderboard();
    });
  }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
  // Simulate Farcaster authentication (replace with actual Farcaster SDK integration)
  userId = `farcaster_${Math.floor(Math.random() * 1000000)}`; // Mock Farcaster user ID
  await fetchUserData(userId);

  localStorage.setItem('userLoggedIn', 'true');
  localStorage.setItem('userId', userId);

  const today = new Date('2025-06-02T05:27:00+06:00');
  const diffDays = Math.floor((today - accountCreatedAt) / (1000 * 60 * 60 * 24));
  const availableTokens = diffDays * 25;

  document.getElementById('accountAge').textContent = diffDays;
  document.getElementById('availableTokens').textContent = availableTokens;
  document.getElementById('accountAgeInfo').style.display = 'block';
  document.getElementById('registerBtn').style.display = 'none';
  document.getElementById('claimPopupBtn').style.display = 'block';
});

document.getElementById('claimPopupBtn').addEventListener('click', () => {
  const today = new Date('2025-06-02T05:27:00+06:00');
  const diffDays = Math.floor((today - accountCreatedAt) / (1000 * 60 * 60 * 24));
  const tokensToClaim = diffDays * 25;

  if (tokensToClaim > 0) {
    initialBalance += tokensToClaim;
    localStorage.setItem('totalTokens', initialBalance);

    document.getElementById('castBalance').textContent = initialBalance;
    document.getElementById('totalEarned').textContent = initialBalance;
    document.getElementById('registrationPopup').style.display = 'none';
    document.getElementById('homePage').style.display = 'block';
    document.querySelectorAll('.check-btn').forEach(btn => btn.disabled = false);
    updateLeaderboard();
    alert(`Claimed ${tokensToClaim} tokens!`);
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
    document.getElementById('totalEarned').textContent = totalBalance;
    document.getElementById('completedTasks').textContent = completedTasksCount;
    document.getElementById('totalRewards').textContent = taskRewards;
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
    { id: 'user123', username: 'user123', avatar: 'https://iili.io/FHHL8BV.png', tokens: 3015421 },
    { id: 'user456', username: 'user456', avatar: 'https://iili.io/FHHL8BV.png', tokens: 983167 },
    { id: 'user789', username: 'user789', avatar: 'https://iili.io/FHHL8BV.png', tokens: 546264 },
    { id: 'user101', username: 'user101', avatar: 'https://iili.io/FHHL8BV.png', tokens: 479308 },
    { id: 'user202', username: 'user202', avatar: 'https://iili.io/FHHL8BV.png', tokens: 436877 },
    { id: 'user303', username: 'user303', avatar: 'https://iili.io/FHHL8BV.png', tokens: 412749 },
    { id: 'user404', username: 'user404', avatar: 'https://iili.io/FHHL8BV.png', tokens: 358743 },
    { id: 'user505', username: 'user505', avatar: 'https://iili.io/FHHL8BV.png', tokens: 315007 },
    { id: 'user606', username: 'user606', avatar: 'https://iili.io/FHHL8BV.png', tokens: 286374 },
    { id: 'user707', username: 'user707', avatar: 'https://iili.io/FHHL8BV.png', tokens: 270123 }
  ];
  users.push({ id: userId, username: farcasterUsername, avatar: farcasterAvatar, tokens: initialBalance + taskRewards });
  users.sort((a, b) => b.tokens - a.tokens);

  leaderboardCards.forEach((card, index) => {
    if (index < users.length) {
      const user = users[index];
      card.querySelector('.leaderboard-info p:nth-child(1)').textContent = `#${index + 1} ${user.username}`;
      card.querySelector('.leaderboard-info p.earned').textContent = `${user.tokens} CAST`;
      card.querySelector('img').src = user.avatar;
    }
  });

  const topRank = document.querySelectorAll('.top-rank .user');
  topRank.forEach((user, index) => {
    if (index < 3 && users[index]) {
      user.querySelector('.info').innerHTML = `🥇 ${users[index].username}<br><span>${users[index].tokens} CAST</span>`;
      user.querySelector('.avatar').src = users[index].avatar;
    }
  });

  const userRank = users.findIndex(u => u.id === userId) + 1;
  document.getElementById('userRank').textContent = userRank;
}