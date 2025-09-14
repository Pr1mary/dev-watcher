<script lang="ts">
	import {
		Badge,
		Card,
		CardBody,
		CardFooter,
		CardTitle,
		Container
	} from '@sveltestrap/sveltestrap';
	import { fetchData, type Timestamp } from '../helper/firebase_helper';
	import { pageStatus } from '../helper/shared_state_helper.svelte';
	import { Chart, type ChartItem } from 'chart.js/auto';
	import { createBarChart } from '../helper/chart_helper';

	interface RawDeviceData {
		group_id: string;
		interval_min: number;
		last_update: Timestamp;
		machine_id: string;
		local_ip: string;
		public_ip: string;
		os_type: string;
	}

	interface RawStartupData {
		id: string;
		group_id: string;
		machine_id: string;
		timestamp: Timestamp;
	}

	interface DeviceData {
		displayName: string;
		machineName: string;
		publicIp: string;
		localIp: string;
		lastUpdate: Date;
		osType: string;
		expired: boolean;
	}
	
	interface StartupData {
		id: string;
		machineName: string;
		timestamp: Date;
	}

	const deviceList: DeviceData[] = $state([]);
	
	let graphCanvas = $state();

	$effect(() => {
		if (pageStatus.isLogin) {
			// fetch machine uptime heartbeat data
			fetchData('machine-uptime')
			.then((rawDataList) => {
				for (const data of rawDataList) {
					const date = new Date();
					const updateIntervalMs = (data as RawDeviceData).interval_min * 60 * 1000;
					const lastUpdate = (data as RawDeviceData).last_update;

					const isExpired = date.getTime() - lastUpdate.toDate().getTime() > updateIntervalMs;

					const machineName = (data as RawDeviceData).machine_id;
					const formattedData: DeviceData = {
						displayName:
							machineName.length > 10 ? machineName.substring(0, 10) + '...' : machineName,
						machineName: machineName,
						localIp: (data as RawDeviceData).local_ip || '-',
						publicIp: (data as RawDeviceData).public_ip || '-',
						lastUpdate: (data as RawDeviceData).last_update.toDate(),
						osType: (data as RawDeviceData).os_type || 'Unknown',
						expired: isExpired
					};
					deviceList.push(formattedData);
				}
			})
			.catch((error) => {
				console.log('Error fetching data: ', error);
			});

			// fetch machine startup timestamp log data
			fetchData('machine-wakeup')
			.then((rawDataList) => {

				const startupDateMap = new Map();

				for (const data of rawDataList) {

					const rawDate = (data as RawStartupData).timestamp.toDate();
					const dateKey = `${rawDate.getFullYear()}-${rawDate.getMonth()}-${rawDate.getDate()}`;
					
					if (!startupDateMap.has(dateKey)) {
						startupDateMap.set(dateKey,0);
					}

					let updatedCount = startupDateMap.get(dateKey) as number;
					updatedCount += 1;
					startupDateMap.set(dateKey, updatedCount);
				}

				// draw downtime graph
				const dateList = [];
				const dataVal = [];
				const timerange = 5;
				for (let i = timerange - 1; i >= 0; i--) {
					const date = new Date();
					date.setDate(date.getDate() - i);
					const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
					const downtimeCount = startupDateMap.get(dateKey);
					dateList.push(dateKey);
					dataVal.push(downtimeCount);
				}

				createBarChart(graphCanvas as HTMLElement, "Total Downtime", dateList, dataVal);
			})
			.catch((error) => {
				console.log('Error fetching data: ', error);
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
	{#if pageStatus.isLogin}
	<Card body class="m-3">
		<CardTitle>
			<div class="d-flex justify-content-between">
				<div>uptime status:</div>
			</div>
		</CardTitle>
		<CardBody>
			<canvas bind:this={graphCanvas}></canvas>
		</CardBody>
	</Card>

	<div class="d-flex justify-content-between">
		<div>Device List:</div>
	</div>
	{/if}

	{#each deviceList as data}
		<Card body class="m-3 shadow">
			<CardTitle>
				<div class="d-flex justify-content-between">
					<div><strong>{data.displayName}</strong></div>
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
				Machine ID: <strong>{data.machineName}</strong><br />
				OS Type: <strong>{data.osType}</strong><br />
				Public IP: <strong>{data.publicIp}</strong><br />
				Local IP: <strong>{data.localIp}</strong>
			</CardBody>
			<CardFooter>
				<small>Last Update: {data.lastUpdate}</small>
			</CardFooter>
		</Card>
	{/each}
</Container>
