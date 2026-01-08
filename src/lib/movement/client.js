import { Aptos, Network, AptosConfig } from '@aptos-labs/ts-sdk';

// Configure Aptos client for Movement testnet
const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: 'https://testnet.movementnetwork.xyz/v1',
});

// Create and export the Aptos client instance
export const aptos = new Aptos(config);
