import { deleteData, fetchData, fetchDataCustom, type Timestamp } from '../helper/firebase_helper';

interface RawDeviceData {
	group_id: string;
	interval_min: number;
	last_update: Timestamp;
	uptime_since: Timestamp;
	machine_id: string;
	local_ip: string;
	public_ip: string;
	os_type: string;
	uptime_date_list: Timestamp[];
}

interface RawDowntimeData {
	id: string;
	machine_id: string;
	new_timestamp: Timestamp;
	old_timestamp: Timestamp;
}

interface DeviceData {
	displayName: string;
	machineName: string;
	publicIp: string;
	localIp: string;
	lastUpdate: Date;
	upSince: Date;
	osType: string;
	expired: boolean;
	uptimeDateList: UpdateDateData[];
	daysRange: number;
}

interface UpdateDateData {
	id: string;
	count: number;
	// message: string;
	timestamp: Date;
}

interface DowntimeData {
	machineId: string;
	count: number;
}

const getDataProcess = async () => {
	const deviceList: DeviceData[] = [];

	// fetch machine uptime heartbeat data
	try {
		const machineUptimeList = await fetchData('machine-uptime');
		for (const rawData of machineUptimeList) {
			const data: RawDeviceData = rawData as RawDeviceData;

			const date = new Date();
			const updateIntervalMs = data.interval_min * 60 * 1000;
			const lastUpdate = data.last_update;

			const isExpired = date.getTime() - lastUpdate.toDate().getTime() > updateIntervalMs;

			const machineName = data.machine_id;
			const formattedData: DeviceData = {
				displayName: machineName.length > 10 ? machineName.substring(0, 10) + '...' : machineName,
				machineName: machineName,
				localIp: data.local_ip || '-',
				publicIp: data.public_ip || '-',
				lastUpdate: data.last_update.toDate(),
				osType: data.os_type || 'Unknown',
				expired: isExpired,
				uptimeDateList: [],
				upSince: data.uptime_since ? data.uptime_since.toDate() : new Date(0),
				daysRange: 0
			};
			deviceList.push(formattedData);
		}

		const timerange = 7;
		const machineDowntimeList = await fetchDataCustom('machine-downtime', [
			['new_timestamp', '>', new Date(new Date().getDate() - (timerange - 1))]
		]);
		for (let i = timerange - 1; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);

			const totalDowntimeData: DowntimeData[] = [];

			for (const rawData of machineDowntimeList) {
				const currData = rawData as RawDowntimeData;

				if (date.getDate() !== currData.new_timestamp.toDate().getDate()) {
					continue;
				}

				let currIdx = totalDowntimeData.findIndex((item) => item.machineId == currData.machine_id);
				if (currIdx < 0) {
					totalDowntimeData.push({
						machineId: currData.machine_id,
						count: 0
					});
					currIdx = totalDowntimeData.length - 1;
				}

				totalDowntimeData[currIdx].count += 1;
			}

			for (const deviceData of deviceList) {
				const dateInterval = new Date(date.getTime() - 1 * 60 * 1000);
				const dataId = crypto.randomUUID();

				if (deviceData.lastUpdate < dateInterval) {
					deviceData.uptimeDateList.push({
						id: dataId,
						count: -2,
						// message: "No status since...",
						timestamp: date
					});
				} else if (deviceData.upSince >= date) {
					deviceData.uptimeDateList.push({
						id: dataId,
						count: -1,
						// message: "",
						timestamp: date
					});
				} else {
					const downtimeCount =
						totalDowntimeData.find((item) => item.machineId == deviceData.machineName)?.count || 0;
					deviceData.uptimeDateList.push({
						id: dataId,
						count: downtimeCount,
						// message: "",
						timestamp: date
					});
				}

				deviceData.daysRange = timerange;
			}
		}
	} catch (fetchError) {
		console.log('Error fetching data: ', fetchError);
	}

	return deviceList;
};

const delDeviceProcess = async (machine_id: string) => {
	const result = await deleteData('machine-uptime', machine_id);
	if (!result.success) console.log('Error when removing data: ', result.message);
	return result.success;
}

export { getDataProcess, delDeviceProcess };

export type { DeviceData };
