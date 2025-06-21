// src/writeups/index.ts
export interface WriteupEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  platform: 'HTB' | 'picoCTF' | 'TryHackMe' | 'CTFd' | 'Other';
  event: string;
  filePath: string;
  categories: string[]; // Categories covered in this event
  challengeCount: number;
  difficulty: 'Mixed' | 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export const writeupEvents: WriteupEvent[] = [
  {
    id: 'hacktheboo-2024',
    title: 'HackTheBoo 2024 - CTF Writeups',
    description: 'Complete writeups for HackTheBoo 2024 CTF challenges including Web, Forensics, and Reversing categories',
    date: '2024-10-24',
    platform: 'HTB',
    event: 'HackTheBoo 2024',
    filePath: '/writeups/events/HACKTHEBOO.md',
    categories: ['web', 'forensics', 'reversing'],
    challengeCount: 6,
    difficulty: 'Mixed',
    tags: ['jwt', 'csp', 'windows-logs', 'evtx', 'wireshark', 'base64', 'compression', 'reverse-engineering', 'hexdump']
  }
  // Add more events here as you complete them
];

export const categories = [
  { name: 'web', description: 'Web Application Security' },
  { name: 'crypto', description: 'Cryptography Challenges' },
  { name: 'pwn', description: 'Binary Exploitation' },
  { name: 'forensics', description: 'Digital Forensics' },
  { name: 'reversing', description: 'Reverse Engineering' },
  { name: 'misc', description: 'Miscellaneous Challenges' }
];

export function getWriteupEventsByCategory(category: string): WriteupEvent[] {
  return writeupEvents.filter(event => event.categories.includes(category));
}

export function getWriteupEventById(id: string): WriteupEvent | undefined {
  return writeupEvents.find(event => event.id === id);
}

export function getAllCategories(): string[] {
  const allCategories = new Set<string>();
  writeupEvents.forEach(event => {
    event.categories.forEach(cat => allCategories.add(cat));
  });
  return Array.from(allCategories);
}