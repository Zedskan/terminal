<script lang="ts">
  import { afterUpdate, onMount } from 'svelte';
  import { history } from '../stores/history';
  import { theme } from '../stores/theme';
  import { commands } from '../utils/commands';
  import { track } from '../utils/tracking';

  let command = '';
  let historyIndex = -1;
  let lastExecutedCommand = '';
  let lastCommandRef: HTMLDivElement | null = null;


  let clickStartTime: number;

  let input: HTMLInputElement;

  onMount(() => {
    input.focus();

    if ($history.length === 0) {
      const command = commands['banner'] as () => string;

      if (command) {
        const output = command();

        $history = [...$history, { command: 'banner', outputs: [output] }];
      }
    }
  });

  afterUpdate(() => {
    if (lastExecutedCommand === 'read' && lastCommandRef) {
      lastCommandRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
      lastCommandRef = null;
    } else {
      input.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  });

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        const [commandName, ...args] = command.split(' ');
        lastExecutedCommand = commandName;


      if (import.meta.env.VITE_TRACKING_ENABLED === 'true') {
        track(commandName, ...args);
      }

      const commandFunction = commands[commandName];

      if (commandFunction) {
        const output = await commandFunction(args);

        if (commandName !== 'clear') {
          // Handle both string and markdown object outputs
          const outputArray = Array.isArray(output) ? output : [output];
          $history = [...$history, { command, outputs: outputArray }];
        }
      } else {
        const output = `${commandName}: command not found`;

        $history = [...$history, { command, outputs: [output] }];
      }

      command = '';
    } else if (event.key === 'ArrowUp') {
      if (historyIndex < $history.length - 1) {
        historyIndex++;

        command = $history[$history.length - 1 - historyIndex].command;
      }

      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      if (historyIndex > -1) {
        historyIndex--;
        command =
          historyIndex >= 0
            ? $history[$history.length - 1 - historyIndex].command
            : '';
      }
      event.preventDefault();
    } else if (event.key === 'Tab') {
      event.preventDefault();

      const autoCompleteCommand = Object.keys(commands).find((cmd) =>
        cmd.startsWith(command),
      );

      if (autoCompleteCommand) {
        command = autoCompleteCommand;
      }
    } 
  };
  function handleGlobalKeys(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      history.set([]); // limpia el store
      input.focus();
    } 
  }
</script>


<svelte:window on:keydown={handleGlobalKeys} />



<div class="flex w-full">
  <p class="visible md:hidden">❯</p>

  <input
    id="command-input"
    name="command-input"
    aria-label="Command input"
    class="w-full px-2 bg-transparent outline-none"
    type="text"
    style={`color: ${$theme.foreground}`}
    bind:value={command}
    on:keydown={handleKeyDown}
    bind:this={input}
  />
</div>