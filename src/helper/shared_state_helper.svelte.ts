interface PageStatusIntf {
	isLogin: boolean;
	waitFetch: boolean;
}

const pageStatus: PageStatusIntf = $state({
	isLogin: false,
	waitFetch: false
});

export { pageStatus };
export type { PageStatusIntf };
