import { ConnectButton } from "@rainbow-me/rainbowkit";

// rinkeby: 4
// localhost: 31337
let currentChain = 4;

export const CustomConnectButton = () => {
	return (
		<ConnectButton.Custom>
			{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
				return (
					<div
						{...(!mounted && {
							"aria-hidden": true,
							style: {
								opacity: 0,
								pointerEvents: "none",
								userSelect: "none",
							},
						})}
					>
						{(() => {
							if (!mounted || !account || !chain) {
								return (
									<button
										onClick={openConnectModal}
										type="button"
										className="bg-black text-center py-4 px-6 rounded-sm w-full text-white"
									>
										connect wallet
									</button>
								);
							}
							if (chain.unsupported || currentChain !== chain.id) {
								return (
									<button
										onClick={openChainModal}
										type="button"
										className="bg-black text-center py-4 px-6 rounded-sm w-full text-white"
									>
										Wrong network
									</button>
								);
							}
							return (
								<div>
									<div style={{ display: "flex", gap: 12 }}>
										<button
											onClick={openChainModal}
											style={{ display: "flex", alignItems: "center" }}
											type="button"
										>
											{chain?.hasIcon && (
												<div
													style={{
														background: chain.iconBackground,
														width: 12,
														height: 12,
														borderRadius: 999,
														overflow: "hidden",
														marginRight: 4,
													}}
												>
													{chain?.iconUrl && (
														<img
															alt={chain.name ?? "Chain icon"}
															src={chain.iconUrl}
															style={{ width: 12, height: 12 }}
														/>
													)}
												</div>
											)}
											{chain.name}
										</button>
										<button onClick={openAccountModal} type="button">
											{account.displayName}
											{account.displayBalance ? ` (${account.displayBalance})` : ""}
										</button>
									</div>
								</div>
							);
						})()}
					</div>
				);
			}}
		</ConnectButton.Custom>
	);
};
