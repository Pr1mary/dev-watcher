<script lang="ts">
    import { Badge, Card, CardBody, CardTitle, Col, Container, Row } from '@sveltestrap/sveltestrap';
    import { fetchData } from "../helper/firebase_helper";
	import { pageStatus } from '../helper/shared_state.svelte';

    interface RawDeviceData {
        group_id: string
        interval_min: number
        last_update: Date
        machine_id: string
        local_ip: string
        public_ip: string
    }

    interface DeviceData {
        displayName: string
        machineName: string
        publicIp: string
        localIp: string
        expired: boolean
    }

    const deviceList: DeviceData[] = $state([])

    $effect(() => {
        if (pageStatus.isLogin) {
            fetchData("machine-uptime")
            .then(rawDataList => {
                for (const data of rawDataList) {
                    const machineName = (data as RawDeviceData).machine_id
                    const formattedData: DeviceData = {
                        displayName: (machineName.length > 10)? machineName.substring(0, 10)+"...":machineName,
                        machineName: machineName,
                        localIp: (data as RawDeviceData).local_ip,
                        publicIp: (data as RawDeviceData).public_ip,
                        expired: false
                    }
                    deviceList.push(formattedData);
                }
            })
            .catch(error => {
                console.log("Error fetching data: ", error)
            });
        }

        return () => {
            while (deviceList.length > 0) {
                deviceList.pop();
            }
        };
    });
</script>

<Container>
    {#each deviceList as data}
    <Card body class="m-3 shadow">
        <CardTitle>
            <div class="d-flex justify-content-between">
                <div>{data.displayName}</div>
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
            Machine ID: <strong>{data.machineName}</strong><br>
            Public IP: <strong>{data.publicIp}</strong><br>
            Local IP: <strong>{data.localIp}</strong>
        </CardBody>
    </Card>
    {/each}
</Container>
