/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useRef } from "react";

import Head from "next/head";
import Renderer from "../lib/Renderer";
import { Contract, utils } from "ethers";
import { useAccount, useSigner } from "wagmi";

import { CustomConnectButton } from "../components/CustomConnectButton";

import FFCollection from "../contract.json";
import { create } from "ipfs-http-client";

const delay = 30000;

const projectId = "2BP5ldLm8XVsLkc459zA2l4uWOI";
const projectSecret = "483fb5cf83e22deea60db0eaed9d374d";
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const client = create({
	host: "ipfs.infura.io",
	port: 5001,
	protocol: "https",
	headers: {
		authorization: auth,
	},
});

export default function Home(props) {
	const render = useRef(null);

	const [loading, setLoading] = useState(true);
	const [showUI, setShowUI] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("👀 creating image");
	const [value, setValue] = useState("0.0");

	const [size, setSize] = useState(0);

	const timer = useRef(null);
	const resetButton = useRef(null);

	const { address, isConnected } = useAccount();
	const { data: signer } = useSigner();

	const mint = async () => {
		try {
			if (loading) return;
			clearTimeout(timer.current);
			setLoading(true);

			const metadata = render.current.fetchData();
			setLoadingMessage("🚀 ... uploading to ipfs");

			const payload = metadata.metadata;

			const hash = await client.add(JSON.stringify(payload), {
				pin: true,
			});

			const tokenURI = `https://ipfs.infura.io/ipfs/${hash.path}`;
			setLoadingMessage("💥 minting NFT");

			const contract = new Contract(FFCollection.address, FFCollection.abi, signer);
			await contract.mint(metadata.seed, tokenURI, {
				value: utils.parseEther(value).toString(),
			});

			setLoadingMessage("💪🏻 ... done");
		} catch (error) {
			console.log(error.message);
			setLoading(false);
			setLoadingMessage("Error occured ... 🤯");
		}
	};

	useEffect(() => {
		if (typeof window == "undefined") return;
		if (window.innerWidth > window.innerHeight) {
			setSize(window.innerHeight);
		} else {
			setSize(window.innerWidth);
		}

		window.addEventListener("resize", () => {
			if (window.innerWidth > window.innerHeight) {
				setSize(window.innerHeight);
			} else {
				setSize(window.innerWidth);
			}
		});
	}, []);

	useEffect(() => {
		if (!loading) return;
		timer.current = setTimeout(() => {
			setLoading(false);
		}, delay);

		return () => clearTimeout(timer.current);
	}, [loading]);

	useEffect(() => {
		if (!address && !isConnected) return;
		setShowUI(true);
	}, [address, isConnected]);

	return (
		<div>
			<Head>
				<title>FlowField NFT</title>
				<meta
					name="description"
					content="FlowField NFT - NFT Collection based on noise, color and randomness"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className="flex flex-col tablet:flex-row">
				<div
					className="max-h-screen overflow-hidden relative"
					style={{ height: `${size}px`, width: `${size}px` }}
				>
					{typeof window !== "undefined" && (
						<Renderer
							ref={render}
							size="500"
							resetButton={resetButton}
							onReset={() => {
								clearTimeout(timer.current);
								setLoading(true);
								setLoadingMessage("👀 creating image");
								timer.current = setTimeout(() => {
									setLoading(false);
								}, delay);
							}}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: "100%",
							}}
						/>
					)}
				</div>
				<div className="flex-1 p-4 tablet:p-8 flex items-center w-full">
					<div className="w-full flex flex-col justify-end max-w-[480px] mx-auto">
						<h1 className="text-2xl mb-8 font-bold mt-16">FlowField NFT Collection</h1>
						<p className="mb-16 font-roboto">
							This NFT Collection based on noise, color and randomness. All the NFT are generated offchain
							and uploaded to IPFS and then minted onchain. By clicking the "reset seed" button, you can
							change the seed and generate a new image to your liking. This is totally
							<strong className="font-bolder"> free + gasprice </strong> for minting. If you want, you can
							buy me coffee ☕️
						</p>
						<CustomConnectButton />
						{showUI && (
							<div className="my-8">
								<div className="flex items-center justify-between bg-white rounded-sm mb-4 border-2 border-black">
									<span className="block p-4">eth</span>
									<input
										type="text"
										value={value}
										onChange={(e) => setValue(e.target.value)}
										className="bg-white border-0 outline-none focus:ring-0 focus:outline-none text-right p-4"
									/>
								</div>
								<button
									disabled={loading}
									className="bg-black text-center py-4 px-6 rounded-sm w-full text-white"
									onClick={mint}
								>
									{loading ? loadingMessage : "🚀 mint your NFT"}
								</button>
							</div>
						)}
					</div>
				</div>
				<div className="absolute top-4 right-4 flex items-center gap-2">
					<button ref={resetButton} className="rounded-sm bg-black text-white py-2 px-4 font-roboto">
						🧪 reset seed
					</button>
				</div>
			</main>
		</div>
	);
}
