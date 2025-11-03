<script lang="ts">
	import {
		Badge,
		Button,
		Card,
		CardBody,
		CardFooter,
		CardTitle,
		Container,
		Dropdown,
		DropdownItem,
		DropdownMenu,
		DropdownToggle,
		Icon,
		Row,
		Tooltip
	} from '@sveltestrap/sveltestrap';
	import { pageStatus } from '../helper/shared_state_helper.svelte';
	import { delDeviceProcess, getDataProcess, type DeviceData } from './page_logic';
	import { Chart, type ChartItem } from 'chart.js/auto';
	import { createBarChart } from '../helper/chart_helper';
	import { browser } from '$app/environment';

	let deviceList: DeviceData[] = $state([]);
	let tooltipRefs: unknown[] = $state([]);

	const badgeMouseEvent = (event: Event) => {
		const injectClass = 'fs-5';
		if (event.type === 'mouseenter' && event.currentTarget) {
			const domObj = event.currentTarget as HTMLElement;
			const currClassName = domObj.className.split(' ');
			currClassName.push(injectClass);
			domObj.className = currClassName.join(' ');
		} else if (event.type === 'mouseleave' && event.currentTarget) {
			const domObj = event.currentTarget as HTMLElement;
			const currClassName = domObj.className.split(' ');
			domObj.className = currClassName.filter((val) => val !== injectClass).join(' ');
		}
	};

	const removeDevice = (event: MouseEvent) => {
		const confRemove = confirm("Are you sure you want to remove this device?");
		if (!confRemove) return;
		
		const elemTarget = event.currentTarget as HTMLElement;
		const machineName = elemTarget.getAttribute("data-app-mach-name") || "";
		delDeviceProcess(machineName)
		.then(result => {
			if (result) location.reload();
		})
		.catch(error => {
			console.log("Error found: ", error)
		});
	};

	$effect(() => {
		if (pageStatus.isLogin) {
			// set wait fetch flag to true
			pageStatus.waitFetch = true;

			getDataProcess()
				.then((deviceDataList: DeviceData[]) => {
					deviceList = deviceDataList;
					pageStatus.waitFetch = false;
				})
				.catch((error) => {
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
				{#each deviceList as data, dev_id}
					<div class="col-12 col-xl-6">
						<Card body class="m-3 shadow">
							<CardTitle >
								<div class="d-flex">
									<div class="p-2 align-self-center">
										{#if data.expired}
											<Badge class="text-bg-danger">Offline</Badge>
										{:else}
											<Badge class="text-bg-success">Online</Badge>
										{/if}
									</div>
									<div class="p-2 align-self-center">
										<strong>{data.displayName}</strong>
									</div>
									<div class="ms-auto p-2 align-self-center">
										<Dropdown>
											<DropdownToggle nav class="nav-link">
												<Icon name="three-dots-vertical" />
											</DropdownToggle>
											<DropdownMenu>
												<DropdownItem
												class="link-danger"
												data-app-mach-name={data.machineName}
												onclick={removeDevice}>
													Remove device
												</DropdownItem>
											</DropdownMenu>
										</Dropdown>
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
												{#each data.uptimeDateList as downCount, idx}
													<span>
														<span
															id={`badge-${dev_id}-${idx}`}
															role="button"
															tabindex="0"
															onmouseenter={badgeMouseEvent}
															onmouseleave={badgeMouseEvent}
														>
															{#if downCount.count == -2}
																<Badge class="text-bg-danger">X</Badge>
															{:else if downCount.count == -1}
																<Badge class="text-bg-secondary">?</Badge>
															{:else if downCount.count == 0}
																<Badge class="text-bg-success">0</Badge>
															{:else}
																<Badge class="text-bg-warning">{downCount.count}</Badge>
															{/if}
														</span>

														<Tooltip target={`badge-${dev_id}-${idx}`} placement="bottom">
															<div><strong>{downCount.timestamp.toDateString()}</strong></div>
															<div>
																{#if downCount.count == -2}
																	<strong>System down detected</strong>
																{:else if downCount.count == -1}
																	No history on this day
																{:else if downCount.count == 0}
																	System up without downtime
																{:else}
																	System up with total downtime: <strong>{downCount.count}</strong>
																{/if}
															</div>
														</Tooltip>
													</span>
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
