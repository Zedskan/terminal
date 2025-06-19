<script lang="ts">
  import { history } from '../stores/history';
  import { theme } from '../stores/theme';
  import Ps1 from './Ps1.svelte';
  import { marked } from 'marked';
  import { onMount } from 'svelte';
  

   // Configura opciones (con anotaciones para TypeScript)
  onMount(() => {
    marked.setOptions({
      breaks: true,
      gfm: true

    });
  });

  function renderMarkdown(content: string): string {
    return marked.parse(content) as string;
  }

  function isMarkdownOutput(output: any): output is { type: 'markdown', content: string } {
    return typeof output === 'object' && output.type === 'markdown';
  }
</script>

{#each $history as { command, outputs }}
  <div style={`color: ${$theme.foreground}`}>
    <div class="flex flex-col md:flex-row">
      <Ps1 />

      <div class="flex">
        <p class="visible md:hidden">❯</p>

        <p class="px-2">{command}</p>
      </div>
    </div>

    {#each outputs as output}
      {#if isMarkdownOutput(output)}
        <div class="markdown-content px-2 py-2">
          {@html renderMarkdown(output.content)}
        </div>
      {:else}
        <p class="whitespace-pre px-2">
          {output}
        </p>
      {/if}
    {/each}
  </div>
{/each}

<style>
  :global(.markdown-content) {
    line-height: 1.6;
  }

  :global(.markdown-content h1) {
    font-size: 1.5em;
    font-weight: bold;
    margin: 1em 0 0.5em 0;
    border-bottom: 2px solid currentColor;
    padding-bottom: 0.3em;
  }

  :global(.markdown-content h2) {
    font-size: 1.3em;
    font-weight: bold;
    margin: 1em 0 0.5em 0;
    border-bottom: 1px solid currentColor;
    padding-bottom: 0.2em;
  }

  :global(.markdown-content h3) {
    font-size: 1.1em;
    font-weight: bold;
    margin: 0.8em 0 0.4em 0;
  }

  :global(.markdown-content p) {
    margin: 0.5em 0;
  }

  :global(.markdown-content pre) {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1em 0;
    border-left: 3px solid currentColor;
  }

  :global(.markdown-content code) {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
  }

  :global(.markdown-content pre code) {
    background-color: transparent;
    padding: 0;
  }

  :global(.markdown-content ul, .markdown-content ol) {
    margin: 0.5em 0;
    padding-left: 2em;
  }

  :global(.markdown-content li) {
    margin: 0.2em 0;
  }

  :global(.markdown-content blockquote) {
    border-left: 3px solid currentColor;
    padding-left: 1em;
    margin: 1em 0;
    opacity: 0.8;
  }

  :global(.markdown-content img) {
    max-width: 100%;
    height: auto;
    margin: 1em 0;
    border-radius: 4px;
  }

  :global(.markdown-content a) {
    color: #4a9eff;
    text-decoration: underline;
  }

  :global(.markdown-content table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  :global(.markdown-content th, .markdown-content td) {
    border: 1px solid currentColor;
    padding: 0.5em;
    text-align: left;
  }

  :global(.markdown-content th) {
    background-color: rgba(0, 0, 0, 0.1);
    font-weight: bold;
  }
</style>