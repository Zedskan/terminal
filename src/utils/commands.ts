import packageJson from '../../package.json';
import themes from '../../themes.json';
import { history } from '../stores/history';
import { theme } from '../stores/theme';
import { writeupEvents, categories, getWriteupEventsByCategory, getWriteupEventById } from '../writeups';

const hostname = window.location.hostname;

type CommandOutput = string | { type: 'markdown', content: string };
type CommandFunction = (args: string[]) => Promise<CommandOutput> | CommandOutput;

export const commands: Record<string, CommandFunction> = {
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

  // Main writeups command - updated for events
  writeups: (args: string[]) => {
    if (args.length === 0) {
      // Show all writeup events organized by platform/date
      let output = 'AVAILABLE CTF WRITEUPS\n\n';
      
      // Group by platform
      const platforms = [...new Set(writeupEvents.map(event => event.platform))];
      
      platforms.forEach(platform => {
        const platformEvents = writeupEvents.filter(event => event.platform === platform);
        if (platformEvents.length > 0) {
          output += `${platform.toUpperCase()} EVENTS\n`;
          output += '='.repeat(50) + '\n';
          
          platformEvents.forEach(event => {
            const difficultyMarker = event.difficulty === 'Easy' ? '[E]' : 
                                   event.difficulty === 'Medium' ? '[M]' : 
                                   event.difficulty === 'Hard' ? '[H]' : '[MIX]';
            output += `${difficultyMarker} [${event.id}] ${event.title}\n`;
            output += `    Date: ${event.date} | Event: ${event.event}\n`;
            output += `    Categories: ${event.categories.join(', ')} | Challenges: ${event.challengeCount}\n`;
            output += `    Tags: ${event.tags.join(', ')}\n`;
            output += `    Description: ${event.description}\n\n`;
          });
        }
      });
      
      output += '\nTip: Use "read <event-id>" to read a specific CTF writeup';
      output += '\nTip: Use "writeups <category>" to filter by category';
      
      return output;
    } else {
      // Filter by specific category
      const category = args[0].toLowerCase();
      const categoryInfo = categories.find(c => c.name === category);
      
      if (!categoryInfo) {
        return `Error: Category '${category}' not found.\nAvailable categories: ${categories.map(c => c.name).join(', ')}`;
      }
      
      const categoryEvents = getWriteupEventsByCategory(category);
      
      if (categoryEvents.length === 0) {
        return `No writeup events available in category '${category}' yet.`;
      }
      
      let output = `${category.toUpperCase()} - ${categoryInfo.description}\n`;
      output += '='.repeat(60) + '\n\n';
      
      categoryEvents.forEach(event => {
        const difficultyMarker = event.difficulty === 'Easy' ? '[E]' : 
                               event.difficulty === 'Medium' ? '[M]' : 
                               event.difficulty === 'Hard' ? '[H]' : '[MIX]';
        output += `${difficultyMarker} [${event.id}] ${event.title}\n`;
        output += `    Date: ${event.date} | Platform: ${event.platform}\n`;
        output += `    Event: ${event.event} | Challenges: ${event.challengeCount}\n`;
        output += `    Tags: ${event.tags.join(', ')}\n`;
        output += `    Description: ${event.description}\n\n`;
      });
      
      output += `\nTip: Use "read <event-id>" to read any of these CTF writeups`;
      
      return output;
    }
  },

  // Updated read command for events
  read: async (args: string[]): Promise<CommandOutput> => {
    if (args.length === 0) {
      return 'Usage: read <event-id>\nExample: read hacktheboo-2024';
    }
    
    const eventId = args[0];
    const event = getWriteupEventById(eventId);
    
    if (!event) {
      return `Error: CTF writeup '${eventId}' not found.\nUse 'writeups' to see all available writeups.`;
    }
    
    try {
      // Try to load the markdown file content
      const response = await fetch(event.filePath);
      
      if (!response.ok) {
        throw new Error('Could not load file');
      }
      
      const content = await response.text();
      
      // Create header information as markdown
      const headerMarkdown = `# ${event.title}

**Date:** ${event.date}  
**Platform:** ${event.platform}  
**Event:** ${event.event}  
**Categories:** ${event.categories.join(', ')}  
**Challenges Solved:** ${event.challengeCount}  
**Difficulty:** ${event.difficulty}  
**Tags:** ${event.tags.join(', ')}  

---

`;
      
      // Combine header with the actual content
      const fullContent = headerMarkdown + content;
      
      // Return as markdown object
      return {
        type: 'markdown' as const,
        content: fullContent
      };
      
    } catch (error) {
      // For errors, still return plain text
      return `Error loading writeup: ${error}\n\nExample content for '${event.title}':\n\n${getExampleEventContent(event)}`;
    }
  },

  // Command to show categories
  categories: () => {
    let output = 'AVAILABLE CATEGORIES\n\n';
    
    categories.forEach(cat => {
      const count = getWriteupEventsByCategory(cat.name).length;
      output += `${cat.name.toUpperCase().padEnd(12)} - ${cat.description} (${count} events)\n`;
    });
    
    output += '\nTip: Use "writeups <category>" to view CTF events from a specific category';
    
    return output;
  },

  // Rest of your commands remain the same...
  about: () => {
    return `
     ▄▄▄· ▄▄▄▄·       ▄• ▄▌▄▄▄▄▄    • ▌ ▄ ·. ▄▄▄ .▄▄ 
    ▐█ ▀█ ▐█ ▀█▪▪     █▪██▌•██      ·██ ▐███▪▀▄.▀·██▌
    ▄█▀▀█ ▐█▀▀█▄ ▄█▀▄ █▌▐█▌ ▐█.▪    ▐█ ▌▐▌▐█·▐▀▀▪▄▐█·
    ▐█ ▪▐▌██▄▪▐█▐█▌.▐▌▐█▄█▌ ▐█▌·    ██ ██▌▐█▌▐█▄▄▌.▀ 
     ▀  ▀ ·▀▀▀▀  ▀█▄▀▪ ▀▀▀  ▀▀▀     ▀▀  █▪▀▀▀ ▀▀▀  ▀                                                       
    ================================================

    I break things to understand them.

    My focus is cybersecurity, with an edge honed in offensive tactics.  
    I don't chase titles. I chase depth, truth, and the raw mechanics behind every exploit.

    Core skillset:
    - Web Application Security  
    - Binary Exploitation  
    - Cryptanalysis  
    - Digital Forensics

    Field experience:
    - CTF competitor  
    - Bug bounty hunter  
    - Pentester in training  
    - Obsessed with methodology, not shortcuts

    This site is not just a blog. It's my archive.  
    Every post is a trace, a footprint, a thought turned into action.  
    I document the process, the logic, and the mindset behind the breach.

    If you're here to see impact, scroll.  
    If you're here to collaborate, email me.
    If you're here for y'know, do it.

    Contact: ${packageJson.contributor?.email}  
    GitHub: ${packageJson.contributor?.git}
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
       E#K.     E#t E#t j#f    E#t E#t  f#E.  t#E ,K#f   ,GD;               ..    E#    GEEEEEEEL    .E#t  EW,
     .E#E.      E#t E#tL#i     E#t E#t   t#K: t#E  j#Wi   E#t              ;W,    E#t      L#K      i#W,   E##j 
   .K#D         E#t E#K:       E#t E#t     :K#D#E     ,K#fK#t            G###, ,ffW#Dffj.  t#E   :K#Wf     E#jG#W;  
  .W#G          E#t ED.        E#t E#t      .E##E       j###t          :E####,  ;LW#ELLLf. t#E   i##WLLLLt E#t t##f   
 :W##########Wt E#t t          E#t ..         G#E        .G#t         ;W#DG##,    E#t      t#E    .E#L     E#t  :K#E:   
 :,,,,,,,,,,,,,.,;.            ,;.             fE          ;;        j###DW##,    E#t      t#E      f#E:   E#KDDDD###i
                                                                    G##i,,G##,    E#t      t#E       ,WW;  E#f,t#Wi,,, 
                                                                  :K#K:   L##,    E#t      t#E        .D#; E#t  ;#W:    
                          ED.                                    ;##D.    L##,    E#t       fE          tt DWi   ,KK:  
                          E#Wi        L.                                  ,,,     .,,      ;#t                                             
                      t   E###G.      EW:        ,ft t           .Gt .    .  
           ..       : Ej  E#fD#W;     E##;       t#E Ej         j#W: Di   Dt    GEEEEEEEL
          ,W,     .Et E#, E#t t##L    E###t      t#E E#,      ;K#f   E#i  E#i   ,;;L#K;;.
         t##,    ,W#t E#t E#t  .E#K,  E#fE#f     t#E E#t    .G#D.    E#t  E#t      t#E 
        L###,   j###t E#t E#t    j##f E#t D#G    t#E E#t   j#K;      E#t  E#t      t#E 
      .E#j##,  G#fE#t E#t E#t    :E#K E#t  f#E.  t#E E#t ,K#f   ,GD; E########f.   t#E 
    j#E.  ##f#W,  E#t E#t E#t .D#W;   E#t    ;#W,t#E E#t   .G#D: E#t E#t  E#t      t#E
  .D#L    ###K:   E#t E#t E##D.       E#t     :K#D#E E#t     ,K#fK#t E#t  E#t      t#E
 :K#t     ##D.    E#t E#t E#t         E#t      .E##E E#t       j###t f#t  f#t      t#E 
 ...      #G      ..  E#t L:          ..         G#E E#t        .G#t  ii   ii       fE  
          j           ,;.  

Welcome to my Cybersecurity Blog!
Type 'help' for all available commands.
`,
};

// Helper function for example content
function getExampleEventContent(event: any): string {
  return `
# ${event.title}

## Event Information
- Platform: ${event.platform}
- Event: ${event.event}
- Date: ${event.date}
- Categories: ${event.categories.join(', ')}
- Challenges Solved: ${event.challengeCount}
- Overall Difficulty: ${event.difficulty}

## Overview
${event.description}

## Challenge Writeups
[Your detailed writeups for each challenge would go here]

## Summary
[Your overall thoughts and lessons learned would go here]

---
This is example content. The actual markdown file will be loaded from: ${event.filePath}
  `;
}