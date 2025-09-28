
import { fetchData, type Timestamp } from '../helper/firebase_helper';

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


const getDataProcess = async () => {
    
    const deviceList: DeviceData[] = [];

    // fetch machine uptime heartbeat data
    try {
        const machineUptimeList = await fetchData('machine-uptime');
        for (const rawData of machineUptimeList) {
            // try {
                
            // } catch (error) {
            //     console.log("Found error when parsing data")
            // }

            const data: RawDeviceData = rawData as RawDeviceData;

            const date = new Date();
            const updateIntervalMs = data.interval_min * 60 * 1000;
            const lastUpdate = data.last_update;

            const isExpired = date.getTime() - lastUpdate.toDate().getTime() > updateIntervalMs;

            const machineName = data.machine_id;
            const formattedData: DeviceData = {
                displayName:
                    machineName.length > 10 ? machineName.substring(0, 10) + '...' : machineName,
                machineName: machineName,
                localIp: data.local_ip || '-',
                publicIp: data.public_ip || '-',
                lastUpdate: data.last_update.toDate(),
                osType: data.os_type || 'Unknown',
                expired: isExpired,
                uptimeDateList: []
            };
            deviceList.push(formattedData);
        }

        // draw downtime graph
        const dateList = [];
        const timerange = 7;
        for (let i = timerange - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            dateList.push(dateKey);

            for (const deviceData of deviceList) {
                deviceData.uptimeDateList.push(0)
            }

        }

    } catch (fetchError) {
        console.log('Error fetching data: ', fetchError);
    }
    
    return deviceList;
}

export {
    getDataProcess
}

export type {
    DeviceData
}