import { createProxyMiddleware } from "http-proxy-middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

const proxy = createProxyMiddleware({
	target: "https://sepolia.beaconcha.in",
	changeOrigin: true,
	pathRewrite: {
		"^/api/gastrack": "",
	},
});

const proxyRequestHandler = (req: NextApiRequest, res: NextApiResponse) => {
	return new Promise((resolve, reject) => {
		proxy(req, res, result => {
			if (result instanceof Error) {
				return reject(result);
			}
			return resolve(result);
		});
	});
};

export async function GET(req: Request) {
	const res = NextResponse.next();
	await proxyRequestHandler(
		req as unknown as NextApiRequest,
		res as unknown as NextApiResponse
	);
	return res;
}
