// src/writeups/index.ts
export interface Writeup {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  date: string;
  filePath: string;
  platform?: 'HTB' | 'picoCTF' | 'TryHackMe' | 'CTFd' | 'Other';
  event?: string;
}

export const writeups: Writeup[] = [
  {
    id: 'sqli-basics',
    title: 'SQL Injection Basic - Login Bypass',
    category: 'web',
    description: 'Exploit SQL injection vulnerability to bypass authentication',
    difficulty: 'Easy',
    tags: ['sqli', 'authentication', 'web'],
    date: '2024-12-15',
    filePath: '/src/writeups/web/sqli-basics.md',
    platform: 'HTB',
    event: 'HackTheBoo 2024'
  },
  {
    id: 'xss-reflected',
    title: 'Reflected XSS in Search Form',
    category: 'web',
    description: 'Find and exploit reflected XSS vulnerability',
    difficulty: 'Easy',
    tags: ['xss', 'javascript', 'web'],
    date: '2024-12-10',
    filePath: '/src/writeups/web/xss-reflected.md',
    platform: 'picoCTF',
    event: 'picoCTF 2024'
  },
  {
    id: 'rsa-challenge',
    title: 'RSA Factorization Challenge',
    category: 'crypto',
    description: 'Factor small RSA numbers to get the flag',
    difficulty: 'Medium',
    tags: ['rsa', 'factorization', 'crypto'],
    date: '2024-12-08',
    filePath: '/src/writeups/crypto/rsa-challenge.md',
    platform: 'TryHackMe',
    event: 'Advent of Cyber 2024'
  },
  {
    id: 'buffer-overflow-basic',
    title: 'Basic Buffer Overflow - Stack Smashing',
    category: 'pwn',
    description: 'Exploit buffer overflow to get shell access',
    difficulty: 'Medium',
    tags: ['buffer-overflow', 'stack', 'pwn'],
    date: '2024-12-05',
    filePath: '/src/writeups/pwn/buffer-overflow-basic.md',
    platform: 'HTB',
    event: 'HackTheBox University CTF'
  },
  {
    id: 'memory-forensics',
    title: 'Memory Dump Analysis with Volatility',
    category: 'forensics',
    description: 'Extract sensitive information from RAM memory dump',
    difficulty: 'Hard',
    tags: ['volatility', 'memory', 'forensics'],
    date: '2024-12-01',
    filePath: '/src/writeups/forensics/memory-forensics.md',
    platform: 'Other',
    event: 'BSides CTF 2024'
  }
];

export const categories = [
  { name: 'web', description: 'Web Application Security' },
  { name: 'crypto', description: 'Cryptography Challenges' },
  { name: 'pwn', description: 'Binary Exploitation' },
  { name: 'forensics', description: 'Digital Forensics' },
  { name: 'misc', description: 'Miscellaneous Challenges' }
];

export function getWriteupsByCategory(category: string): Writeup[] {
  return writeups.filter(w => w.category === category);
}

export function getWriteupById(id: string): Writeup | undefined {
  return writeups.find(w => w.id === id);
}