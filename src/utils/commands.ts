import packageJson from '../../package.json';
import themes from '../../themes.json';
import { history } from '../stores/history';
import { theme } from '../stores/theme';

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

Type 'help' to see list of available commands.
`,
};
