<script>
  import { link } from "svelte-spa-router";

  import { formatDate, formatSearchResult } from "./lib";

  export let entry;
  export let isActive;
  export let searchQuery;
</script>

<a
  use:link={`/note/${entry.id}`}
  href="/"
  class="uk-card uk-card-small uk-card-default uk-card-body uk-margin-top {isActive
    ? 'uk-card-primary'
    : 'uk-card-hover'}"
>
  <h6 class="date">{formatDate(entry.updated_at || entry.created_at)}</h6>
  <h4 class="title">
    {@html formatSearchResult(entry.title, searchQuery) || "<em>без заголовка</em>"}
  </h4>
</a>

<style>
  .date {
    font-style: italic;
  }
  .title {
    margin-top: 0;
  }
</style>
