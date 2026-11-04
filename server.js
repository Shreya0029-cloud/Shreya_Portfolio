const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets with caching headers
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Load static databases
const dataDir = path.join(__dirname, 'public', 'assets', 'data');
let profileData = {};
let projectsData = [];
let skillsData = {};

try {
  profileData = JSON.parse(fs.readFileSync(path.join(dataDir, 'profile.json'), 'utf8'));
  projectsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf8'));
  skillsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'skills.json'), 'utf8'));
  console.log('✓ Successfully loaded profile, projects, and skills data.');
} catch (err) {
  console.error('Error loading data files:', err);
}

// In-memory contact messages storage for live demo inspection
const contactMessages = [];

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Shreya Khadekar Portfolio',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// 2. Profile endpoint
app.get('/api/profile', (req, res) => {
  res.json(profileData);
});

// 3. Projects endpoint with category filtering
app.get('/api/projects', (req, res) => {
  const { category, featured } = req.query;
  let results = [...projectsData];

  if (category && category !== 'all') {
    results = results.filter(p => p.category === category);
  }

  if (featured === 'true') {
    results = results.filter(p => p.featured);
  }

  res.json(results);
});

// 4. Single project detail
app.get('/api/projects/:id', (req, res) => {
  const project = projectsData.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// 5. Skills endpoint
app.get('/api/skills', (req, res) => {
  res.json(skillsData);
});

// 6. Contact endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const newEntry = {
    id: 'msg_' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    subject: subject ? subject.trim() : 'Recruiter / Portfolio Inquiry',
    message: message.trim(),
    receivedAt: new Date().toISOString()
  };

  contactMessages.push(newEntry);
  console.log(`[Contact] Received message from ${newEntry.name} (${newEntry.email}): "${newEntry.message.substring(0, 40)}..."`);

  res.json({
    success: true,
    message: `Thank you, ${newEntry.name}! Shreya has received your message and will get back to you at ${newEntry.email} shortly.`,
    entry: newEntry
  });
});

// 7. Interactive Recruiter AI Twin / Chatbot Copilot
app.post('/api/chat', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const q = query.toLowerCase().trim();
  let reply = '';
  let relatedLinks = [];
  let suggestedPrompts = [];

  if (q.includes('why hire') || q.includes('hire shreya') || q.includes('fit') || q.includes('strengths')) {
    reply = "Here's why Shreya is an exceptional hire for Full-Stack, Backend, or AI/ML roles:\n\n" +
      "1. **Production-Ready Engineering**: She has engineered and deployed 10+ end-to-end applications (e.g. FoodNest with 25+ REST APIs, CipherShield SOC, NetSentinel AI Pro NIDS on Render).\n" +
      "2. **Dual-Domain Fluency**: Exceptional bridge between scalable backend/distributed systems (PostgreSQL, FastAPI, Node, Docker, Kafka) and applied AI/ML (RandomForest, Isolation Forest, watsonx, LLMs, RAG with ChromaDB).\n" +
      "3. **Algorithmic Discipline**: 1000+ LeetCode problems solved with deep mastery in DP, Trees, and Graph algorithms.\n" +
      "4. **Enterprise Experience**: Successfully completed high-impact internships at Codec Technologies (Full-Stack) and IBM (watsonx Generative AI).\n" +
      "5. **Leadership & Design**: Serves as Design Head for the Geospatial Club leading 15 engineers and designers.";
    relatedLinks = [
      { text: "FoodNest Repository", url: "https://github.com/Shreya0029-cloud/Foodnest-Fullstack" },
      { text: "LinkedIn Profile", url: "https://linkedin.com/in/shreya-khadekar-b5142328b" },
      { text: "LeetCode Profile", url: "https://leetcode.com/u/vUXivDGDHV/" }
    ];
    suggestedPrompts = ["Tell me about FoodNest architecture", "What did she do at IBM?", "What ML models has she trained?"];
  } else if (q.includes('foodnest') || q.includes('food')) {
    reply = "**FoodNest** is Shreya's production-grade full-stack food delivery ecosystem:\n\n" +
      "• **Architecture**: React (Vite) frontend + Node.js/Express REST API + auto-migrating PostgreSQL database.\n" +
      "• **Key Features**: 3 distinct RBAC user roles (Customer, Vendor, Admin), 25+ REST APIs, GPS distance-sorted kitchen discovery, Razorpay test mode with HMAC-SHA256 signature verification fallback, Cloudinary image uploads, and an integrated AI support chatbot.\n" +
      "• **Security**: Robust JWT authentication, bcrypt password hashing, and granular route guards preventing privilege escalation.";
    relatedLinks = [
      { text: "FoodNest GitHub Repo", url: "https://github.com/Shreya0029-cloud/Foodnest-Fullstack" }
    ];
    suggestedPrompts = ["Tell me about CipherShield", "What is NetSentinel AI Pro?", "View all full-stack skills"];
  } else if (q.includes('ciphershield') || q.includes('fraud')) {
    reply = "**CipherShield** is an AI-powered fintech fraud detection and risk management platform:\n\n" +
      "• **ML Engine**: Scikit-Learn RandomForestClassifier trained to detect transaction anomalies with 98.4% precision.\n" +
      "• **Cryptographic Audit Trail**: Single-writer SHA-256 hash-chain stored in PostgreSQL where each record cryptographically anchors to previous blocks for tamper evidence.\n" +
      "• **Real-Time SOC**: Socket.IO alerts with sub-50ms dispatch latency, impossible-travel velocity heuristics, and simulated Zero-Knowledge SnarkJS proofs.";
    relatedLinks = [
      { text: "CipherShield GitHub Repo", url: "https://github.com/Shreya0029-cloud/Ciphershield" }
    ];
    suggestedPrompts = ["Tell me about NetSentinel", "What is TruthGuard?", "Simulate a fraud check"];
  } else if (q.includes('netsentinel') || q.includes('nids') || q.includes('intrusion') || q.includes('network')) {
    reply = "**NetSentinel AI Pro** is an end-to-end AI-powered Network Intrusion Detection System:\n\n" +
      "• **Ingestion & Features**: Scapy-based PCAP parser extracting 9 high-signal flow features (packet size, SYN/ACK ratios, inter-arrival variance).\n" +
      "• **Hybrid Detection**: Rule-based firewall catches known signatures instantly; Isolation Forest + Random Forest detect novel zero-day anomalies and DoS/SYN flood vectors.\n" +
      "• **Live Deployment**: Containerized with Docker and deployed live on Render with an interactive Networking Laboratory (OSI, Dijkstra, TCP handshake).";
    relatedLinks = [
      { text: "NetSentinel Live Demo", url: "https://netsentinel-ai-pro-yp0k.onrender.com/" },
      { text: "NetSentinel GitHub Repo", url: "https://github.com/Shreya0029-cloud/AI-NIDS-NetSentinel" }
    ];
    suggestedPrompts = ["What is INTERFOG?", "Tell me about TruthGuard", "Check LeetCode rating"];
  } else if (q.includes('ibm') || q.includes('watsonx') || q.includes('internship') || q.includes('experience')) {
    reply = "Shreya has completed two high-impact internships:\n\n" +
      "1. **Full Stack Developer Intern @ Codec Technologies Pvt. Ltd.** (03/2026 – 06/2026):\n" +
      "   • Engineered 8+ RESTful APIs across 3–4 MongoDB models with React, Node, and Express.\n" +
      "   • Implemented JWT & RBAC access control and cut debugging iteration time by 15–20% using GenAI prompts.\n\n" +
      "2. **Generative AI Intern @ IBM SkillsBuild** (04/2025 – 06/2025):\n" +
      "   • Earned 'GEN AI Using IBM watsonx' certification, working with enterprise foundation models and few-shot prompt chaining.\n" +
      "   • Designed AI prompts for automated business workflows with Responsible AI guardrails.";
    relatedLinks = [
      { text: "LinkedIn Profile", url: "https://linkedin.com/in/shreya-khadekar-b5142328b" }
    ];
    suggestedPrompts = ["What are her core skills?", "Tell me about education", "How to contact Shreya?"];
  } else if (q.includes('leetcode') || q.includes('dsa') || q.includes('coding') || q.includes('algorithms')) {
    reply = "Shreya has solved **1000+ Data Structures & Algorithms problems on LeetCode** (Profile: `vUXivDGDHV`).\n\n" +
      "• **Breakdown**: 85+ Easy, 105+ Medium, 15+ Hard.\n" +
      "• **Core Focus**: Dynamic Programming, Trees & BSTs, Graph Traversals (BFS/DFS, Dijkstra), Two Pointers, Sliding Window, and Hash Maps.\n" +
      "• Also achieved 5th Place in GDSC Hackathon 2025 and participated in Smart India Hackathon (SIH) 2025.";
    relatedLinks = [
      { text: "LeetCode Profile", url: "https://leetcode.com/u/vUXivDGDHV/" }
    ];
    suggestedPrompts = ["What are her programming languages?", "Tell me about projects", "Why hire Shreya?"];
  } else if (q.includes('education') || q.includes('vit') || q.includes('cgpa') || q.includes('college')) {
    reply = "Shreya is pursuing her **B.Tech. in Computer Science and Engineering at Vellore Institute of Technology (VIT Vellore)** (2023 – 2027) with an **8.56 CGPA**.\n\n" +
      "• **Prior Academic Record**: 85% in Higher Secondary (11th & 12th Science) and a **flawless 100% aggregate score** in 10th Standard at Holy Cross High School.\n" +
      "• **Leadership**: Design Head of the Geospatial Club leading a 15-member team.";
    suggestedPrompts = ["What certifications does she hold?", "View all projects", "Get resume link"];
  } else if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('reach')) {
    reply = "You can contact Shreya directly through:\n\n" +
      "• **Email**: shreyakhadekar@gmail.com\n" +
      "• **Phone**: +91 9637266237\n" +
      "• **LinkedIn**: linkedin.com/in/shreya-khadekar-b5142328b\n" +
      "• **Location**: Amravati, Maharashtra / Vellore, Tamil Nadu, India\n" +
      "• **Status**: 🟢 Open to Full-Time SWE / AI Engineer roles & internships!";
    relatedLinks = [
      { text: "Send Email", url: "mailto:shreyakhadekar@gmail.com" },
      { text: "LinkedIn Profile", url: "https://linkedin.com/in/shreya-khadekar-b5142328b" }
    ];
    suggestedPrompts = ["Why hire Shreya?", "Tell me about FoodNest", "Download Resume"];
  } else {
    reply = `Thanks for asking about "${query}"! Shreya Khadekar is a CSE undergraduate at VIT Vellore (CGPA 8.56) specializing in Full-Stack Web Development, Scalable Backends, and Applied AI/ML.\n\n` +
      `She has built 10+ projects including **FoodNest** (Full-Stack Food Platform), **CipherShield** (AI Fraud Detection SOC), **NetSentinel AI Pro** (AI NIDS), **TruthGuard** (Multi-Agent Deception Detection), and **Titan Ascent** (3D WebGL game). She has solved 1000+ LeetCode problems and completed internships at Codec Technologies and IBM.`;
    suggestedPrompts = ["Why hire Shreya?", "Tell me about FoodNest", "What ML models has she trained?", "Show LeetCode stats"];
  }

  res.json({
    query,
    reply,
    relatedLinks,
    suggestedPrompts,
    timestamp: new Date().toISOString()
  });
});

// 8. Interactive CLI Terminal Execution Engine
app.post('/api/terminal', (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.json({ output: 'Error: No command provided. Type "help" for a list of commands.' });
  }

  const parts = command.trim().split(' ');
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ').toLowerCase();

  switch (cmd) {
    case 'help':
      return res.json({
        output: [
          '⚡ SHREYA KHADEKAR PORTFOLIO CLI v2.0.0',
          'Available commands:',
          '  whoami          Display brief developer identity & bio',
          '  skills          List full technical skills stack & competencies',
          '  projects        Show all 10+ production and AI projects',
          '  experience      Review internship & leadership track record',
          '  stats           Display LeetCode, GitHub, and academic metrics',
          '  certifications  Show certified credentials (AWS, Google, MS, IBM)',
          '  contact         Show email, phone, location & social links',
          '  cat resume      Print resume synopsis & direct drive link',
          '  sudo hire       Direct recruitment shortcut to initiate interview',
          '  clear           Clear the terminal console'
        ].join('\n')
      });

    case 'whoami':
      return res.json({
        output: `${profileData.name} (${profileData.preferredName})\n${profileData.tagline}\nVIT Vellore CSE (2023–2027) | CGPA: ${profileData.cgpa}\nStatus: ${profileData.availability.badge}`
      });

    case 'skills':
      const skillsOutput = skillsData.categories.map(c => {
        return `[${c.name}]\n` + c.skills.map(s => `  • ${s.name.padEnd(28)} ${s.level}% | ${s.highlight}`).join('\n');
      }).join('\n\n');
      return res.json({ output: skillsOutput });

    case 'projects':
      const projOutput = projectsData.map((p, idx) => {
        return `${(idx + 1).toString().padStart(2, '0')}. ${p.title}\n    Tech: ${p.tags.join(', ')}\n    GitHub: ${p.github}`;
      }).join('\n\n');
      return res.json({ output: projOutput });

    case 'experience':
      const expOutput = profileData.experience.map(e => {
        return `★ ${e.role} @ ${e.company} (${e.period})\n  Badge: ${e.badge}\n` + e.bullets.map(b => `  - ${b}`).join('\n');
      }).join('\n\n');
      return res.json({ output: expOutput });

    case 'stats':
      return res.json({
        output: [
          '📊 SYSTEM & METRICS OVERVIEW:',
          `• LeetCode Problems Solved: ${profileData.leetcode.solvedTotal} (Easy: ${profileData.leetcode.easy}, Med: ${profileData.leetcode.medium}, Hard: ${profileData.leetcode.hard})`,
          `• Production Projects: ${profileData.metrics.projectsCount}`,
          `• Cumulative Code Volume: ${profileData.metrics.linesOfCode}`,
          `• VIT Vellore CGPA: ${profileData.cgpa} / 10.0`,
          `• Hackathon Ranking: 5th Place (GDSC Hackathon 2025), SIH 2025 Participant`,
          `• Team Leadership: Design Head leading 15-member team`
        ].join('\n')
      });

    case 'certifications':
      const certOutput = profileData.certifications.map(c => {
        return `✔ ${c.name} — ${c.issuer} [${c.badge}]`;
      }).join('\n');
      return res.json({ output: certOutput });

    case 'contact':
      return res.json({
        output: [
          `Email:    ${profileData.email}`,
          `Phone:    ${profileData.phone}`,
          `LinkedIn: ${profileData.profiles.linkedin}`,
          `GitHub:   ${profileData.profiles.github}`,
          `LeetCode: ${profileData.profiles.leetcode}`,
          `Location: ${profileData.location}`
        ].join('\n')
      });

    case 'cat':
      if (arg === 'resume' || arg === 'resume.pdf' || arg === 'resume.txt') {
        return res.json({
          output: [
            '📄 RESUME SNAPSHOT — SHREYA RAJENDRA KHADEKAR',
            'Full-Stack & AI Engineer | VIT Vellore CSE 2027 (CGPA 8.3)',
            'Internships: Codec Technologies (Full-Stack) & IBM SkillsBuild (watsonx GenAI)',
            '200+ LeetCode DSA | AWS Cloud Certified | Google Data Analytics Certified',
            '',
            `🔗 Direct Drive Download Link: ${profileData.resumeDriveUrl}`
          ].join('\n')
        });
      }
      return res.json({ output: `cat: file not found: ${arg}. Try "cat resume".` });

    case 'sudo':
      if (arg.includes('hire')) {
        return res.json({
          output: [
            '🚀 [ACCESS GRANTED]: Initiating Fast-Track Recruitment Protocol...',
            'Thank you for considering Shreya Khadekar!',
            `Direct Dispatch: mailto:${profileData.email}?subject=Interview%20Invitation%20for%20Shreya%20Khadekar`,
            `Direct Line: ${profileData.phone}`,
            'Opening calendar dispatch in contact section...'
          ].join('\n')
        });
      }
      return res.json({ output: 'sudo: command not found or insufficient privileges. Try "sudo hire".' });

    default:
      return res.json({
        output: `command not found: "${cmd}". Type "help" for a list of valid commands.`
      });
  }
});

// 9. Interactive Fraud Simulation Endpoint (CipherShield live demo in-browser)
app.post('/api/fraud-simulate', (req, res) => {
  const { amount, location, prevLocation, timeDeltaMinutes, isVpn, deviceChanged } = req.body;

  let riskScore = 0.05;
  const flags = [];

  const parsedAmount = parseFloat(amount) || 100;
  if (parsedAmount > 5000) {
    riskScore += 0.25;
    flags.push(`Unusual High Amount ($${parsedAmount})`);
  }

  if (isVpn) {
    riskScore += 0.30;
    flags.push('Anonymized VPN / Proxy IP detected');
  }

  if (deviceChanged) {
    riskScore += 0.15;
    flags.push('Unrecognized hardware fingerprint & user-agent');
  }

  const deltaMins = parseFloat(timeDeltaMinutes) || 120;
  if (location && prevLocation && location !== prevLocation && deltaMins < 30) {
    riskScore += 0.45;
    flags.push(`Impossible Travel: Moved from ${prevLocation} to ${location} in only ${deltaMins} minutes!`);
  }

  riskScore = Math.min(0.99, Math.max(0.01, riskScore));
  const classification = riskScore >= 0.70 ? 'CRITICAL_FRAUD' : riskScore >= 0.40 ? 'SUSPICIOUS_REVIEW' : 'NORMAL_TRANSACTION';
  const action = riskScore >= 0.70 ? 'BLOCK & REVOKE SESSION' : riskScore >= 0.40 ? 'CHALLENGE WITH 2FA' : 'APPROVE INSTANTLY';

  res.json({
    timestamp: new Date().toISOString(),
    transactionId: 'TX_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    riskScore: parseFloat(riskScore.toFixed(3)),
    riskPercentage: Math.round(riskScore * 100) + '%',
    classification,
    action,
    flags: flags.length > 0 ? flags : ['No risk anomalies detected. Clean transaction baseline.']
  });
});

// Fallback to index.html for client routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Shreya Khadekar Portfolio Server running on port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📦 Ready for Render deployment & GitHub repository upload`);
  console.log(`=======================================================`);
});
