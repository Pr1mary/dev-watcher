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
		uptime_date_list: Timestamp[];
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
		uptimeDateList: number[]; 
	}
	
	interface StartupData {
		machineName: string;
		timestamp: Date;
	}

	const deviceList: DeviceData[] = $state([]);
	
	let graphLast7DaysCanvas = $state();

	$effect(() => {
		if (pageStatus.isLogin) {
			// set wait fetch flag to true
			pageStatus.waitFetch = true;

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
						expired: isExpired,
						uptimeDateList: [0, 0, 1, 0, 0, 0],
					};
					deviceList.push(formattedData);
				}
				pageStatus.waitFetch = false;
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
						startupDateMap.set(dateKey,[]);
					}

					const startupDataList = startupDateMap.get(dateKey) as StartupData[];
					const startupData: StartupData = {
						machineName: (data as RawStartupData).machine_id,
						timestamp: rawDate,
					}
					startupDataList.push(startupData);
					startupDateMap.set(dateKey, startupDataList);
				}

				// draw downtime graph
				const dateList = [];
				const dataVal = [];
				const timerange = 7;
				for (let i = timerange - 1; i >= 0; i--) {
					const date = new Date();
					date.setDate(date.getDate() - i);
					
					const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
					dateList.push(dateKey);
					
					let downtimeCount = 0;
					const startupDataList = startupDateMap.get(dateKey) as StartupData[] || [];
					
					for (const startupData of startupDataList) {
						downtimeCount += 1;
					}

					dataVal.push(downtimeCount || 0);
				}

				createBarChart(graphLast7DaysCanvas as HTMLElement, dateList, "Total Downtime", dataVal);
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
	{#if pageStatus.waitFetch}
	<div>
		<div><h4>Summary:</h4></div>
		<Card body class="m-3" style="">
			<CardTitle class="placeholder-glow">
					<span class="placeholder col-6"></span>
			</CardTitle>
			<CardBody class="placeholder-glow">
				<span class="placeholder col-9"></span>
				<span class="placeholder col-7"></span>
				<span class="placeholder col-8"></span>
				<span class="placeholder col-7"></span>
			</CardBody>
		</Card>
	</div>

	<div>
		<div><h4>Device List:</h4></div>
		<Card body class="m-3 shadow">
			<CardTitle class="placeholder-glow">
					<span class="placeholder col-6"></span>
			</CardTitle>
			<CardBody class="placeholder-glow">
				<span class="placeholder col-9"></span>
				<span class="placeholder col-7"></span>
				<span class="placeholder col-8"></span>
				<span class="placeholder col-7"></span>
			</CardBody>
			<CardFooter class="placeholder-glow">
				<small><span class="placeholder col-6"></span></small>
			</CardFooter>
		</Card>
	</div>
	{:else if pageStatus.isLogin}
	<div>
		<div><h4>Summary:</h4></div>
		<Card body class="m-3" style="">
			<CardTitle>
				<div class="d-flex justify-content-between">
					<div>Downtime last 7 days:</div>
				</div>
			</CardTitle>
			<CardBody>
				<p></p>
				<div style="height: 200px">
					<canvas bind:this={graphLast7DaysCanvas}></canvas>
				</div>
			</CardBody>
		</Card>
	</div>

	<div class="">
		<div><h4>Device List:</h4></div>
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
					<div>
						Machine ID: <strong>{data.machineName}</strong><br />
						OS Type: <strong>{data.osType}</strong><br />
						Public IP: <strong>{data.publicIp}</strong><br />
						Local IP: <strong>{data.localIp}</strong>
					</div>
				</CardBody>
				<CardFooter>
					<small>Last Update: {data.lastUpdate}</small>
				</CardFooter>
			</Card>
		{/each}
	</div>
	{/if}
</Container>
