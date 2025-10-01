<script lang="ts">
	import {
		Badge,
		Card,
		CardBody,
		CardFooter,
		CardTitle,
		Container,

		Row

	} from '@sveltestrap/sveltestrap';
	import { pageStatus } from '../helper/shared_state_helper.svelte';
	import { getDataProcess, type DeviceData } from './page_logic';
	import { Chart, type ChartItem } from 'chart.js/auto';
	import { createBarChart } from '../helper/chart_helper';

	let deviceList: DeviceData[] = $state([]);

	$effect(() => {
		if (pageStatus.isLogin) {

			// set wait fetch flag to true
			pageStatus.waitFetch = true;

			getDataProcess()
			.then((deviceDataList: DeviceData[]) => {
				deviceList = deviceDataList;
				pageStatus.waitFetch = false;
			})
			.catch(error => {
				deviceList = [];
				pageStatus.waitFetch = false;
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
		<Container>
			<Row>
				{#each deviceList as data}
					<div class="col-12 col-xl-6">
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
							<Container>
								<Row>
									<div class="col-12 col-md-6 mb-2">
										Machine ID: <strong>{data.machineName}</strong><br />
										OS Type: <strong>{data.osType}</strong><br />
										Public IP: <strong>{data.publicIp}</strong><br />
										Local IP: <strong>{data.localIp}</strong><br />
									</div>
									<div class="col-12 col-md-6 text-md-end">
										Uptime last 7 days<br />
										{#each data.uptimeDateList as downCount}
											{#if downCount == -2}
												<Badge class="text-bg-danger me-1">X</Badge>
											{:else if downCount == -1}
												<Badge class="text-bg-secondary me-1">?</Badge>
											{:else if downCount == 0}
												<Badge class="text-bg-success me-1">0</Badge>
											{:else}
												<Badge class="text-bg-warning me-1">{downCount}</Badge>
											{/if}
										{/each}
									</div>
								</Row>
							</Container>
						</CardBody>
						<CardFooter>
							<small>Last Update: {data.lastUpdate}</small>
						</CardFooter>
					</Card>
					</div>
				{/each}
			</Row>
		</Container>
	{/if}
</Container>
