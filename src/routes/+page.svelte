<script lang="ts">
	import {
		Badge,
		Button,
		Card,
		CardBody,
		CardFooter,
		CardTitle,
		Container,

		Row,

		Tooltip


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
										Uptime last {data.daysRange} days<br />
										<div class="user-select-none">
											{#each data.uptimeDateList as downCount}
												{#if downCount.count == -2}
												<a href="#" onmousedown={() => console.log("Button click")}>
													<Badge class="text-bg-danger me-1">X</Badge>
												</a>	
												{:else if downCount.count == -1}
												<a href="#" onmousedown={() => console.log("Button click")}>
													<Badge class="text-bg-secondary me-1">?</Badge>
												</a>
												{:else if downCount.count == 0}
												<a href="#" onmousedown={() => console.log("Button click")}>
													<Badge class="text-bg-success me-1">0</Badge>
												</a>
												{:else}
												<a href="#" onmousedown={() => console.log("Button click")}>
													<Badge class="text-bg-warning me-1">{downCount.count}</Badge>
												</a>
												{/if}
											{/each}
										</div>
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
