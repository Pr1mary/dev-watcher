<script lang="ts">
    import { Card, Form } from '@sveltestrap/sveltestrap';

    let data = ["test1", "test2", "test3"];
</script>

{#each data as item}
<Card body class="m-3 shadow">
    <p>
        This is content test {item}
    </p>
</Card>
{/each}
