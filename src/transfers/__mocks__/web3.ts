const events = [
  {
    returnValues: {
      src: 'senderWalletAddress1',
      dst: 'recieverWalletAddress1',
      wad: 1000,
    },
    blockNumber: 1,
  },
  {
    returnValues: {
      src: 'senderWalletAddress2',
      dst: 'recieverWalletAddress2',
      wad: 2000,
    },
    blockNumber: 2,
  },
];
const getPastEvents = jest.fn(() => events);
const on = jest.fn();
const transferMock = jest.fn(() => ({ on }));

const contract = {
  getPastEvents,
  events: { Transfer: transferMock },
};
const Contract = jest.fn(() => contract);
const WebSocketProvider = jest.fn(() => ({ on }));
const Web3 = jest.fn(() => ({
  utils: {
    fromWei: jest.fn().mockReturnValue('1000'),
  },
  eth: {
    getBlock: jest.fn().mockResolvedValue({
      timestamp: 1626623970,
    }),
    Contract,
    getBlockNumber: jest.fn(() => 15000),
  },
  providers: {
    WebsocketProvider: jest.fn(() => 'mWeb3Provider'),
  },
}));

export { Web3, WebSocketProvider, Contract, contract, on };
