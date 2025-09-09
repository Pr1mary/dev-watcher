<script lang="ts">
    import { Badge, Card, CardBody, CardTitle, Col, Row } from '@sveltestrap/sveltestrap';

    let sampleData = [{
        "machineName": "System A",
        "publicIp": "10.0.0.2",
        "localIp": "192.168.1.2",
        "expired": false
    },{
        "machineName": "System B",
        "publicIp": "10.0.0.2",
        "localIp": "192.168.1.2",
        "expired": true
    }];
</script>

{#each sampleData as data}
<Card body class="m-3 shadow">
    <CardTitle>
        <div class="d-flex justify-content-between">
            <div>{data.machineName}</div>
            <div>
                {#if data.expired}
                <Badge class="text-bg-danger">offline</Badge>
                {:else}
                <Badge class="text-bg-success">online</Badge>
                {/if}
            </div>
        </div>
    </CardTitle>
    <CardBody>
        Public IP: {data.publicIp}<br>
        Local IP: {data.localIp}
    </CardBody>
</Card>
{/each}
