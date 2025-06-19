import packageJson from '../../package.json';
import themes from '../../themes.json';
import { history } from '../stores/history';
import { theme } from '../stores/theme';
import { writeups, categories, getWriteupsByCategory, getWriteupById } from '../writeups';

const hostname = window.location.hostname;

export const commands: Record<string, (args: string[]) => Promise<string> | string> = {
  help: () => 'Available commands: ' + Object.keys(commands).join(', '),
  hostname: () => hostname,
  whoami: () => 'guest',
  date: () => new Date().toLocaleString(),
  vi: () => `why use vi? try 'emacs'`,
  vim: () => `why use vim? try 'emacs'`,
  emacs: () => `why use emacs? try 'vim'`,
  echo: (args: string[]) => args.join(' '),
  sudo: (args: string[]) => {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    return `Permission denied: unable to run the command '${args[0]}' as root.`;
  },

  // Main writeups command
  writeups: (args: string[]) => {
    if (args.length === 0) {
      // Show all writeups organized by category
      let output = 'AVAILABLE WRITEUPS\n\n';
      
      categories.forEach(cat => {
        const categoryWriteups = getWriteupsByCategory(cat.name);
        if (categoryWriteups.length > 0) {
          output += `${cat.name.toUpperCase()} - ${cat.description}\n`;
          output += '='.repeat(50) + '\n';
          
          categoryWriteups.forEach(writeup => {
            const difficultyMarker = writeup.difficulty === 'Easy' ? '[E]' : 
                                   writeup.difficulty === 'Medium' ? '[M]' : '[H]';
            output += `${difficultyMarker} [${writeup.id}] ${writeup.title}\n`;
            output += `    Date: ${writeup.date} | Tags: ${writeup.tags.join(', ')}\n`;
            if (writeup.platform) {
              output += `    Platform: ${writeup.platform}`;
              if (writeup.event) {
                output += ` | Event: ${writeup.event}`;
              }
              output += '\n';
            }
            output += `    Description: ${writeup.description}\n\n`;
          });
        }
      });
      
      output += '\nTip: Use "read <id>" to read a specific writeup';
      output += '\nTip: Use "writeups <category>" to filter by category';
      
      return output;
    } else {
      // Filter by specific category
      const category = args[0].toLowerCase();
      const categoryInfo = categories.find(c => c.name === category);
      
      if (!categoryInfo) {
        return `Error: Category '${category}' not found.\nAvailable categories: ${categories.map(c => c.name).join(', ')}`;
      }
      
      const categoryWriteups = getWriteupsByCategory(category);
      
      if (categoryWriteups.length === 0) {
        return `No writeups available in category '${category}' yet.`;
      }
      
      let output = `${category.toUpperCase()} - ${categoryInfo.description}\n`;
      output += '='.repeat(60) + '\n\n';
      
      categoryWriteups.forEach(writeup => {
        const difficultyMarker = writeup.difficulty === 'Easy' ? '[E]' : 
                               writeup.difficulty === 'Medium' ? '[M]' : '[H]';
        output += `${difficultyMarker} [${writeup.id}] ${writeup.title}\n`;
        output += `    Date: ${writeup.date} | Tags: ${writeup.tags.join(', ')}\n`;
        if (writeup.platform) {
          output += `    Platform: ${writeup.platform}`;
          if (writeup.event) {
            output += ` | Event: ${writeup.event}`;
          }
          output += '\n';
        }
        output += `    Description: ${writeup.description}\n\n`;
      });
      
      output += `\nTip: Use "read <id>" to read any of these writeups`;
      
      return output;
    }
  },

  // Command to read a specific writeup
  // Command to read a specific writeup
read: async (args: string[]) => {
  if (args.length === 0) {
    return 'Usage: read <writeup-id>\nExample: read sqli-basics';
  }
  
  const writeupId = args[0];
  const writeup = getWriteupById(writeupId);
  
  if (!writeup) {
    return `Error: Writeup '${writeupId}' not found.\nUse 'writeups' to see all available writeups.`;
  }
  
  try {
    // Try to load the markdown file content
    const response = await fetch(writeup.filePath);
    
    if (!response.ok) {
      throw new Error('Could not load file');
    }
    
    const content = await response.text();
    
    // Header of the writeup
    let output = `${writeup.title}\n`;
    output += '='.repeat(writeup.title.length) + '\n\n';
    output += `Date: ${writeup.date}\n`;
    output += `Tags: ${writeup.tags.join(', ')}\n`;
    output += `Difficulty: ${writeup.difficulty}\n`;
    output += `Category: ${writeup.category}\n`;
    if (writeup.platform) {
      output += `Platform: ${writeup.platform}\n`;
    }
    if (writeup.event) {
      output += `Event: ${writeup.event}\n`;
    }
    output += '\n' + '-'.repeat(60) + '\n\n';
    
    // Process markdown content to make it terminal-friendly
    const processedContent = content
      // Headers
      .replace(/^# (.*$)/gm, '\n$1\n' + '='.repeat(50))
      .replace(/^## (.*$)/gm, '\n$1\n' + '-'.repeat(30))
      .replace(/^### (.*$)/gm, '\n$1:')
      .replace(/^#### (.*$)/gm, '\n$1:')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '\n[CODE BLOCK]\n$2\n[/CODE BLOCK]\n')
      
      // Inline code
      .replace(/`([^`]+)`/g, '$1')
      
      // Links
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      
      // Lists
      .replace(/^- (.*$)/gm, '  • $1')
      .replace(/^\* (.*$)/gm, '  • $1')
      .replace(/^\d+\. (.*$)/gm, '  $1')
      
      // Remove images (security)
      .replace(/!\[.*?\]\(.*?\)/g, '[IMAGE REMOVED FOR SECURITY]')
      
      // Clean up extra newlines
      .replace(/\n{3,}/g, '\n\n');
    
    output += processedContent;
    
    return output;
    
  } catch (error) {
    return `Error loading writeup: ${error}\n\nExample content for '${writeup.title}':\n\n${getExampleContent(writeup)}`;
  }
},

  // Command to show categories
  categories: () => {
    let output = 'AVAILABLE CATEGORIES\n\n';
    
    categories.forEach(cat => {
      const count = getWriteupsByCategory(cat.name).length;
      output += `${cat.name.toUpperCase().padEnd(12)} - ${cat.description} (${count} writeups)\n`;
    });
    
    output += '\nTip: Use "writeups <category>" to view writeups from a specific category';
    
    return output;
  },

  // Personal information
  about: () => {
    return `
    ABOUT ME
    ========

    Hello! I'm passionate about cybersecurity and ethical hacking.

    Specialties:
    * Web Application Security
    * Binary Exploitation  
    * Cryptography
    * Digital Forensics

    Achievements:
    * Active CTF Player
    * Bug Bounty Hunter
    * Pentester in Training

    Contact: ${packageJson.contributor?.email || 'your-email@example.com'}
    GitHub: ${packageJson.repository?.url || 'https://github.com/your-username'}

    This blog documents my journey in the cybersecurity world.
    Each writeup includes detailed methodology and lessons learned.
    `;
  },

  theme: (args: string[]) => {
    const usage = `Usage: theme [args].
    [args]:
      ls: list all available themes
      set: set theme to [theme]

    [Examples]:
      theme ls
      theme set gruvboxdark
    `;
    if (args.length === 0) {
      return usage;
    }

    switch (args[0]) {
      case 'ls': {
        let result = themes.map((t) => t.name.toLowerCase()).join(', ');
        result += `You can preview all these themes here: ${packageJson.repository.url}/tree/master/docs/themes`;
        return result;
      }

      case 'set': {
        if (args.length !== 2) {
          return usage;
        }

        const selectedTheme = args[1];
        const t = themes.find((t) => t.name.toLowerCase() === selectedTheme);

        if (!t) {
          return `Theme '${selectedTheme}' not found. Try 'theme ls' to see all available themes.`;
        }

        theme.set(t);
        return `Theme set to ${selectedTheme}`;
      }

      default: {
        return usage;
      }
    }
  },
  
  repo: () => {
    window.open(packageJson.repository.url, '_blank');
    return 'Opening repository...';
  },
  
  clear: () => {
    history.set([]);
    return '';
  },
  
  email: () => {
    window.open(`mailto:${packageJson.contributor.email}`);
    return `Opening mailto:${packageJson.contributor.email}...`;
  },
  
  weather: async (args: string[]) => {
    const city = args.join('+');
    if (!city) {
      return 'Usage: weather [city]. Example: weather Brussels';
    }
    const weather = await fetch(`https://wttr.in/${city}?ATm`);
    return weather.text();
  },
  
  exit: () => {
    return 'Please close the tab to exit.';
  },
  
  curl: async (args: string[]) => {
    if (args.length === 0) {
      return 'curl: no URL provided';
    }

    const url = args[0];
    try {
      const response = await fetch(url);
      const data = await response.text();
      return data;
    } catch (error) {
      return `curl: could not fetch URL ${url}. Details: ${error}`;
    }
  },

  banner: () => `                           
            i   t              t   EW:        ,ft         .Gt                      
           LE   Ej             Ej  E##;       t#E        j#W:                     ,
          L#E   E#, t      .DD.E#, E###t      t#E      ;K#f                       Et
         G#W.   E#t EK:   ,WK. E#t E#fE#f     t#E    .G#D.                        E#t                             
        D#K.    E#t E#t  i#D   E#t E#t D#G    t#E   j#K;                          E##t                 f#i j.
       E#K.     E#t E#t j#f    E#t E#t  f#E.  t#E ,K#f   ,GD;               ..    E#W#t GEEEEEEEL    .E#t  EW,
     .E#E.      E#t E#tL#i     E#t E#t   t#K: t#E  j#Wi   E#t              ;W,    E#tfL.,;;L#K;;.   i#W,   E##j 
    .K#E        E#t E#WW,      E#t E#t    ;#W,t#E   .G#D: E#t             j##,    E#t      t#E     L#D.    E###D. 
   .K#D         E#t E#K:       E#t E#t     :K#D#E     ,K#fK#t            G###, ,ffW#Dffj.  t#E   :K#Wfff;  E#jG#W;
  .W#G          E#t ED.        E#t E#t      .E##E       j###t          :E####,  ;LW#ELLLf. t#E   i##WLLLLt E#t t##f  
 :W##########Wt E#t t          E#t ..         G#E        .G#t         ;W#DG##,    E#t      t#E    .E#L     E#t  :K#E: 
 :,,,,,,,,,,,,,.,;.            ,;.             fE          ;;        j###DW##,    E#t      t#E      f#E:   E#KDDDD###i
                                                ,                   G##i,,G##,    E#t      t#E       ,WW;  E#f,t#Wi,,,
                                                                  :K#K:   L##,    E#t      t#E        .D#; E#t  ;#W:   
                                                                 ;##D.    L##,    E#t       fE          tt DWi   ,KK:                                    
                          ;                                      ,,,      .,,     ;#t        :                                                                
                          ED.                                                      :;                                      
                          E#Wi        L.                            
                      t   E###G.      EW:        ,ft t           .Gt .    .  
           ..       : Ej  E#fD#W;     E##;       t#E Ej         j#W: Di   Dt    GEEEEEEEL
          ,W,     .Et E#, E#t t##L    E###t      t#E E#,      ;K#f   E#i  E#i   ,;;L#K;;.
         t##,    ,W#t E#t E#t  .E#K,  E#fE#f     t#E E#t    .G#D.    E#t  E#t      t#E 
        L###,   j###t E#t E#t    j##f E#t D#G    t#E E#t   j#K;      E#t  E#t      t#E 
      .E#j##,  G#fE#t E#t E#t    :E#K:E#t  f#E.  t#E E#t ,K#f   ,GD; E########f.   t#E 
     ;WW; ##,:K#i E#t E#t E#t   t##L  E#t   t#K: t#E E#t  j#Wi   E#t E#j..K#j...   t#E 
    j#E.  ##f#W,  E#t E#t E#t .D#W;   E#t    ;#W,t#E E#t   .G#D: E#t E#t  E#t      t#E
  .D#L    ###K:   E#t E#t E#tiW#G.    E#t     :K#D#E E#t     ,K#fK#t E#t  E#t      t#E
 :K#t     ##D.    E#t E#t E#K##i      E#t      .E##E E#t       j###t f#t  f#t      t#E 
 ...      #G      ..  E#t E##D.       ..         G#E E#t        .G#t  ii   ii       fE  
          j           ,;. E#t                     fE ,;.          ;;                 :
                          L:                       ,                                 

Welcome to my Cybersecurity Blog!

Available commands:
* writeups      - List all available writeups
* writeups web  - List writeups from specific category  
* read <id>     - Read a specific writeup
* categories    - List all categories
* about         - Information about me

Type 'help' for all available commands.
`,
};

// Helper function for example content
function getExampleContent(writeup: any): string {
  return `
# ${writeup.title}

## Challenge Information
- Platform: ${writeup.platform || 'N/A'}
- Event: ${writeup.event || 'N/A'}
- Difficulty: ${writeup.difficulty}
- Category: ${writeup.category}
- Points: TBD

## Description
${writeup.description}

## Methodology
[Your step-by-step methodology would go here]

## Solution
[Your detailed solution would go here]

## Lessons Learned
[Your lessons learned would go here]

---
This is example content. The actual markdown file will be loaded from: ${writeup.filePath}
  `;
}